from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import models
from sqlalchemy import func
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
from pathlib import Path
import json, os

from schemas.user import Token, UserBase
from schemas.storage import CreateDatabaseBase
from .auth import get_current_user


router = APIRouter(
    prefix='/storage',
    tags=['storage']
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
    #storages = db.query(models.Storage).filter(func.json_contains(json.dumps([user.id]), models.Storage.valid_users)).all()
    storages = db.query(models.Storage).filter(models.Storage.valid_users.any(models.User.id == user.id)).all()
    storages_data = []
    for storage in storages:
        data_2 = [storage.id, storage.name]
        storages_data.append(data_2)
    data = {'storages': storages_data}
    return data

@router.post("/create_storage", status_code=status.HTTP_200_OK)
async def read_user(request: CreateDatabaseBase, db: db_dependency):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    storage = db.query(models.Storage).filter(models.Storage.name == request.name).first()
    if storage != None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Storage with that name exist')
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    new_storage = models.Storage( 
        name=request.name,
        description = request.descr,
        owner_id = user.id,
    )
    db.add(new_storage)
    db.commit()
    new_storage.valid_users.append(user)
    db.commit()
    folder_path = os.path.join('./files/storages/', str(new_storage.id))
    os.makedirs(folder_path)
    data = {'msg': 'succes'}
    return data

