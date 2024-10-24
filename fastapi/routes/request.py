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
from schemas.request import requestAction, getRequests
from sqlalchemy.orm.attributes import flag_modified

router = APIRouter(
    prefix='/api-request',
    tags=['request'],
    include_in_schema=True
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/get_requests", status_code=status.HTTP_200_OK)
async def request_action(db: db_dependency, requestt: getRequests):
    data = await get_current_user(token=requestt.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    requests = db.query(models.Request).filter(models.Request.user_id == user.id).all()
    requests_with_info = []
    for request in requests:
        sender = db.query(models.User).filter(models.User.id == request.sender_id).first()
        request_info = {"id": request.id, "type": request.type, "sender": sender.username}
        if request.type == "friend_request":
            person = db.query(models.User).filter(models.User.id == request.friend_id).first()
            if person:
                request_info["friend_username"] = person.username
                request_info["friend_name"] = person.name
        elif request.type == "storage_request":
            storage = db.query(models.Storage).filter(models.Storage.id == request.storage_id).first()
            if storage:
                request_info["storage_name"] = storage.name
                storage_owner = db.query(models.User).filter(models.User.id == storage.owner_id).first
                request_info["storage_owner"] = storage_owner
        elif request.type == "calendar_event_request":
            event = db.query(models.Calendar_event).filter(models.Calendar_event.id == request.event_id)
            if event:
                request_info["event_name"] = event.name
                request_info["event_date"] = event.dates
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That request type does not exist")
        requests_with_info.append(request_info)
    return {"msg": "success", "data": requests_with_info}
@router.post("/reply_on_request", status_code=status.HTTP_200_OK)
async def request_action(db: db_dependency, request: requestAction):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    req = db.query(models.Request).filter(models.Request.id == request.request_id).first()
    if req is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request does not exist")
    if user.id != req.user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This is not request for you")
    if request.action == "reject":
        db.delete(req)
        db.commit()
        return {"msg": "success"}
    elif request.action == "accept":
        if req.type == "storage_request":
            storage = db.query(models.Storage).filter(models.Storage.id == req.storage_id).first()
            if storage is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This storage does not exist")
            storage.valid_users.append(user)
        elif req.type == "friend_request":
            friend_to_add = db.query(models.User).filter(models.User.id == req.friend_id).first()
            if friend_to_add is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This user does not exist")
            print(friend_to_add.id)
            if user.friends is None:
                user.friends = []
            if friend_to_add.friends is None:
                friend_to_add.friends = []
            user.friends.append(friend_to_add.id)
            friend_to_add.friends.append(user.id)
            flag_modified(user, "friends")
            flag_modified(friend_to_add, "friends")
        elif req.type == "calendar_event_request":
            # create_event.calendar.append(calendar)
            event_to_add = db.query(models.Calendar_event).filter(models.Calendar_event.id == req.event_id).first()
            if event_to_add is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That event does not exist")
            user_calendar = db.query(models.Calendar).filter(models.Calendar.owner_id == req.user_id).first()
            if user_calendar is None:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your calendar does not exist")
            event_to_add.calendar.append(user_calendar)
            db.commit()
        else:
            print("error")
        db.delete(req)
        db.commit()
        return {"msg": "success"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid option fot action in request")