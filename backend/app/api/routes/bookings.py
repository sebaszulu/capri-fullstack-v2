import uuid
from typing import Any, List

from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep, CurrentUser
from app.crud import crud_booking
from app.exceptions import (
    BookingNotFoundError,
    RoomNotAvailableError,
    RoomNotFoundError,
    UserNotFoundError,
)
from app.models.bookings import BookingCreate, BookingRead, BookingUpdate

router = APIRouter(tags=["bookings"])


@router.post("/", response_model=BookingRead)
def create_booking(
    *, session: SessionDep, booking_in: BookingCreate, current_user: CurrentUser
) -> Any:
    """
    Crear nueva reserva.
    """
    if current_user.is_superuser:
        # Los superusuarios pueden reservar para cualquiera
        pass
    else:
        # Los usuarios regulares solo pueden reservar para sí mismos
        # Forzar el user_id para prevenir suplantación
        booking_in.user_id = current_user.id

    try:
        booking = crud_booking.create_booking(session=session, booking_create=booking_in)
        return booking
    except UserNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except RoomNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except RoomNotAvailableError as e:
        raise HTTPException(status_code=400, detail=e.message)


@router.get("/", response_model=List[BookingRead])
def read_bookings(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 100
) -> Any:
    """
    Obtener reservas.
    """
    if current_user.is_superuser:
        return crud_booking.get_bookings(session=session, skip=skip, limit=limit)
    # Filtrar por user_id para usuarios normales
    return crud_booking.get_bookings_by_user(
        session=session, user_id=current_user.id, skip=skip, limit=limit
    )


@router.get("/{booking_id}", response_model=BookingRead)
def read_booking(
    *, session: SessionDep, booking_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Obtener reserva por ID.
    """
    booking = crud_booking.get_booking(session=session, booking_id=booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    if not current_user.is_superuser and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")
    return booking


@router.put("/{booking_id}", response_model=BookingRead)
def update_booking(
    *, session: SessionDep, booking_id: uuid.UUID, booking_in: BookingUpdate, current_user: CurrentUser
) -> Any:
    """
    Actualizar una reserva.
    """
    existing_booking = crud_booking.get_booking(session=session, booking_id=booking_id)
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if not current_user.is_superuser and existing_booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")

    try:
        booking = crud_booking.update_booking(
            session=session, booking_id=booking_id, booking_update=booking_in
        )
        return booking
    except BookingNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except RoomNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except RoomNotAvailableError as e:
        raise HTTPException(status_code=400, detail=e.message)


@router.delete("/{booking_id}")
def delete_booking(
    *, session: SessionDep, booking_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Eliminar una reserva.
    """
    existing_booking = crud_booking.get_booking(session=session, booking_id=booking_id)
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if not current_user.is_superuser and existing_booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")

    success = crud_booking.delete_booking(session=session, booking_id=booking_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return {"message": "Reserva eliminada exitosamente"}


# ============================================
# Endpoints de cambio de estado
# ============================================

@router.patch("/{booking_id}/confirm", response_model=BookingRead)
def confirm_booking(
    *, session: SessionDep, booking_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Confirmar una reserva pendiente.
    Solo superusuarios pueden confirmar reservas.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Solo administradores pueden confirmar reservas")
    
    try:
        booking = crud_booking.confirm_booking(session=session, booking_id=booking_id)
        return booking
    except BookingNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{booking_id}/cancel", response_model=BookingRead)
def cancel_booking(
    *, session: SessionDep, booking_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Cancelar una reserva.
    Los usuarios pueden cancelar sus propias reservas.
    """
    existing_booking = crud_booking.get_booking(session=session, booking_id=booking_id)
    if not existing_booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    if not current_user.is_superuser and existing_booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tiene permisos suficientes")

    try:
        booking = crud_booking.cancel_booking(session=session, booking_id=booking_id)
        return booking
    except BookingNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{booking_id}/check-in", response_model=BookingRead)
def check_in_booking(
    *, session: SessionDep, booking_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Registrar check-in de una reserva.
    Solo superusuarios pueden hacer check-in.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Solo administradores pueden registrar check-in")
    
    try:
        booking = crud_booking.check_in_booking(session=session, booking_id=booking_id)
        return booking
    except BookingNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{booking_id}/check-out", response_model=BookingRead)
def check_out_booking(
    *, session: SessionDep, booking_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Registrar check-out de una reserva.
    Solo superusuarios pueden hacer check-out.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Solo administradores pueden registrar check-out")
    
    try:
        booking = crud_booking.check_out_booking(session=session, booking_id=booking_id)
        return booking
    except BookingNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{booking_id}/no-show", response_model=BookingRead)
def mark_booking_no_show(
    *, session: SessionDep, booking_id: uuid.UUID, current_user: CurrentUser
) -> Any:
    """
    Marcar una reserva como no-show.
    Solo superusuarios pueden marcar no-show.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Solo administradores pueden marcar no-show")
    
    try:
        booking = crud_booking.mark_no_show(session=session, booking_id=booking_id)
        return booking
    except BookingNotFoundError as e:
        raise HTTPException(status_code=404, detail=e.message)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
