from sqlmodel import SQLModel, create_engine, Session
from src.core.settings import settings

# Use a file-based SQLite database for persistence
sqlite_file_name = "remit.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, echo=True, connect_args=connect_args)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
