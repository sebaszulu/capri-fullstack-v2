from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.models import User
from tests.utils.utils import random_lower_string, random_phone_number


def test_create_user(client: TestClient, db: Session) -> None:
    name = "Pollo"
    last_name = "Listo"
    r = client.post(
        f"{settings.API_V1_STR}/private/users/",
        json={
            "email": "pollo@listo.com",
            "password": "password123",
            "name": name,
            "last_name": last_name,
            "document_type": "Cédula",
            "document_number": random_lower_string()[:20],
            "phone_number": random_phone_number(),
        },
    )

    assert r.status_code == 200

    data = r.json()

    user = db.exec(select(User).where(User.id == data["id"])).first()

    assert user
    assert user.email == "pollo@listo.com"
    assert user.name == name
    assert user.last_name == last_name
