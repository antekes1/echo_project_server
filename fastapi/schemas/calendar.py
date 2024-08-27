from pydantic import BaseModel

class CreateCalendarBase(BaseModel):
    token: str
    name: str
    description: str

class CreateEventBase(BaseModel):
    token: str
    name: str
    color: str
    description: str
    participants: list
    date: list

class EditEventBase(BaseModel):
    token: str
    event_id: int
    name: str
    color: str
    description: str
    participants: list
    date: list

class GetEventsBase(BaseModel):
    token: str
    date: str

class GetEventBase(BaseModel):
    token: str
    id: int