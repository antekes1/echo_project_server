from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
from models import User
import models
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError
from settings import secret_key_token, algorithm

from schemas.user import Token, UserBase
from .auth import get_current_user, bcrypt_context

router = APIRouter(
    prefix='/admin',
    tags=['admin'], 
    include_in_schema=False
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
templates = Jinja2Templates(directory='templates')

@router.get("/", response_class=HTMLResponse)
async def home(request: Request, db: db_dependency):
    token = request.cookies.get('user_id')
    errors = []
    if token != None:
        payload = jwt.decode(token, secret_key_token, algorithms=algorithm)
        user_id = payload.get('subb')
        user = db.query(User).filter(User.id==user_id).first()
        if user is None:
            errors.append("You are not autenticated")
            templates.TemplateResponse('admin_panel.html', {'request': request, 'token': token, 'errors': errors})
        else:
            auth = True
    else:
        return templates.TemplateResponse('admin_panel.html', {'request': request, 'token': token, 'errors': errors})
    ## Działania do dashboardu admina
    if auth == True:
        users_list = db.query(User)
    return templates.TemplateResponse('admin_panel.html', {'request': request, 'token': token, 'errors': errors, 'user': user, 'users_list': users_list})

# @router.post("/")
# async def home(request: Request, response: Response, db: db_dependency):
#     token = await request.cookies.get('user_id')
#     print(token)
#     return templates.TemplateResponse('admin_panel.html', {'request': request, 'token': token})

@router.get("/login", response_class=HTMLResponse)
def login(request: Request):
    return templates.TemplateResponse('login.html', {'request': request})

@router.post("/login")
async def login_form(request: Request, db: db_dependency, response: Response):
    form = await request.form()
    username = form.get('username')
    password = form.get("password")
    errors = []
    if not username:
        errors.append('Enter valid username')
    if not password:
        errors.append('Enter valid password')

    try:
        user = db.query(User).filter(User.username == username).first()
        if user is None:
            errors.append('User does not exist')
            return templates.TemplateResponse('login.html', {'request': request, "errors": errors})
        else:
            if bcrypt_context.verify(password, user.password):
                if user.perm == 'admin' or user.perm == 'owner':
                    msg = "Login successful"
                    response = templates.TemplateResponse('login.html', {'request': request, "msg": msg})
                    data = {"subb": user.id}
                    id_hashed = jwt.encode(data, secret_key_token, algorithm=algorithm)
                    response.set_cookie(key='user_id', value=f'{id_hashed}', httponly=True)
                    return response
                else:
                    errors.append("Invalid permission")
                    return templates.TemplateResponse('login.html', {'request': request, "errors": errors})
            else:
                errors.append("Invalid Password")
                return templates.TemplateResponse('login.html', {'request': request, "errors": errors})
    except Exception as e:
        errors.append("Something Wrong !!")
        print(e)
        return templates.TemplateResponse('login.html', {'request': request, "errors": errors})