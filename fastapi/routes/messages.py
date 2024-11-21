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
from utils.permissions import InheritedPermissions, Perms
from schemas.messages import GetChatrooms, CreateChatrooms

router = APIRouter(
    prefix='/messages-api',
    tags=['messages']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/create_chatrooms", status_code=status.HTTP_200_OK)
async def create_chatrooms(db: db_dependency, request: CreateChatrooms):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    check_chat = db.query(models.Chatroom).filter(models.Chatroom.participants == request.participants + [user.id]).all()
    if len(request.participants) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='You can not create chat without any partisipants')
    if len(check_chat) > 5:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='5 Groups with same users already exist, that is the must amount')
    if len(request.participants) <= 1 and len(check_chat) == 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='That private chat already exist')
    for participant in request.participants:
        userr = db.query(models.User).filter(models.User.id == participant).first()
        if not userr:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="One from users does not exist")
    new_chatroom = models.Chatroom(
        participants = request.participants + [user.id],
        description = request.description,
        name = request.name,
    )
    db.add(new_chatroom)
    db.commit()
    return {"msg": "success"}

@router.post("/get_chatrooms", status_code=status.HTTP_200_OK)
async def get_chatrooms(db: db_dependency, request: GetChatrooms):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    chatrooms = db.query(models.Chatroom).filter(models.Chatroom.participants.contains(user.id)).all()
    data = []
    for chatroom in chatrooms:
        data.append([chatroom.id, chatroom.name])
    return {"msg": "success", "data": data}

#doddać pisanie wiadomości i ich odczytywanie, można dodać reagowanie i powadomienie o odczytaniu
# władowywanie po 50 wiadomości dizecić na takie czesći w load_messages dodać kótra to część i z ilu oraz w data tą częsć wiadomości