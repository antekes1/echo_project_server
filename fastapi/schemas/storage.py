from pydantic import BaseModel

class StorageInfo(BaseModel):
    token: str
    storage_id: int

class CreateDatabaseBase(BaseModel):
    token: str
    name: str
    descr: str
    size: float

class DelStorageBase(BaseModel):
    token: str
    storage_id: int

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
    storage_id: int
    path: str

class GetFileBase(BaseModel):
    token: str
    database_id: int
    file_path: str
    filename: str

class SearchFiles(BaseModel):
    token: str
    text: str