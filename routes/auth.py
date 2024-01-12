from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
from models import User
import models
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
import random, string
import sqlalchemy
from settings import secret_key_token, algorithm

from schemas.user import Token, UserBase

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

SECRET_KEY = secret_key_token
ALGORITM = algorithm

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')

class CreateUserRequest(BaseModel):
    username: str
    password: str

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def create_User(user_request: UserBase, db: db_dependency):
    #db_user = models.User(**user.dict(exclude='password'))
    create_user_model = User(
        **user_request.dict(exclude='password'),
        password = bcrypt_context.hash(user_request.password),
        perm = 'user',
        security_char = None
    )
    try:
        db.add(create_user_model)
        db.commit()
        return {'msg': "succes"}
    except sqlalchemy.exc.IntegrityError as error:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f'Invalid data')

@router.post("/login", response_model=Token)
async def login_user(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                     db: db_dependency):
    user = auth_user(form_data.username, form_data.password, db=db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Coud not validate user.")
    token = create_acces_token(user.username, user.id, None, db=db)
    return {'acces_token': token, 'toke_type': 'bearer'}

def auth_user(username: str, password: str, db):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.password):
        return False
    return user

def create_acces_token(username: str, user_id: int, expires_date: timedelta, db):
    encode = {'sub': username, 'id': user_id}
    user = db.query(User).filter(User.username == username).first()
    if expires_date != None:
        expires = datetime.utcnow() + expires_date
        encode.update({'exp': expires})
    if user.security_char != None:
        print('aaa')
        secure_code = ''.join(random.choices(string.ascii_letters + string.digits, k=24))
        updated_fields = {}
        updated_fields['security_char'] = secure_code
        print(secure_code)
        db.query(User).filter(User.id == user_id).update(updated_fields)
        db.commit()
    else:
        secure_code = user.security_char
    encode.update({'security_char': secure_code})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITM)

async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)], db):
    try: 
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        sec_char: int = payload.get('security_char')
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f'Could not validate user.')
            return False
        elif not db.query(User).filter(User.id == user_id).first():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f'User do not exist.')
            return False
        else:
            user = db.query(User).filter(User.id == user_id).first()
            if user.security_char != sec_char:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f'Token expired.')
        return {'username': username, 'id': user_id}
    except JWTError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f'Could not validate user. {error}')
    
@router.post("/delete_token/{token}", response_model=bool)
async def login_user(token: str, db: db_dependency):
    data = await get_current_user(token, db)
    if 'username' in data:
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user:
        db.query(User).filter(User.id == id).update({'security_char': None})
        db.commit()
        return True
    else:
        False