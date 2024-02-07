from pydantic import BaseModel

class CreateDatabaseBase(BaseModel):
    token: str
    name: str
    descr: str

class FilesBase(BaseModel):
    token: str
    database_id: int
    path: str

class GetFileBase(BaseModel):
    token: str
    database_id: int
    file_path: str
    filename: str

class UploadFileBase(BaseModel):
    token: str
    database_id: str
    dir_path: str
