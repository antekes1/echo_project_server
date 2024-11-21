import datetime

from pydantic import BaseModel

class GetChatrooms(BaseModel):
    token: str

class CreateChatrooms(BaseModel):
    token: str
    participants: list
    name: str
    description: str