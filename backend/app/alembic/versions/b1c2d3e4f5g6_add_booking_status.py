"""add booking status

Revision ID: b1c2d3e4f5g6
Revises: a1b2c3d4e5f6
Create Date: 2026-01-30

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'b1c2d3e4f5g6'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar columna status con valor por defecto
    op.add_column('booking', sa.Column('status', sa.String(length=20), nullable=False, server_default='confirmed'))
    
    # Migrar datos: is_active=False -> status='cancelled'
    op.execute("UPDATE booking SET status = 'cancelled' WHERE is_active = false")
    
    # Eliminar la columna is_active
    op.drop_column('booking', 'is_active')


def downgrade():
    # Agregar columna is_active
    op.add_column('booking', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    
    # Migrar datos: status='cancelled' -> is_active=False
    op.execute("UPDATE booking SET is_active = false WHERE status = 'cancelled'")
    op.execute("UPDATE booking SET is_active = true WHERE status != 'cancelled'")
    
    # Eliminar columna status
    op.drop_column('booking', 'status')

