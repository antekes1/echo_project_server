from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: str
    name: str
    password: str
    veryfication_code: str

class ResetPassBase(BaseModel):
    email: str
    new_password: str
    veryfication_code: str

class Token(BaseModel):
    acces_token: str
    toke_type: str

class verification_request(BaseModel):
    email: str

class ChangePassword(BaseModel):
    token: str
    old_password: str
    new_password: str

class updateUser(BaseModel):
    token: str
    request_code: str = None
    name: str = None
    username: str = None
    email: str = None

class addFriend(BaseModel):
    token: str
    username: str