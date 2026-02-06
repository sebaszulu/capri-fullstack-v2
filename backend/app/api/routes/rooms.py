from datetime import date
from typing import Any, List

from fastapi import APIRouter, HTTPException, Query

from app.api.deps import SessionDep, CurrentUser
from app.crud import crud_room
from app.models.rooms import RoomCreate, RoomRead

router = APIRouter(tags=["rooms"])


@router.post("/", response_model=RoomRead)
def create_room(
    *, session: SessionDep, room_in: RoomCreate, current_user: CurrentUser
) -> Any:
    """
    Create new room.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")
    room = crud_room.create_room(session=session, room_create=room_in)
    return room


@router.get("/", response_model=List[RoomRead])
def read_rooms(
    session: SessionDep, skip: int = 0, limit: int = 100
) -> Any:
    """
    Obtener todas las habitaciones.
    """
    return crud_room.get_rooms(session=session, skip=skip, limit=limit)


@router.get("/availability", response_model=List[RoomRead])
def check_availability(
    session: SessionDep,
    check_in: date = Query(..., description="Fecha de entrada"),
    check_out: date = Query(..., description="Fecha de salida"),
    room_type_id: int | None = Query(None, description="Filtrar por tipo de habitación")
) -> Any:
    """
    Obtener habitaciones disponibles para un rango de fechas.
    
    - **check_in**: Fecha de entrada (requerida)
    - **check_out**: Fecha de salida (requerida)
    - **room_type_id**: Filtrar por tipo de habitación (opcional)
    
    Devuelve las habitaciones que:
    - No están en mantenimiento (is_available=True)
    - No tienen reservas activas (pending, confirmed, checked_in) en el rango de fechas
    """
    if check_out <= check_in:
        raise HTTPException(
            status_code=400, 
            detail="La fecha de salida debe ser posterior a la fecha de entrada"
        )
    
    return crud_room.get_available_rooms(
        session=session,
        check_in=check_in,
        check_out=check_out,
        room_type_id=room_type_id
    )


@router.get("/{room_id}", response_model=RoomRead)
def read_room(
    *, session: SessionDep, room_id: int
) -> Any:
    """
    Get room by ID.
    """
    room = crud_room.get_room(session=session, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")
    return room


@router.put("/{room_id}", response_model=RoomRead)
def update_room(
    *, session: SessionDep, room_id: int, room_in: RoomCreate, current_user: CurrentUser
) -> Any:
    """
    Update a room.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")
    room = crud_room.get_room(session=session, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")
    room = crud_room.update_room(session=session, db_room=room, room_in=room_in)
    return room


@router.delete("/{room_id}", response_model=Any)
def delete_room(
    *, session: SessionDep, room_id: int, current_user: CurrentUser
) -> Any:
    """
    Delete a room.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")
    room = crud_room.get_room(session=session, room_id=room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")
    crud_room.delete_room(session=session, db_room=room)
    return {"detail": "Habitación eliminada"}
