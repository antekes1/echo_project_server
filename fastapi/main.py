import os, time, datetime
from importlib import import_module
import importlib
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from fastapi.responses import HTMLResponse
from typing import List, Annotated
import models
from database import engine, SeesionLocal
from sqlalchemy.orm import Session
from schemas.user import UserBase
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi.responses import FileResponse, StreamingResponse
import httpx

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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],
)

# app.config = {"max_upload_size": "500.0 MB"}

for thing in routes_list:
    app.include_router(thing.router)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

# Ensure all paths within the dist directory are correctly served
app.mount("/assets", StaticFiles(directory="../react/echo-web/dist/assets"), name="assets")
app.mount("/app", StaticFiles(directory="../react/echo-web/dist"), name="app")

@app.get("/")
async def root():
    return FileResponse(os.path.join("../react/echo-web/dist", "index.html"))

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str, request: Request):
    # Check if the path corresponds to an existing static file
    static_file_path = os.path.join("dist", full_path)
    if os.path.isfile(static_file_path):
        return FileResponse(static_file_path)

    # Serve index.html for any path that does not correspond to a specific route
    return FileResponse(os.path.join("../react/echo-web/dist", "index.html"))

# @app.get("/removing_expired")
async def removing_expired():
    with Session(bind=engine) as session:
            email_requests = session.query(models.Email_verify_requests).all()
            for request in email_requests:
                if request.expiry_at <= datetime.datetime.today():
                    session.delete(request)
                    session.commit()

@app.on_event("startup")
async def startup_event():
    await removing_expired()
# @app.get("/", response_class=HTMLResponse)
# def home():
#     return """
#     <html>
#         <head>
#             <title>echo server</title>
#         </head>
#         <body>
#             <h1>Hi welcome in echo project server =)</h1>
#         </body>
#     </html>
#     """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)