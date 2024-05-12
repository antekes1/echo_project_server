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
from schemas.friday import FridayBase
from .auth import get_current_user
from functions.friday.chat import Friday_chat


router = APIRouter(
    prefix='/ai',
    tags=['ai']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/friday", status_code=status.HTTP_200_OK)
async def read_user(request: FridayBase, db: db_dependency):
    if request.token != None:
       data = await get_current_user(token=request.token, db=db)
       if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    
        if user is None:
            raise HTTPException(status_code=404, detail='User not found')
        else:
            response = Friday_chat(sentence=request.msg)
        data = {'response': response}
        return data
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid data')