"""Initial schema - Hotel Capri Doradal

Revision ID: 001_initial
Revises:
Create Date: 2026-02-22

Creates all tables from scratch:
- user (with extended fields for hotel guests)
- roomtype (room categories with amenities)
- room (individual rooms linked to room types)
- booking (reservations with status tracking)
"""
import sqlalchemy as sa
import sqlmodel.sql.sqltypes
from alembic import op

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ---- USER ----
    op.create_table(
        'user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_superuser', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('last_name', sa.String(length=255), nullable=False),
        sa.Column('document_type', sa.String(length=50), nullable=False),
        sa.Column('document_number', sa.String(length=50), nullable=False),
        sa.Column('phone_number', sa.String(length=10), nullable=True),
        sa.Column('birth_date', sa.Date(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_user_email'), 'user', ['email'], unique=True)
    op.create_index(op.f('ix_user_document_number'), 'user', ['document_number'], unique=True)
    op.create_unique_constraint('uq_user_phone_number', 'user', ['phone_number'])

    # ---- ROOM TYPE ----
    op.create_table(
        'roomtype',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('amenities', sa.JSON(), nullable=True),
        sa.Column('base_price', sa.Float(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )

    # ---- ROOM ----
    op.create_table(
        'room',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('room_number', sa.Integer(), nullable=False),
        sa.Column('is_available', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('room_type_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['room_type_id'], ['roomtype.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_room_room_type_id'), 'room', ['room_type_id'])

    # ---- BOOKING ----
    op.create_table(
        'booking',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('check_in', sa.Date(), nullable=False),
        sa.Column('check_out', sa.Date(), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('room_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id']),
        sa.ForeignKeyConstraint(['room_id'], ['room.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_booking_user_id'), 'booking', ['user_id'])
    op.create_index(op.f('ix_booking_room_id'), 'booking', ['room_id'])


def downgrade():
    op.drop_table('booking')
    op.drop_table('room')
    op.drop_table('roomtype')
    op.drop_index(op.f('ix_user_email'), table_name='user')
    op.drop_index(op.f('ix_user_document_number'), table_name='user')
    op.drop_table('user')
