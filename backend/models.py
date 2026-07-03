from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
from pydantic import BaseModel, HttpUrl
import uuid

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
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

class ProjectCreate(SQLModel):
    title: str
    description: str
    github_url: Optional[HttpUrl] = None
    live_url: Optional[HttpUrl] = None

class ProjectUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str