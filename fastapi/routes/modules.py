from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
import models

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

async def create_request():
    pass