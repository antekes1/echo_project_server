from sqlalchemy import Boolean, Column, Integer, String, Values, Enum
from database import Base

perms = ['user', 'admin', 'owner']

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