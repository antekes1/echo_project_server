from pydantic import BaseModel

class DelNoti(BaseModel):
    token: str
    notification_id: int