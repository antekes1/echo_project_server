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
    data = {'username': user.username, 'profile_pic': user.profile_photo, 'email': user.email, 'name': user.name, 'account_type': user.perm}
    return data


@router.get("/get/{user_id}", status_code=status.HTTP_200_OK)
async def user_info(user_id: str, db: db_dependency):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    data = {'username': user.username, 'profile_pic': user.profile_photo, 'name': user.name}
    return data

@router.post("/update", status_code=status.HTTP_200_OK)
async def update_user(db: db_dependency, request: updateUser):
    print(request.request_code)
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user != None:
        actual_info = [user.email, user.name, user.username]
        to_update_fields = {}
        if actual_info[0] != request.email and request.email != "None":
            if "@" and "." not in request.email:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid email value')
            if request.request_code in ["None", ""]:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'If you want to change email you must verify new one. Enter request_code.')
            verification_request = db.query(models.Email_verify_requests).filter(models.Email_verify_requests.code == request.request_code).first()
            if verification_request == None:
                print(request.request_code)
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f'Verification request not found, enter corret verification code')
            if verification_request.email != request.email:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Verification code or email is incorrect')
        for key, value in request.dict().items():
            if value != "None":
                if key not in ["token", "request_code"]:
                    # user.{key} = value
                    if hasattr(user, key):  # Sprawdź, czy model User ma pole o tej nazwie
                        setattr(user, key, value)
        try:
            db.commit()
            return {'msg': "succes"}
        except sqlalchemy.exc.IntegrityError as error:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Invalid data')
    else:
        raise HTTPException(status_code=404, detail='User not found')