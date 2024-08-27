import http
from datetime import timedelta, datetime
from typing import Annotated

import requests.utils
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.encoders import jsonable_encoder
import models
from models import Calendar, Calendar_event
from sqlalchemy import func
from sqlalchemy.sql import text
import sqlalchemy
from sqlalchemy.orm import Session
import shutil
from starlette import status
from database import SeesionLocal
from pathlib import Path
import json, os
from redis import Redis
from database import engine, SeesionLocal
from schemas.calendar import CreateCalendarBase, EditEventBase, CreateEventBase, GetEventsBase, GetEventBase
from settings import storages_path, archives_files_path
from utils.permissions import InheritedPermissions, Perms
from schemas.storage import CreateDatabaseBase, FilesBase, GetFileBase, updateStorage, ManageUsersStorages, StorageInfo, DelStorageBase
from .auth import get_current_user

redis_conn = Redis(host='localhost', port=6379)
router = APIRouter(
    prefix='/api/calendar',
    tags=['calendar']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# create callendar, create event, get_events (for mounth),
# delete event, edit event, get_event_detail

@router.post("/create_calendar", status_code=status.HTTP_201_CREATED)
async def create_calendar(request: CreateCalendarBase,db: db_dependency):

    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')

    calendar = db.query(models.Calendar).filter(models.Calendar.owner_id == user.id).first()
    if calendar != None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your calendar already exist.")
    exclude = ["token"]
    create_storage = Calendar(
        **request.dict(exclude=exclude),
        owner_id = user.id,
    )
    db.add(create_storage)
    db.commit()
    data = {'msg': 'succes'}
    return data

@router.post("/add_event", status_code=status.HTTP_201_CREATED)
async def add_event(db: db_dependency, request: CreateEventBase):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    calendar = db.query(models.Calendar).filter(models.Calendar.owner_id == user.id).first()
    if calendar == None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your calendar do not exist.")
    users = []
    for user in request.participants:
        searched_user = db.query(models.User).filter(models.User.name == user).first()
        if searched_user != None:
            users.append(searched_user.id)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'User {user} do not exist')
    print(users)
    dates = request.date
    converted_dates = [datetime.strptime(date, '%d.%m.%Y').strftime('%Y-%m-%d') for date in dates]

    # Konwersja listy participants na JSON lub CSV
    # if users:
    #     participants_str = json.dumps(users)  # Konwersja do JSON
    # else:
    #     participants_str = None

    exclude = ["token", "participants", "date", "owner_id"]
    create_event = Calendar_event(
        **request.dict(exclude=exclude),
        participants=users,
        date=converted_dates,
        owner_id=user.id,
    )
    db.add(create_event)
    db.commit()
    create_event.calendar.append(calendar)
    db.commit()
    return {"msg": "success"}

@router.post("/del_event", status_code=status.HTTP_200_OK)
async def delete_event(db: db_dependency, request: GetEventBase):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    calendar = db.query(models.Calendar).filter(models.Calendar.owner_id == user.id).first()
    if calendar == None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your calendar do not exist.")
    event_to_del = db.query(models.Calendar_event).filter(models.Calendar_event.id == request.id).first()
    if event_to_del == None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event does not exist")
    if user.id != event_to_del.owner_id and Perms().del_calendar_event not in InheritedPermissions().get_permissions(user.perm):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You must be owner of calendar event to delete it")
    # add deleting form guests calendars form owner panel and guest panel (edit) -> owner del -> participant
    db.delete(event_to_del)
    db.commit()
    return {"msg": "success"}

@router.post("/edit_event", status_code=status.HTTP_200_OK)
async def edit_event(db: db_dependency, request: EditEventBase):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    calendar = db.query(models.Calendar).filter(models.downer_id == user.id).first()
    if calendar == None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your calendar do not exist.")
    to_edit = db.query(models.Calendar_event).filter(models.Calendar_event.id == request.event_id).first()
    if to_edit is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This event does not exist")
    if to_edit.owner_id != user.id and Perms().full_perm not in InheritedPermissions().get_permissions(user.perm):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You must be owner of this event to edit.")
    users = []
    for user in request.participants:
        searched_user = db.query(models.User).filter(models.User.name == user).first()
        if searched_user != None:
            users.append(searched_user.id)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'User {user} do not exist')
    print(users)
    dates = request.date
    converted_dates = [datetime.strptime(date, '%d.%m.%Y').strftime('%Y-%m-%d') for date in dates]
    to_edit.name = request.name
    to_edit.description = request.description
    to_edit.date = converted_dates
    to_edit.color = request.color
    to_edit.participants = users,
    db.commit()
    return {"msg": "success"}

@router.post("/get_events", status_code=status.HTTP_200_OK)
async def get_events(db: db_dependency, request: GetEventsBase):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    calendar = db.query(models.Calendar).filter(models.Calendar.owner_id == user.id).first()
    if calendar == None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your calendar do not exist.")
    events = db.query(models.Calendar_event).filter(models.Calendar_event.calendar.any(id=calendar.id)).all()
    month_events = {}
    month_year = request.date.split(".")
    target_date = f"{month_year[1]}-{month_year[0]}"
    for event in events:
        for event_date in event.date:
            if event_date.startswith(target_date):
                month_events[event_date] = event.id
    return {"msg": "success", "data": month_events}

@router.post("/get_event", status_code=status.HTTP_200_OK)
async def get_event_detail(db: db_dependency, request: GetEventBase):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    callendar_event = db.query(models.Calendar_event).filter(models.Calendar_event.id == request.id).first()
    if callendar_event is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Event does not exist")
    user_callendar = db.query(models.Calendar).filter(models.Calendar.owner_id == user.id).first()
    if user_callendar is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Your calendar does not exist")
    if user.id not in callendar_event.participants and user_callendar not in callendar_event.calendar:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have not access to the calendar event")
    event_data = {"name":callendar_event.name,
                  "description": callendar_event.description,
                  "color": callendar_event.color,
                  "participants": callendar_event.participants,
                  "date": callendar_event.date}
    return {"msg":"success", "data": event_data}