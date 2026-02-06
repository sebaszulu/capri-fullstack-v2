from datetime import date
from typing import Sequence

from sqlmodel import Session, select, and_

from app.exceptions import RoomNotFoundError
from app.models.bookings import Booking, BookingStatus
from app.models.rooms import Room, RoomCreate


# Estados que bloquean disponibilidad (reservas activas)
ACTIVE_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]


def create_room(*, session: Session, room_create: RoomCreate) -> Room:
    db_obj = Room.model_validate(room_create)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def get_rooms(*, session: Session, skip: int = 0, limit: int = 100) -> Sequence[Room]:
    statement = select(Room).offset(skip).limit(limit)
    return session.exec(statement).all()


def get_room(*, session: Session, room_id: int) -> Room | None:
    return session.get(Room, room_id)


def update_room(*, session: Session, db_room: Room, room_in: RoomCreate) -> Room:
    room_data = room_in.model_dump(exclude_unset=True)
    db_room.sqlmodel_update(room_data)
    session.add(db_room)
    session.commit()
    session.refresh(db_room)
    return db_room


def delete_room(*, session: Session, db_room: Room) -> Room:
    session.delete(db_room)
    session.commit()
    return db_room


def get_available_rooms(
    *,
    session: Session,
    check_in: date,
    check_out: date,
    room_type_id: int | None = None
) -> Sequence[Room]:
    """
    Obtener habitaciones disponibles para un rango de fechas.
    Excluye habitaciones que tienen reservas activas que se solapan con el rango.
    """
    # Subquery para obtener IDs de habitaciones ocupadas en el rango
    occupied_rooms_subquery = (
        select(Booking.room_id)
        .where(
            and_(
                Booking.check_in < check_out,
                Booking.check_out > check_in,
                Booking.status.in_(ACTIVE_STATUSES)
            )
        )
        .distinct()
    )
    
    # Consulta principal: habitaciones disponibles operacionalmente y sin reservas activas
    conditions = [
        Room.is_available == True,  # Habitación no en mantenimiento
        Room.id.not_in(occupied_rooms_subquery)
    ]
    
    if room_type_id:
        conditions.append(Room.room_type_id == room_type_id)
    
    statement = select(Room).where(and_(*conditions)).order_by(Room.room_number)
    return session.exec(statement).all()


def get_room_availability_count(
    *,
    session: Session,
    check_in: date,
    check_out: date,
    room_type_id: int | None = None
) -> int:
    """
    Obtener la cantidad de habitaciones disponibles para un rango de fechas.
    """
    rooms = get_available_rooms(
        session=session,
        check_in=check_in,
        check_out=check_out,
        room_type_id=room_type_id
    )
    return len(rooms)
