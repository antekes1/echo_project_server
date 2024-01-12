from pydantic import BaseModel

class UserBase(BaseModel):
    username: str
    email: str
    name: str
    password: str

class Token(BaseModel):
    acces_token: str
    toke_type: str
