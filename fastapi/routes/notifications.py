from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
import models
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from settings import secret_key_token, algorithm
from .auth import get_current_user, bcrypt_context
from schemas.notification import DelNoti

router = APIRouter(
    prefix='/api/notifications',
    tags=['notifications'],
    include_in_schema=False
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# create notification (no router), del notification, create inbox

async def create_inbox(user_id: int, db: db_dependency):
    new_inbox = models.Inbox(
        owner_id = user_id,
    )
    db.add(new_inbox)
    db.commit()

async def create_notification(user_id: int, type, request_id, body: str, db: db_dependency):
    # werify inbox exist
    inbox = db.query(models.Inbox).filter(models.Inbox.owner_id == user_id).first()
    if type not in models.notification_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="that notification type does not exist")
    new_notification = models.Notifications(
        inbox = inbox,
        type = type,
        request_id = request_id,
        body = body
    )
    db.add(new_notification)
    db.commit()

@router.post("/del_notification", status_code=status.HTTP_200_OK)
async def del_notification(db: db_dependency, request: DelNoti):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    inbox = db.query(models.Inbox).filter(models.Inbox.owner_id == user.id).first()
    notification = db.query(models.Notifications).filter(models.Notifications.id == request.notification_id).first()
    if inbox is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your inbox does not exist")
    if notification is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="That notification does not exist")
