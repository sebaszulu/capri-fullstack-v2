from sqlmodel import Session, select
from app.core.db import engine
from app.models.room_types import RoomType
from app.models.rooms import Room

def seed():
    with Session(engine) as session:
        # Verificar si existe
        existing_rt = session.exec(select(RoomType).where(RoomType.name == "Standard Single")).first()
        if not existing_rt:
            rt = RoomType(
                name="Standard Single",
                description="Una habitación cómoda para descansar.",
                capacity=2,
                base_price=150000,
                amenities=["WiFi", "TV"]
            )
            session.add(rt)
            session.commit()
            session.refresh(rt)
            print(f"Created RoomType: {rt.name}")
            rt_id = rt.id
        else:
            rt_id = existing_rt.id
            print("RoomType already exists")

        # Crear Habitación
        existing_room = session.exec(select(Room).where(Room.room_number == 101)).first()
        if not existing_room:
            room = Room(
                room_number=101,
                room_type_id=rt_id,
                is_available=True
            )
            session.add(room)
            session.commit()
            print("Created Room 101")
        else:
            print("Room 101 already exists")

if __name__ == "__main__":
    seed()
