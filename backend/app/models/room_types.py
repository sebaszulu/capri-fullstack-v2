from typing import List, TYPE_CHECKING
from sqlmodel import JSON, Column, Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.models.rooms import Room


class RoomTypeBase(SQLModel):
    name: str = Field(max_length=100)
    description: str = Field(max_length=500)
    capacity: int = Field(ge=1, le=50)
    amenities: list[str] = Field(default_factory=list, sa_column=Column(JSON))
    base_price: float = Field(ge=0)


class RoomTypeCreate(RoomTypeBase):
    pass


class RoomTypeRead(RoomTypeBase):
    id: int


class RoomType(RoomTypeBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    rooms: List["Room"] = Relationship(back_populates="room_type")
