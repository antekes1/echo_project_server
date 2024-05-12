import os, time, datetime
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
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from fastapi.responses import FileResponse, StreamingResponse

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
)

app.config = {"max_upload_size": "500.0 MB"}

for thing in routes_list:
    app.include_router(thing.router)

def get_db():
    db = SeesionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]

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
@app.get('/status')
async def check_status():
    return 'online'

@app.get('/photo/{filename}')
def get_profile_photo(filename: str):
    file_path = Path("static/photos") / filename
    # return FileResponse(path=file_path, filename=filename, media_type='image/png')
    file_stream = open(file_path, mode="rb")
    
    # Zwróć odpowiedź strumieniową
    return StreamingResponse(file_stream, media_type="image/png")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)