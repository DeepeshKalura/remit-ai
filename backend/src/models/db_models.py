from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel, JSON

class UserRelationship(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    related_user_id: int
    relation_name: str
    type: str

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    country: str
    wallet: str
    currency: str
    tags: List[str] = Field(default=[], sa_type=JSON)
    
    relationships: List["UserRelationship"] = Relationship(sa_relationship_kwargs={"cascade": "all, delete-orphan"})
