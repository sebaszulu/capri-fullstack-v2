from sqlmodel import Session, create_engine, select

from app import crud
from app.core.config import settings
from app.models import User, UserCreate, UserUpdate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Las tablas deben crearse con migraciones de Alembic
    # Pero si no quieres usar migraciones, crear
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # Esto funciona porque los modelos ya están importados y registrados desde app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
            name="Admin",
            last_name="System",
            document_type="Cédula",
            document_number="1234567890",
            phone_number="3001234567",
        )
        user = crud.create_user(session=session, user_create=user_in)
    else:
        user_in_update = UserUpdate(
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
            is_active=True,
        )
        crud.update_user(session=session, db_user=user, user_in=user_in_update)
