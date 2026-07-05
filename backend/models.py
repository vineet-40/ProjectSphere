from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime, timezone
from pydantic import BaseModel, HttpUrl
import uuid

class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    email: str = Field(unique=True, index=True)
    password_hash: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

    projects: List["Project"] = Relationship(back_populates="creator")

class UserCreate(SQLModel):
    name: str
    email: str
    password: str

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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    creator_id: uuid.UUID = Field(foreign_key="user.id")
    creator: Optional["User"] = Relationship(back_populates="projects")

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


class ProjectPublic(SQLModel):
    id: uuid.UUID
    title: str
    description: str
    github_url: Optional[str] = None
    live_url: Optional[str] = None

class UserPublic(SQLModel):
    id: uuid.UUID
    name: str
    email: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserPublicWithProjects(UserPublic):
    projects: List[ProjectPublic] = []