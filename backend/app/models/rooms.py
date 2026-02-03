from typing import List, TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.room_types import RoomType
    from app.models.bookings import Booking


class RoomBase(SQLModel):
    room_number: int = Field(ge=1)
    is_available: bool = True
    room_type_id: int


class RoomCreate(RoomBase):
    pass


class RoomRead(RoomBase):
    id: int
    room_type_id: int


class Room(RoomBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    room_type_id: int = Field(foreign_key="roomtype.id", index=True)
    room_type: "RoomType" = Relationship(back_populates="rooms")
    bookings: List["Booking"] = Relationship(back_populates="room")
