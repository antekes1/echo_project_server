from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
from models import User
import models
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError

from schemas.user import Token, UserBase
from .auth import get_current_user
import templates

router = APIRouter(
    prefix='/admin',
    tags=['admin']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.get("/", response_class=HTMLResponse)
def home():
    return 'hi'