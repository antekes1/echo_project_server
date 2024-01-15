from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import models
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
from pathlib import Path

from schemas.user import Token, UserBase
from .auth import get_current_user


router = APIRouter(
    prefix='/user',
    tags=['user']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.get("/{user_token}", status_code=status.HTTP_200_OK)
async def read_user(user_token: str, db: db_dependency):
    data = await get_current_user(token=user_token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    data = {'username': user.username, 'profile_pic': user.profile_photo, 'email': user.email, 'name': user.name}
    return data