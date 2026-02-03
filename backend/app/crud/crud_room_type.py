from typing import Sequence

from sqlmodel import Session, select

from app.exceptions import RoomTypeNotFoundError
from app.models.room_types import RoomType, RoomTypeCreate


def create_room_type(*, session: Session, room_type_create: RoomTypeCreate) -> RoomType:
    db_obj = RoomType.model_validate(room_type_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_room_types(*, session: Session, skip: int = 0, limit: int = 100) -> Sequence[RoomType]:
    statement = select(RoomType).offset(skip).limit(limit)
    return session.exec(statement).all()


def get_room_type(*, session: Session, room_type_id: int) -> RoomType | None:
    return session.get(RoomType, room_type_id)


def update_room_type(*, session: Session, room_type_id: int, room_type_update: RoomTypeCreate) -> RoomType:
    db_room_type = session.get(RoomType, room_type_id)
    if not db_room_type:
        raise RoomTypeNotFoundError(room_type_id)
    update_dict = room_type_update.model_dump(exclude_unset=True)
    db_room_type.sqlmodel_update(update_dict)
    session.add(db_room_type)
    session.commit()
    session.refresh(db_room_type)
    return db_room_type


def delete_room_type(*, session: Session, room_type_id: int) -> bool:
    db_room_type = session.get(RoomType, room_type_id)
    if not db_room_type:
        return False
    session.delete(db_room_type)
    session.commit()
    return True
