from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
import uuid

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class Project(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(index=True)
    description: str
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    creator_id: uuid.UUID = Field(foreign_key="user.id")