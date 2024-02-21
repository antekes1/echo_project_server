from pydantic import BaseModel

class CreateDatabaseBase(BaseModel):
    token: str
    name: str
    descr: str

class updateStorage(BaseModel):
    token: str
    storage_id: int
    name: str
    descr: str

class ManageUsersStorages(BaseModel):
    token: str
    storage_id: int
    action: str
    updated_users_usernames: list

class FilesBase(BaseModel):
    token: str
    database_id: int
    path: str

class GetFileBase(BaseModel):
    token: str
    database_id: int
    file_path: str
    filename: str