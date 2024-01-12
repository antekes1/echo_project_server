import os, time
from importlib import import_module
import importlib
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from typing import List, Annotated
import models
from database import engine, SeesionLocal
from sqlalchemy.orm import Session
from schemas.user import UserBase

#import routes
routes_list = []
for file in os.listdir("./routes"):
    if file.endswith('.py'):
        route_name = file[:-3]
        root_module = import_module(f'routes.{route_name}')
        module = import_module(f'routes')
        globals()[route_name] = getattr(module, route_name)
        routes_list.append(root_module)

app = FastAPI(title="Echo", summary="echo")
models.Base.metadata.create_all(bind=engine)

# aa = auth
# app.include_router(aa.router)

for thing in routes_list:
    app.include_router(thing.router)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

@app.get("/", response_class=HTMLResponse)
def home():
    return """
    <html>
        <head>
            <title>echo server</title>
        </head>
        <body>
            <h1>Hi welcome in echo project server =)</h1>
        </body>
    </html>
    """
