from sqlalchemy import Boolean, Column, Integer, String, Values, Enum, ARRAY, JSON, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from database import Base
from datetime import datetime,timedelta

perms = ['user', 'admin', 'owner']

notification_types = ["text", "request"]
requests_types = ["storage_request", "friend_request", "calendar_event_request"]

# Tabela łącząca (association table)
item_user_association_table = Table(
    'item_user_association', Base.metadata,
    Column('storage_id', Integer, ForeignKey('storages.id')),
    Column('user_id', Integer, ForeignKey('users.id'))
)

item_user_association_table2 = Table(
    'event_calendar_association', Base.metadata,
    Column('calendar_id', Integer, ForeignKey('calendars.id')),
    Column('event_id', Integer, ForeignKey('calendar_events.id'))
)
association_table3 = Table(
    'inbox_notification_association', Base.metadata,
    Column('inbox_id', Integer, ForeignKey('inboxes.id')),
    Column('notification_id', Integer, ForeignKey('notifications.id'))
)
association_table4 = Table(
    'chatroms_messages_association', Base.metadata,
    Column('room_id', Integer, ForeignKey('chat_rooms.id')),
    Column('message_id', Integer, ForeignKey('messages.id'))
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
    friends = Column(JSON, nullable=False, default=[])

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

class Calendar(Base):
    __tablename__ = 'calendars'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=False)
    description = Column(String(250), nullable=True, unique=False)
    owner_id = Column(Integer, nullable=False, unique=True)

class Calendar_event(Base):
    __tablename__ = 'calendar_events'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    owner_id = Column(Integer, nullable=False)
    description = Column(String(250), nullable=True, unique=False)
    color = Column(String(7), default="#ffffff", nullable=False, unique=False)
    participants = Column(JSON, nullable=True)
    calendar = relationship("Calendar", secondary=item_user_association_table2)
    date = Column(JSON, nullable=True)

class Inbox(Base):
    __tablename__ = "inboxes"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, nullable=False)

class Notifications(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    inbox = relationship("Inbox", secondary=association_table3)
    type = Column(Enum(*notification_types), default='text')
    request_id = Column(Integer, nullable=True)
    body = Column(String(250), nullable=False, unique=False)
    creation_date = Column(DateTime, default=datetime.utcnow(), nullable=False)

class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True) #owner
    type = Column(Enum(*requests_types))
    storage_id = Column(Integer, nullable=True)
    event_id = Column(Integer, nullable=True)
    friend_id = Column(Integer, nullable=True)

class Chatroom(Base):
    __tablename__ = "chat_rooms"
    id = Column(Integer, primary_key=True, index=True)
    participants = Column(JSON, nullable=True)
    messages = relationship("Message", secondary=association_table4)
    creation_date = Column(DateTime, default=datetime.utcnow(), nullable=False)
    description = Column(String(300), nullable=True, unique=False)

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, nullable=False) # user_id
    content_text = Column(String(100), nullable=False, unique=False)