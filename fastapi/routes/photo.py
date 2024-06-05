from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import models
import sqlalchemy
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
from pathlib import Path

from schemas.user import Token, UserBase, updateUser
from .auth import get_current_user

router = APIRouter(
    prefix='/photo',
    tags=['photo']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.get('/{filename}')
def get_profile_photo(filename: str):
    file_path = Path("static/photos") / filename
    # return FileResponse(path=file_path, filename=filename, media_type='image/png')
    file_stream = open(file_path, mode="rb")
    
    # Zwróć odpowiedź strumieniową
    return StreamingResponse(file_stream, media_type="image/png")