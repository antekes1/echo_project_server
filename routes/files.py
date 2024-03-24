from datetime import timedelta, datetime
from typing import Annotated

import requests.utils
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.encoders import jsonable_encoder
import models
from sqlalchemy import func
from sqlalchemy.sql import text
import sqlalchemy
from sqlalchemy.orm import Session
import shutil
from starlette import status
from database import SeesionLocal
from pathlib import Path
import json, os
from settings import storages_path
from schemas.storage import CreateDatabaseBase, FilesBase, GetFileBase, updateStorage, ManageUsersStorages, StorageInfo
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

@router.post("/info", status_code=status.HTTP_200_OK)
async def get_storage_info(db: db_dependency, request: StorageInfo):
    data = await get_current_user(token=request.token, db=db)
    if 'id' in data:
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='User not found')
    storage = db.query(models.Storage).filter(models.Storage.id == request.storage_id).first()
    if storage is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Storage do not exist.')
    if user not in storage.valid_users:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="You have not permission to this storage.")

    owner_storage = db.query(models.User).filter(models.User.id == storage.owner_id).first()
    total_size = 0
    storage_path = storages_path + str(storage.id)
    for dirpath, dirnames, filenames in os.walk(storage_path):
        for filename in filenames:
            file_path = os.path.join(dirpath, filename)
            total_size += os.path.getsize(file_path)
    data = {'name': storage.name, 'description': storage.description, 'owner_username': owner_storage.username, 'max_size': storage.max_size, 'actual_size': total_size}
    return data

@router.post("/create_storage", status_code=status.HTTP_200_OK)
async def create_storage(request: CreateDatabaseBase, db: db_dependency):
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
    user_storages = db.query(models.Storage).filter(models.Storage.owner_id == user.id).all()
    if len(user_storages) >= 1 and str(user.perm) not in ['admin', 'owner']:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='You have your storage already created')
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
@router.put("/update", status_code=status.HTTP_200_OK)
async def update_storage(db: db_dependency, request: updateStorage):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    storage = db.query(models.Storage).filter(models.Storage.id == request.storage_id).first()
    if storage is None:
        raise HTTPException(status_code=404, detail='Storage do not exist')
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    if user.id != storage.owner_id:
        raise HTTPException(status_code=404, detail='You must be a owner of storage, to modify it.')
    if request.name.lower() != "none":
        test_storage = db.query(models.Storage).filter(models.Storage.name == request.name).first()
        if test_storage != None and test_storage.id != storage.id:
            raise HTTPException(status_code=404, detail='Storage with that name already exist')
        storage.name = request.name
    if request.descr.lower() != "none":
        storage.description = request.descr
    try:
        db.commit()
        return {'msg': "succes"}
    except sqlalchemy.exc.IntegrityError as error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Invalid data')

@router.put("/users", status_code=status.HTTP_200_OK)
async def updated_storage_users(db: db_dependency, request: ManageUsersStorages):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    storage = db.query(models.Storage).filter(models.Storage.id == request.storage_id).first()
    if storage is None:
        raise HTTPException(status_code=404, detail='Storage do not exist')
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    if user.id != storage.owner_id:
        raise HTTPException(status_code=404, detail='You must be a owner of storage, to modify it.')

    errors = []
    if request.action == 'get_current_users':
        validated_users = []
        for user in storage.valid_users:
            validated_users.append(user.username)
        return {'current_users': validated_users}
    elif request.action == 'add_users':
        if request.updated_users_usernames != []:
            for username in request.updated_users_usernames:
                user_toadd = db.query(models.User).filter(models.User.username == username).first()
                if user_toadd != None:
                    if user_toadd != storage.owner_id:
                        if not user_toadd in storage.valid_users:
                            storage.valid_users.append(user_toadd)
                        else:
                            errors.append('User is already added')
                else:
                    errors.append('User does not exist')
    elif request.action == 'remove_users':
        if request.updated_users_usernames != []:
            for username in request.updated_users_usernames:
                user_toadd = db.query(models.User).filter(models.User.username == username).first()
                if user_toadd != None:
                    if user_toadd in storage.valid_users:
                        if user_toadd.id != storage.owner_id:
                            storage.valid_users.remove(user_toadd)
                        else:
                            errors.append("You can't delete owner of storage")
                    else:
                        errors.append('User has not added yet')
                else:
                    errors.append('User does not exist')
    try:
        db.commit()
        if errors == []:
            return {'msg': "succes"}
        else:
            return {'msg': "something went wrong", 'errors': errors}
    except sqlalchemy.exc.IntegrityError as error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Invalid data')

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
    if not user in storage.valid_users and str(user.perm) not in ['owner', 'admin']:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User permission denied')
    else:
        path = storages_path + f'{storage.id}' + request.file_path
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
        folder_path = storages_path + str(storage.id) + dir_path
        storage_path = storages_path + str(storage.id)
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(storage_path):
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                total_size += os.path.getsize(file_path)
        if total_size + file.size > storage.max_size * 1000000000 and str(user.perm) not in ['owner', 'admin']:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail='The file size is to big for your storage limit')
        try:
            with open(path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        finally:
            file.file.close()
        return {'msg': 'File upload successful'}

@router.delete("/del_item", status_code=status.HTTP_200_OK)
async def delete_file(db: db_dependency, request: FilesBase):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    storage = db.query(models.Storage).filter(models.Storage.id == request.database_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    if storage is None:
        raise HTTPException(status_code=404, detail='Storage not found')
    if not user in storage.valid_users and str(user.perm) not in ['owner', 'admin']:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User permission denied')
    else:
        path = storages_path + f'{storage.id}' + request.path
        if os.path.isfile(path):
            os.unlink(path)
            return {'msg': 'File successfully deleted'}
        elif os.path.isdir(path):
            shutil.rmtree(path)
            return {'msg': 'Dir successfully deleted'}
        else:
            raise HTTPException(status_code=404, detail="File not found")

@router.post("/create_dir", status_code=status.HTTP_201_CREATED)
async def get_files_infile(db: db_dependency, request: FilesBase):
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
    if not user in storage.valid_users and str(user.perm) not in ['owner', 'admin']:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User permission denied')
    else:
        path = storages_path + str(request.database_id) + request.path
        os.mkdir(path)
        return {'msg': 'Dir created successful'}