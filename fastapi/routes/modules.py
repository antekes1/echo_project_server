from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
import models
from .auth import get_current_user

router = APIRouter(
    prefix='/api/models',
    tags=['models'],
    include_in_schema=True
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

async def create_notification(db, user_id, type, request_id, body):
    # werify inbox exist
    inbox = db.query(models.Inbox).filter(models.Inbox.owner_id == user_id).first()
    if inbox is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="Your inbox does not exist")
    if type not in models.notification_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="that notification type does not exist")
    new_notification = models.Notifications(
        type = type,
        request_id = request_id,
        body = body
    )
    new_notification.inbox.append(inbox)
    return new_notification

async def create_request(token, db, type,  user_id, storage_id, event_id, friend_id):
    data = await get_current_user(token=token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        sender = db.query(models.User).filter(models.User.id == id).first()
    if sender is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user id")
    if type == "storage_request":
        to_check = "storage_id"
        value_to_check = storage_id
        new_request = models.Request(
            user_id = user_id,
            type = "storage_request",
            storage_id = storage_id,
            sender_id=sender.id,
        )
    elif type == "friend_request":
        to_check = "friend_id"
        value_to_check = friend_id
        if friend_id in user.friends:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That user is already your friend")
        new_request = models.Request(
            user_id=user.id,
            type="friend_request",
            friend_id=friend_id,
            sender_id=sender.id,
        )
    elif type == "calendar_event_request":
        to_check = "event_id"
        value_to_check = event_id
        new_request = models.Request(
            user_id=user.id,
            type="calendar_event_request",
            event_id=event_id,
            sender_id=sender.id,
        )
    else:
        return "invalid request type"

    existing_request = db.query(models.Request).filter(
        models.Request.user_id == user.id,
        getattr(models.Request, to_check) == value_to_check
    ).first()

    if existing_request:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Event request already exists")
    else:
        # add notification for user
        return {"msg": "success", "request": new_request} #add notificatons in parentrs