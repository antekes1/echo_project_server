"""

Revision ID: 01bc7b94e5ef
Revises: 2ecc65e2e4bd
Create Date: 2024-08-27 16:11:59.156697

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '01bc7b94e5ef'
down_revision: Union[str, None] = '2ecc65e2e4bd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('notifications', sa.Column('creation_date', sa.DateTime(), nullable=False))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('notifications', 'creation_date')
    # ### end Alembic commands ###
