from pydantic import BaseModel

class FridayBase(BaseModel):
    token: str
    msg: str
class SearchBase(BaseModel):
    token: str
    text: str