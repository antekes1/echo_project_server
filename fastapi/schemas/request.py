from pydantic import BaseModel

class requestAction(BaseModel):
    token: str
    request_id: int
    action: str

class getRequests(BaseModel):
    token: str