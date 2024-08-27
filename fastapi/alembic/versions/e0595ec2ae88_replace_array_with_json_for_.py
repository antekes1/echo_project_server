"""Replace ARRAY with JSON for participants and date

Revision ID: e0595ec2ae88
Revises: 1a305bcb59e3
Create Date: 2024-08-26 18:37:26.381288

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e0595ec2ae88'
down_revision: Union[str, None] = '1a305bcb59e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('calendar_events', sa.Column('owner_id', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('calendar_events', 'owner_id')
    # ### end Alembic commands ###