from datetime import timedelta, datetime
from typing import Annotated

import requests
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
import models
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from settings import secret_key_token, algorithm
from .auth import get_current_user, bcrypt_context
from utils.permissions import InheritedPermissions, Perms
from schemas.notes import CreateNote, UpdateNote, GetNotes, DelNotes

router = APIRouter(
    prefix='/notes-api',
    tags=['notes']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@router.post("/get_notes", status_code=status.HTTP_200_OK)
async def get_notes(db: db_dependency, request: GetNotes):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    notes = db.query(models.Note).filter(models.User.notes).all()
    data = []
    for note in notes:
        data.append({"name": note.name, "body": note.body, "id": note.id})
    return {"msg": "succes", "data": data}

@router.post("/create", status_code=status.HTTP_200_OK)
async def crete_note(db: db_dependency, request: CreateNote):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    new_note = models.Note(
        name=request.name,
        body=request.body,
    )
    db.add(new_note)
    user.notes.append(new_note)
    db.commit()
    return {"msg":"success"}

@router.post("/update", status_code=status.HTTP_200_OK)
async def update_note(db: db_dependency, request: UpdateNote):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    note = db.query(models.Note).filter(models.Note.id == request.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That note does not exist")
    if request.name != "none":
        note.name = request.name
    if request.body != "none":
        note.body = request.body
    db.commit()
    return {"msg": "success"}

@router.post("/delete", status_code=status.HTTP_200_OK)
async def delete_note(db: db_dependency, request: DelNotes):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    note = db.query(models.Note).filter(models.Note.id == request.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="That note does not exist")
    if note not in user.notes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This is not your note")
    db.execute(models.association_table5.delete().where(models.association_table5.c.note_id == note.id))
    db.delete(note)
    db.commit()
    return {"msg": "success"}