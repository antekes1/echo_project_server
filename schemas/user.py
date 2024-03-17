from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: str
    name: str
    password: str

class Token(BaseModel):
    acces_token: str
    toke_type: str

class ChangePassword(BaseModel):
    token: str
    old_password: str
    new_password: str

class updateUser(BaseModel):
    token: str
    name: str = None
    username: str = None
    email: str = None
