from fastapi import FastAPI, Depends, HTTPException, status, Query
from sqlmodel import Session, select, col, desc
from database import init_db, get_session, engine
from security import get_password_hash, verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from contextlib import asynccontextmanager
import jwt
import models
import uuid

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield

app = FastAPI(
    title="ProjectSphere API",
    description="The heavy-duty backend engine for showcasing student innovations.",
    version="1.0.0",
    lifespan=lifespan
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@app.get("/")
def read_root():
    return {"status": "ProjectSphere Backend Engine is Online"}

@app.post("/users/", response_model=models.UserPublic)
def create_user(user_data: models.UserCreate, session: Session = Depends(get_session)):
    hashed_pw = get_password_hash(user_data.password)
    db_user = models.User(
        name=user_data.name,
        email=user_data.email,
        password_hash=hashed_pw
    )

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user

@app.get("/users/", response_model=List[models.UserPublic])
def get_all_users(session: Session = Depends(get_session)):
    statement = select(models.User)
    results = session.exec(statement).all()
    return results

@app.get("/users/{user_id}", response_model=models.UserPublicWithProjects)
def get_single_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="User not found"
        )
    return user



def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise credentials_exception

    statement = select(models.User).where(models.User.email == email)
    user = session.exec(statement).first()
    
    if user is None:
        raise credentials_exception
        
    return user



@app.patch("/users/{user_id}", response_model=models.User)
def update_user(
    user_id: uuid.UUID, 
    user_update_data: models.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: You can only modify your own account."
        )
    
    db_user = session.get(models.User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404, 
            detail="User not found."
        )
    
    update_dict = user_update_data.model_dump(exclude_unset=True)
    
    for key, value in update_dict.items():
        if key != "id":
            setattr(db_user, key, value)
            
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@app.delete("/users/{user_id}")
def delete_user(
    user_id: uuid.UUID, 
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    if user_id != current_user.id:
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: You cannot delete another user's account."
        )
    
    db_user = session.get(models.User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404, 
            detail="User not found."
        )
        
    session.delete(db_user)
    session.commit()
    
    return {"status": "success", "message": f"User account {user_id} has been permanently deleted."}

@app.post("/login/")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):

    statement = select(models.User).where(models.User.email == form_data.username)
    db_user = session.exec(statement).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
        
    if not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": db_user.email})    
    return {"access_token": access_token, "token_type": "bearer"}





@app.get("/users/me/")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user



@app.post("/projects/", response_model=models.Project)
def create_project(
    project_data: models.ProjectCreate, 
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    db_project = models.Project(
        **project_data.model_dump(mode="json"), 
        creator_id=current_user.id
    )
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project


@app.get("/projects/", response_model=List[models.ProjectPublic])
def read_projects(
    session: Session = Depends(get_session),
    offset: int = 0, 
    limit: int = Query(default=100, le=100),
    search: Optional[str] = None
):
    statement = select(models.Project)
    if search:
        statement = statement.where(col(models.Project.title).ilike(f"%{search}%"))

    statement = statement.order_by(desc(models.Project.created_at))
    statement = statement.offset(offset).limit(limit)
    projects = session.exec(statement).all()
    return projects


@app.get("/projects/{project_id}", response_model=models.Project)
def read_project(project_id: uuid.UUID, session: Session = Depends(get_session)):
    db_project = session.get(models.Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


@app.patch("/projects/{project_id}", response_model=models.Project)
def update_project(
    project_id: uuid.UUID,
    project_data: models.ProjectUpdate, 
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session)
):

    db_project = session.get(models.Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if db_project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this project")
        
    update_data = project_data.model_dump(exclude_unset=True, mode="json")
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    session.add(db_project)
    session.commit()
    session.refresh(db_project)
    return db_project


@app.delete("/projects/{project_id}")
def delete_project(
    project_id: uuid.UUID,
    current_user: models.User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    
    db_project = session.get(models.Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if db_project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
        
    session.delete(db_project)
    session.commit()
    
    return {"message": "Project deleted successfully"}