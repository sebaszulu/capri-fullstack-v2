import uuid
from datetime import date
from typing import Sequence

from sqlmodel import Session, select, and_, or_

from app.exceptions import BookingNotFoundError, RoomNotAvailableError, RoomNotFoundError, UserNotFoundError
from app.models.bookings import Booking, BookingCreate, BookingStatus, BookingUpdate
from app.models.rooms import Room
from app.models.user import User


# Estados que bloquean disponibilidad (reservas activas)
ACTIVE_STATUSES = [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN]


def create_booking(*, session: Session, booking_create: BookingCreate) -> Booking:
    """Crear una nueva reserva."""
    # Validar Usuario
    user = session.get(User, booking_create.user_id)
    if not user:
        raise UserNotFoundError(booking_create.user_id)

    # Validar Habitación
    room = session.get(Room, booking_create.room_id)
    if not room:
        raise RoomNotFoundError(booking_create.room_id)

    if not room.is_available:
        # Verificar si la habitación está disponible operacionalmente (no en mantenimiento)
        raise RoomNotAvailableError(booking_create.room_id)

    # Verificar superposición de fechas con reservas activas
    if not is_room_available(
        session=session,
        room_id=booking_create.room_id,
        check_in=booking_create.check_in,
        check_out=booking_create.check_out
    ):
        raise RoomNotAvailableError(booking_create.room_id)

    # Crear Reserva con estado PENDIENTE
    db_obj = Booking(
        check_in=booking_create.check_in,
        check_out=booking_create.check_out,
        user_id=booking_create.user_id,
        room_id=booking_create.room_id,
        status=BookingStatus.PENDING
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def is_room_available(
    *,
    session: Session,
    room_id: int,
    check_in: date,
    check_out: date,
    exclude_booking_id: uuid.UUID | None = None
) -> bool:
    """Verifica si una habitación está disponible en el rango de fechas."""
    # Fórmula de superposición: (InicioA < FinB) y (FinA > InicioB)
    conditions = [
        Booking.room_id == room_id,
        Booking.check_in < check_out,
        Booking.check_out > check_in,
        Booking.status.in_(ACTIVE_STATUSES)
    ]
    
    if exclude_booking_id:
        conditions.append(Booking.id != exclude_booking_id)
    
    statement = select(Booking).where(and_(*conditions))
    existing_bookings = session.exec(statement).all()
    
    return len(existing_bookings) == 0


def get_bookings(*, session: Session, skip: int = 0, limit: int = 100) -> Sequence[Booking]:
    """Obtener todas las reservas."""
    statement = select(Booking).order_by(Booking.check_in.desc()).offset(skip).limit(limit)
    return session.exec(statement).all()


def get_bookings_by_user(*, session: Session, user_id: int, skip: int = 0, limit: int = 100) -> Sequence[Booking]:
    """Obtener reservas de un usuario específico."""
    statement = select(Booking).where(Booking.user_id == user_id).order_by(Booking.check_in.desc()).offset(skip).limit(limit)
    return session.exec(statement).all()


def get_booking(*, session: Session, booking_id: uuid.UUID) -> Booking | None:
    """Obtener una reserva por ID."""
    return session.get(Booking, booking_id)


def update_booking(*, session: Session, booking_id: uuid.UUID, booking_update: BookingUpdate) -> Booking:
    """Actualizar una reserva."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking:
        raise BookingNotFoundError(str(booking_id))

    # Si se está cambiando la habitación, validar la nueva
    new_room_id = booking_update.room_id if booking_update.room_id else db_booking.room_id
    if booking_update.room_id and booking_update.room_id != db_booking.room_id:
        new_room = session.get(Room, booking_update.room_id)
        if not new_room:
            raise RoomNotFoundError(booking_update.room_id)
        if not new_room.is_available:
            raise RoomNotAvailableError(booking_update.room_id)

    # Verificar superposición de fechas excluyendo la reserva actual
    check_in = booking_update.check_in if booking_update.check_in else db_booking.check_in
    check_out = booking_update.check_out if booking_update.check_out else db_booking.check_out

    if not is_room_available(
        session=session,
        room_id=new_room_id,
        check_in=check_in,
        check_out=check_out,
        exclude_booking_id=booking_id
    ):
        raise RoomNotAvailableError(new_room_id)

    update_dict = booking_update.model_dump(exclude_unset=True)
    db_booking.sqlmodel_update(update_dict)
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


def delete_booking(*, session: Session, booking_id: uuid.UUID) -> bool:
    """Eliminar una reserva."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking:
        return False

    session.delete(db_booking)
    session.commit()
    return True


# ============================================
# Funciones de cambio de estado
# ============================================

def confirm_booking(*, session: Session, booking_id: uuid.UUID) -> Booking:
    """Confirmar una reserva pendiente."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking:
        raise BookingNotFoundError(str(booking_id))
    
    if db_booking.status != BookingStatus.PENDING:
        raise ValueError(f"Solo se pueden confirmar reservas pendientes. Estado actual: {db_booking.status}")
    
    db_booking.status = BookingStatus.CONFIRMED
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


def cancel_booking(*, session: Session, booking_id: uuid.UUID) -> Booking:
    """Cancelar una reserva."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking:
        raise BookingNotFoundError(str(booking_id))
    
    if db_booking.status in [BookingStatus.CHECKED_IN, BookingStatus.CHECKED_OUT]:
        raise ValueError(f"No se puede cancelar una reserva que ya hizo check-in/out. Estado actual: {db_booking.status}")
    
    db_booking.status = BookingStatus.CANCELLED
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


def check_in_booking(*, session: Session, booking_id: uuid.UUID) -> Booking:
    """Registrar check-in de una reserva."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking:
        raise BookingNotFoundError(str(booking_id))
    
    if db_booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise ValueError(f"Solo se puede hacer check-in en reservas pendientes o confirmadas. Estado actual: {db_booking.status}")
    
    db_booking.status = BookingStatus.CHECKED_IN
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


def check_out_booking(*, session: Session, booking_id: uuid.UUID) -> Booking:
    """Registrar check-out de una reserva."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking:
        raise BookingNotFoundError(str(booking_id))
    
    if db_booking.status != BookingStatus.CHECKED_IN:
        raise ValueError(f"Solo se puede hacer check-out en reservas con check-in. Estado actual: {db_booking.status}")
    
    db_booking.status = BookingStatus.CHECKED_OUT
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking


def mark_no_show(*, session: Session, booking_id: uuid.UUID) -> Booking:
    """Marcar una reserva como no-show."""
    db_booking = session.get(Booking, booking_id)
    if not db_booking:
        raise BookingNotFoundError(str(booking_id))
    
    if db_booking.status not in [BookingStatus.PENDING, BookingStatus.CONFIRMED]:
        raise ValueError(f"Solo se puede marcar como no-show reservas pendientes o confirmadas. Estado actual: {db_booking.status}")
    
    db_booking.status = BookingStatus.NO_SHOW
    session.add(db_booking)
    session.commit()
    session.refresh(db_booking)
    return db_booking
