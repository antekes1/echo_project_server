from sqlalchemy import Boolean, Column, Integer, String, Values, Enum, ARRAY, JSON, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from database import Base
from datetime import datetime,timedelta

perms = ['user', 'admin', 'owner']

# Tabela łącząca (association table)
item_user_association_table = Table(
    'item_user_association', Base.metadata,
    Column('storage_id', Integer, ForeignKey('storages.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

# item_user_association_table2 = Table(
#     'item_user_association2', Base.metadata,
#     Column('Email_verify_requests_id', Integer, ForeignKey('verify_requests.id')),
#     Column('user_id', Integer, ForeignKey('users.id'))
# )

class User(Base):
    __tablename__='users'

    id = Column(Integer, primary_key=True, index=True)
    username=Column(String(50), unique=True, nullable=False)
    email=Column(String(100), unique=True, nullable=False)
    name=Column(String(200), unique=False, nullable=False)
    password=Column(String(200), nullable=False)
    perm = Column(Enum(*perms), default='user')
    security_char = Column(String(24))
    profile_photo = Column(String(200), unique=False, default='user.png', nullable=False)

class Storage(Base):
    __tablename__='storages'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(250), nullable=True, unique=False)
    owner_id = Column(Integer)
    valid_users = relationship("User", secondary=item_user_association_table)
    #valid_users = Column(JSON, default=[])
    max_size = Column(Integer, default=5)

class Email_verify_requests(Base):
    __tablename__ = 'verify_requests'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(250), nullable=False, unique=False)
    code = Column(String(20), nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow(), nullable=False)
    expiry_at = Column(DateTime, default= datetime.utcnow() + timedelta(hours=24), nullable=False)