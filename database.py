from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from settings import url_database

URL_DATABASE = url_database

engine = create_engine(URL_DATABASE)

SeesionLocal = sessionmaker(autoflush=False, autocommit=False, bind=engine)

Base = declarative_base()