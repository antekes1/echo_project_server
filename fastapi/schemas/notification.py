from pydantic import BaseModel

class DelNoti(BaseModel):
    token: str
    notification_id: int

class GetNotifications(BaseModel):
    token: str

class PostNotification(BaseModel):
    token: str
    users: list
    body: str