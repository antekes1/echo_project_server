from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
import models
from sqlalchemy.orm import Session
from starlette import status
from database import SeesionLocal
from pathlib import Path
import os
import json, openai
from openai import OpenAI
from schemas.user import Token, UserBase
from schemas.friday import FridayBase, SearchBase
from .auth import get_current_user
from functions.friday.chat import Friday_chat
from settings import storages_path, archives_files_path

client = OpenAI(
    api_key='',
)

router = APIRouter(
    prefix='/ai',
    tags=['ai']
)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# assistant = client.beta.assistants.create(
#   name="Friday",
#   instructions="""
#   Jesteś asystentem głosowym. Jeśli użytkownik prosi o wykonanie jakiejś akcji (np. utworzenie notatki),
#     zwróć odpowiedź w formacie JSON, która zawiera odpowiedź dla użytkownika oraz akcję do wykonania.
#     Format JSON, który zwracasz, powinien wyglądać następująco:
#     {
#       "reply": "Twoja odpowiedź dla użytkownika",
#       "action": {
#         "action": "nazwa_akcji" lub "none",
#         "content": "treść notatki lub inne dane, jeśli istnieją"
#       }
#     }
#
#   Jeśli użytkownik po prostu rozmawia, ustaw akcję jako "none".
#   """,
#   tools=[{"type": "code_interpreter"}],
#   model="gpt-4o-mini",
# )
# thread = client.beta.threads.create()

# @router.post("/friday", status_code=status.HTTP_200_OK)
# async def read_user(request: FridayBase, db: db_dependency):
#     if request.token != None:
#        data = await get_current_user(token=request.token, db=db)
#        if 'username' in data:
#         username = data['username']
#         id = data['id']
#         user = db.query(models.User).filter(models.User.id == id).first()
#
#         if user is None:
#             raise HTTPException(status_code=404, detail='User not found')
#         else:
#             response = Friday_chat(sentence=request.msg)
#         data = {'response': response}
#         return data
#     else:
#         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid data')

# def generate_response_and_action(user_input):
#     # Zdefiniuj rolę systemową i instrukcje
#     system_prompt = """
#     Jesteś asystentem głosowym. Jeśli użytkownik prosi o wykonanie jakiejś akcji (np. utworzenie notatki),
#     zwróć odpowiedź w formacie JSON, która zawiera odpowiedź dla użytkownika oraz akcję do wykonania.
#     Format JSON, który zwracasz, powinien wyglądać następująco:
#     {
#       "reply": "Twoja odpowiedź dla użytkownika",
#       "action": {
#         "action": "nazwa_akcji" lub "none",
#         "content": "treść notatki lub inne dane, jeśli istnieją"
#       }
#     }
#
#     Jeśli użytkownik po prostu rozmawia, ustaw akcję jako "none".
#     """
#
#     # response = client.chat.completions.create(
#     #     model="gpt-4o-mini",
#     #     messages=[
#     #         {"role": "system", "content": system_prompt},
#     #         {"role": "user", "content": user_input}
#     #     ]
#     # )
#
#     response = client.beta.threads.messages.create(
#         thread_id=thread.id,
#         role="user",
#         content=user_input,
#     )
#
#     print(response)
#     assistant_reply = response['choices'][0]['message']['content']
#     return assistant_reply

@router.post("/friday", status_code=status.HTTP_200_OK)
async def read_user(request: FridayBase, db: db_dependency):
    if request.token != None:
       data = await get_current_user(token=request.token, db=db)
       if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()

        if user is None:
            raise HTTPException(status_code=404, detail='User not found')
        else:
            # response = Friday_chat(sentence=request.msg)
            user_input = "Utwórz notatkę o treści 'Spotkanie o 15:00'"
            response = generate_response_and_action(user_input)

            print(response)
        data = {'response': response}
        return data
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Invalid data')

async def list_files_in_storage(storage_path, full_path, items, text, storage_id):
    if os.path.isdir(storage_path):
        path = storage_path.replace(full_path, "/")
        for item in os.listdir(storage_path):
            item_path = os.path.join(storage_path, item)
            await list_files_in_storage(item_path, full_path=full_path, items=items, text=text, storage_id=storage_id)
    else:
        path = storage_path.replace(full_path, "/")
        print(f"Plik: {path}")
        filename = os.path.basename(path)
        from functions.search.api import NLP_API
        nlp = NLP_API()
        print(storage_path)
        nlp.process_file(storage_path)
        analysis = json.loads(nlp.to_json())
        print(analysis['summary'])
        items.append({"name": filename, "type": "file", "path": path.replace(filename, ""),
                          "storage_id": storage_id})

@router.post("/search", status_code=status.HTTP_200_OK)
async def ai_search(request: SearchBase, db: db_dependency):
    data = await get_current_user(token=request.token, db=db)
    if 'username' in data:
        username = data['username']
        id = data['id']
        user = db.query(models.User).filter(models.User.id == id).first()
    if user is None:
        raise HTTPException(status_code=404, detail='User not found')
    storages = db.query(models.Storage).filter(models.Storage.owner_id == user.id).all()
    items = []
    for storage in storages:
        storage_path = storages_path + str(storage.id) + "/"
        print("storage path: ", storage_path)
        await list_files_in_storage(storage_path, full_path=storage_path, items=items, text=request.text,
                                    storage_id=storage.id)
    return {"msg": "success", "data": items}