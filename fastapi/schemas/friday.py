from pydantic import BaseModel

class FridayBase(BaseModel):
    token: str
    msg: str