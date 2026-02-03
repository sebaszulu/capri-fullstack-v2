from typing import Any, List

from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep, CurrentUser
from app.crud import crud_room_type
from app.exceptions import RoomTypeNotFoundError
from app.models.room_types import RoomTypeCreate, RoomTypeRead

router = APIRouter(tags=["room-types"])


@router.post("/", response_model=RoomTypeRead)
def create_room_type(
    *, session: SessionDep, room_type_in: RoomTypeCreate, current_user: CurrentUser
) -> Any:
    """
    Create new room type.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")
    room_type = crud_room_type.create_room_type(session=session, room_type_create=room_type_in)
    return room_type


@router.get("/", response_model=List[RoomTypeRead])
def read_room_types(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Retrieve room types.
    """
    return crud_room_type.get_room_types(session=session, skip=skip, limit=limit)


@router.get("/{room_type_id}", response_model=RoomTypeRead)
def read_room_type(
    *, session: SessionDep, room_type_id: int
) -> Any:
    """
    Get room type by ID.
    """
    room_type = crud_room_type.get_room_type(session=session, room_type_id=room_type_id)
    if not room_type:
        raise HTTPException(status_code=404, detail="Tipo de habitación no encontrado")
    return room_type


@router.put("/{room_type_id}", response_model=RoomTypeRead)
def update_room_type(
    *, session: SessionDep, room_type_id: int, room_type_in: RoomTypeCreate, current_user: CurrentUser
) -> Any:
    """
    Update a room type.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")
    try:
        room_type = crud_room_type.update_room_type(
            session=session, room_type_id=room_type_id, room_type_update=room_type_in
        )
        return room_type
    except RoomTypeNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)


@router.delete("/{room_type_id}")
def delete_room_type(
    *, session: SessionDep, room_type_id: int, current_user: CurrentUser
) -> Any:
    """
    Delete a room type.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")
    success = crud_room_type.delete_room_type(session=session, room_type_id=room_type_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tipo de habitación no encontrado")
    return {"message": "Tipo de habitación eliminado exitosamente"}
