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
from schemas.request import requestAction

router = APIRouter(
    prefix='/api/request',
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
            pass
        elif req.type == "calendar_event_request":
            pass
        else:
            print("error")
        db.delete(req)
        db.commit()
        return {"msg": "success"}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid option fot action in request")