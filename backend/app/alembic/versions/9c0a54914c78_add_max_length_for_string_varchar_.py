"""Add max length for string(varchar) fields in User and Items models

Revision ID: 9c0a54914c78
Revises: e2412789c190
Create Date: 2024-06-17 14:42:44.639457

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '9c0a54914c78'
down_revision = 'e2412789c190'
branch_labels = None
depends_on = None


def upgrade():
    # Ajustar la longitud del campo email en la tabla User
    op.alter_column('user', 'email',
               existing_type=sa.String(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Ajustar la longitud del campo full_name en la tabla User
    op.alter_column('user', 'full_name',
               existing_type=sa.String(),
               type_=sa.String(length=255),
               existing_nullable=True)

    # Ajustar la longitud del campo title en la tabla Item
    op.alter_column('item', 'title',
               existing_type=sa.String(),
               type_=sa.String(length=255),
               existing_nullable=False)

    # Ajustar la longitud del campo description en la tabla Item
    op.alter_column('item', 'description',
               existing_type=sa.String(),
               type_=sa.String(length=255),
               existing_nullable=True)


def downgrade():
    # Revertir la longitud del campo email en la tabla User
    op.alter_column('user', 'email',
               existing_type=sa.String(length=255),
               type_=sa.String(),
               existing_nullable=False)

    # Revertir la longitud del campo full_name en la tabla User
    op.alter_column('user', 'full_name',
               existing_type=sa.String(length=255),
               type_=sa.String(),
               existing_nullable=True)

    # Revertir la longitud del campo title en la tabla Item
    op.alter_column('item', 'title',
               existing_type=sa.String(length=255),
               type_=sa.String(),
               existing_nullable=False)

    # Revertir la longitud del campo description en la tabla Item
    op.alter_column('item', 'description',
               existing_type=sa.String(length=255),
               type_=sa.String(),
               existing_nullable=True)
