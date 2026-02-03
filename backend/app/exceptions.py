"""
Excepciones de dominio personalizadas.
Estas excepciones deben ser capturadas en la capa de rutas y convertidas a HTTPException.
"""


class DomainException(Exception):
    """Excepción base para el dominio."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


# Excepciones de Usuario
class UserNotFoundError(DomainException):
    """El usuario no fue encontrado."""

    def __init__(self, user_id: int | None = None):
        message = f"Usuario con id {user_id} no encontrado" if user_id else "Usuario no encontrado"
        super().__init__(message)


class UserAlreadyExistsError(DomainException):
    """El usuario ya existe."""

    def __init__(self, email: str):
        super().__init__(f"Usuario con email {email} ya existe")


# Excepciones de Habitación
class RoomNotFoundError(DomainException):
    """La habitación no fue encontrada."""

    def __init__(self, room_id: int | None = None):
        message = f"Habitación con id {room_id} no encontrada" if room_id else "Habitación no encontrada"
        super().__init__(message)


class RoomNotAvailableError(DomainException):
    """La habitación no está disponible."""

    def __init__(self, room_id: int | None = None):
        message = f"Habitación con id {room_id} no disponible" if room_id else "Habitación no disponible"
        super().__init__(message)


# Excepciones de Tipo de Habitación
class RoomTypeNotFoundError(DomainException):
    """El tipo de habitación no fue encontrado."""

    def __init__(self, room_type_id: int | None = None):
        message = (
            f"Tipo de habitación con id {room_type_id} no encontrado"
            if room_type_id
            else "Tipo de habitación no encontrado"
        )
        super().__init__(message)


# Excepciones de Reserva
class BookingNotFoundError(DomainException):
    """La reserva no fue encontrada."""

    def __init__(self, booking_id: str | None = None):
        message = f"Reserva con id {booking_id} no encontrada" if booking_id else "Reserva no encontrada"
        super().__init__(message)


class InvalidBookingDatesError(DomainException):
    """Las fechas de la reserva son inválidas."""

    def __init__(self, message: str = "La fecha de salida debe ser posterior a la fecha de entrada"):
        super().__init__(message)

