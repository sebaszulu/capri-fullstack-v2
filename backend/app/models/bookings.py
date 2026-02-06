from datetime import date
from enum import Enum
import uuid
from typing import TYPE_CHECKING

from pydantic import model_validator
from sqlalchemy import Column, Enum as SAEnum
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.rooms import Room


class BookingStatus(str, Enum):
    """Estados posibles de una reserva."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"


class BookingBase(SQLModel):
    check_in: date
    check_out: date
    status: BookingStatus = Field(
        default=BookingStatus.PENDING,
        sa_column=Column(SAEnum(BookingStatus, values_callable=lambda x: [e.value for e in x]), nullable=False, default="pending")
    )

    @model_validator(mode="after")
    def validate_dates(self) -> "BookingBase":
        if self.check_out <= self.check_in:
            raise ValueError("La fecha de salida debe ser posterior a la fecha de entrada")
        return self


class BookingCreate(SQLModel):
    """Schema para crear una reserva."""
    check_in: date
    check_out: date
    user_id: int
    room_id: int

    @model_validator(mode="after")
    def validate_dates(self) -> "BookingCreate":
        if self.check_out <= self.check_in:
            raise ValueError("La fecha de salida debe ser posterior a la fecha de entrada")
        return self


class BookingRead(BookingBase):
    id: uuid.UUID
    user_id: int
    room_id: int


class BookingUpdate(SQLModel):
    """Schema para actualizar una reserva."""
    check_in: date | None = None
    check_out: date | None = None
    room_id: int | None = None
    status: BookingStatus | None = None


class Booking(BookingBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    user_id: int = Field(foreign_key="user.id", index=True)
    user: "User" = Relationship()

    room_id: int = Field(foreign_key="room.id", index=True)
    room: "Room" = Relationship(back_populates="bookings")
