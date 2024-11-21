import datetime
from pydantic import BaseModel

class CreateNote(BaseModel):
    token: str
    name: str
    body: str

class UpdateNote(BaseModel):
    token: str
    id: int
    name: str
    body: str

class GetNotes(BaseModel):
    token: str

class DelNotes(BaseModel):
    token: str
    id: int