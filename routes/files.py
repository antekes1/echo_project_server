from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from fastapi.encoders import jsonable_encoder

import models
from sqlalchemy import func
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
import shutil

from starlette import status
from database import SeesionLocal
from pathlib import Path
import json, os
from settings import storages_path

from schemas.user import Token, UserBase
from schemas.storage import CreateDatabaseBase, FilesBase, GetFileBase , UploadFileBase
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

@router.post("/files", status_code=status.HTTP_200_OK)
async def get_files_infile(request: FilesBase, db: db_dependency):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    storage = db.query(models.Storage).filter(models.Storage.id == request.database_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    if storage is None:
        raise HTTPException(status_code=404, detail='Sotrage not found')
    if not user in storage.valid_users and user.perm == 'admin' or 'owner':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User permission denty')
    else:
        path = storages_path + f'{storage.id}' + request.path
        try:
            return os.listdir(path=path)
        except:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Bad request")
        
@router.post("/get_file", status_code=status.HTTP_200_OK)
async def get_files_infile(db: db_dependency, request: GetFileBase):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    storage = db.query(models.Storage).filter(models.Storage.id == request.database_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    if storage is None:
        raise HTTPException(status_code=404, detail='Storage not found')
    if not user in storage.valid_users and user.perm == 'admin' or 'owner':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User permission denty')
    else:
        path = storages_path + f'{storage.id}' + request.file_path
        # przetesotwać to ===
        try:
            return FileResponse(path, media_type="application/octet-stream", filename=request.filename)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="File not found")
        
@router.post("/upload_file", status_code=status.HTTP_200_OK)
async def upload_file(db: db_dependency, token: str = Form(...), dir_path: str = Form(...), database_id: int = Form(...), file: UploadFile = File(...)):
    data = await get_current_user(token=token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    storage = db.query(models.Storage).filter(models.Storage.id == database_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    if storage is None:
        raise HTTPException(status_code=404, detail='Storage not found')
    if not user in storage.valid_users and str(user.perm) not in ['owner', 'admin']:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User permission denied')
    else:
        path = storages_path + str(storage.id) + dir_path + file.filename
        if file.filename in os.listdir(storages_path + str(storage.id) + dir_path):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='That file already exist')
        try:
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            file.file.close()
        return {'msg': 'File upload successful'}