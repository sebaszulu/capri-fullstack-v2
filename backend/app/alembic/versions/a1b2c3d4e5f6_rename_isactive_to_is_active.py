"""rename isActive to is_active

Revision ID: a1b2c3d4e5f6
Revises: 9c0a54914c78
Create Date: 2025-12-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '98d76c54b3a1'
branch_labels = None
depends_on = None


def upgrade():
    # Renombrar columna isActive a is_active en tabla booking
    op.alter_column('booking', 'isActive', new_column_name='is_active')


def downgrade():
    # Renombrar columna de vuelta a isActive
    op.alter_column('booking', 'is_active', new_column_name='isActive')

