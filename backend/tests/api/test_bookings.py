import uuid
from datetime import date, timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session, select, delete

from app.core.config import settings
from app.models import Booking, Room, RoomType, User
from tests.utils.utils import random_lower_string

# Setup function to ensure we have a RoomType and Room to test with
def setup_test_data(session: Session, room_number: int = 999) -> Room:
    # Check/Create RoomType
    rt = session.exec(select(RoomType).where(RoomType.name == "Test Suite")).first()
    if not rt:
        rt = RoomType(
            name="Test Suite", 
            description="Test Desc", 
            capacity=2, 
            base_price=100.0,
            amenities=[]
        )
        session.add(rt)
        session.commit()
        session.refresh(rt)
    
    # Check/Create Room
    room = session.exec(select(Room).where(Room.room_number == room_number)).first()
    if not room:
        room = Room(room_number=room_number, room_type_id=rt.id, is_available=True)
        session.add(room)
        session.commit()
        session.refresh(room)
    
    # Clear bookings for this room to start fresh
    session.exec(delete(Booking).where(Booking.room_id == room.id))
    session.commit()
    
    return room


def test_create_booking_success(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    room = setup_test_data(db, room_number=1001)
    # Get a real user ID
    user = db.exec(select(User).where(User.email == settings.FIRST_SUPERUSER)).first()
    assert user is not None
    user_id = user.id
    
    # Dates: Tomorrow to Day + 3
    today = date.today()
    check_in = today + timedelta(days=1)
    check_out = today + timedelta(days=3)
    
    data = {
        "room_id": room.id,
        "user_id": user_id,
        "check_in": check_in.isoformat(),
        "check_out": check_out.isoformat(),
    }
    
    r = client.post(f"{settings.API_V1_STR}/bookings/", headers=superuser_token_headers, json=data)
    if r.status_code != 200:
        print(f"Error Result: {r.text}")
    assert r.status_code == 200
    created_booking = r.json()
    assert created_booking["room_id"] == room.id
    assert created_booking["check_in"] == check_in.isoformat()


def test_create_booking_overlap_failure(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    room = setup_test_data(db, room_number=1002)
    user = db.exec(select(User).where(User.email == settings.FIRST_SUPERUSER)).first()
    user_id = user.id

    today = date.today()
    # Create initial booking: Day 1 to Day 5
    data_1 = {
        "room_id": room.id,
        "user_id": user_id,
        "check_in": (today + timedelta(days=1)).isoformat(),
        "check_out": (today + timedelta(days=5)).isoformat(),
    }
    r = client.post(f"{settings.API_V1_STR}/bookings/", headers=superuser_token_headers, json=data_1)
    assert r.status_code == 200

    # Try to overlap: Day 2 to Day 3 (Inside)
    data_2 = {
        "room_id": room.id,
        "user_id": user_id,
        "check_in": (today + timedelta(days=2)).isoformat(),
        "check_out": (today + timedelta(days=3)).isoformat(),
    }
    r2 = client.post(f"{settings.API_V1_STR}/bookings/", headers=superuser_token_headers, json=data_2)
    if r2.status_code != 400:
        print(f"Overlap failure error status: {r2.status_code}")
        print(f"Overlap failure error body: {r2.text}")
    assert r2.status_code == 400

def test_read_room_types_public(
    client: TestClient, db: Session
) -> None:
    # No headers = Public
    r = client.get(f"{settings.API_V1_STR}/room-types/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
