from enum import Enum
from datetime import date
from typing import Annotated

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel


class DocumentType(str, Enum):
    CEDULA = "Cédula"
    TARJETA_IDENTIDAD = "Tarjeta de identidad"
    CEDULA_EXTRANJERIA = "Cédula de extranjería"
    PASAPORTE = "Pasaporte"


# Propiedades compartidas
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    name: str = Field(max_length=255)
    last_name: str = Field(max_length=255)
    document_type: DocumentType = Field()
    document_number: str = Field(unique=True, index=True, max_length=50)
    # Campos extendidos de Capri
    phone_number: str = Field(unique=True, min_length=10, max_length=10)
    birth_date: date | None = None


# Propiedades para recibir vía API al crear
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    name: str = Field(max_length=255)
    last_name: str = Field(max_length=255)
    document_type: DocumentType = Field()
    document_number: str = Field(max_length=50)
    phone_number: str = Field(min_length=10, max_length=10)
    birth_date: date | None = None


# Propiedades para recibir vía API al actualizar, todas opcionales
class UserUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255)
    is_active: bool | None = None
    is_superuser: bool | None = None
    name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    document_type: DocumentType | None = None
    document_number: str | None = Field(default=None, max_length=50)
    phone_number: str | None = Field(default=None, min_length=10, max_length=10)
    birth_date: date | None = None
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    name: str | None = Field(default=None, max_length=255)
    last_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)
    phone_number: str | None = Field(default=None, min_length=10, max_length=10)
    birth_date: date | None = None


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Modelo de base de datos, tabla inferida del nombre de clase
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    # items: list["Item"] = Relationship(back_populates="owner")


# Propiedades para retornar vía API, id siempre requerido
class UserPublic(UserBase):
    id: int


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contenido del token JWT
class TokenPayload(SQLModel):
    sub: int | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


class Message(SQLModel):
    message: str
