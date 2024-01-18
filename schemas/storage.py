from pydantic import BaseModel

class CreateDatabaseBase(BaseModel):
    token: str
    name: str
    descr: str