"""update user model and remove item

Revision ID: 98d76c54b3a1
Revises: e2412789c190
Create Date: 2025-12-16 23:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision = '98d76c54b3a1'
down_revision = '9c0a54914c78'
branch_labels = None
depends_on = None


def upgrade():
    # Agregar columnas a usuario
    op.add_column('user', sa.Column('phone_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.add_column('user', sa.Column('birth_date', sa.Date(), nullable=True))
    op.create_unique_constraint('uq_user_phone_number', 'user', ['phone_number'])
    
    # Eliminar tabla item
    op.drop_table('item')


def downgrade():
    # Recrear tabla item
    op.create_table('item',
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Eliminar columnas de usuario
    op.drop_constraint('uq_user_phone_number', 'user', type_='unique')
    op.drop_column('user', 'birth_date')
    op.drop_column('user', 'phone_number')
