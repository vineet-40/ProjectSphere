from fastapi import FastAPI, Depends, HTTPException, status
from sqlmodel import Session, select
from database import init_db, get_session, engine
from security import get_password_hash, verify_password, create_access_token
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from security import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
import jwt
import models
import uuid

app = FastAPI(
    title="ProjectSphere API",
    description="The heavy-duty backend engine for showcasing student innovations.",
    version="1.0.0"
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"status": "ProjectSphere Backend Engine is Online"}

@app.post("/users/")
def create_user(user: models.User, session: Session = Depends(get_session)):
    user.password_hash = get_password_hash(user.password_hash)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.get("/users/")
def get_all_users(session: Session = Depends(get_session)):
    statement = select(models.User)
    results = session.exec(statement).all()
    return results

@app.get("/users/{user_id}")
def get_single_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
    user = session.get(models.User, user_id)
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="You haven't registered yet on our platform. First sign up."
        )
    return user

@app.patch("/users/{user_id}")
def update_user(user_id: uuid.UUID, user_update_data: models.User, session: Session = Depends(get_session)):
    db_user = session.get(models.User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404, 
            detail="Cannot update. This user is not registered on our platform."
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
def delete_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
    db_user = session.get(models.User, user_id)
    if not db_user:
        raise HTTPException(
            status_code=404, 
            detail="Cannot delete. This user does not exist on our platform."
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


@app.get("/projects/", response_model=list[models.Project])
def read_projects(
    offset: int = 0, 
    limit: int = 10, 
    session: Session = Depends(get_session)
):

    statement = select(models.Project).offset(offset).limit(limit)
    projects = session.exec(statement).all()
    return projects


@app.get("/projects/{project_id}", response_model=models.Project)
def read_project(project_id: uuid.UUID, session: Session = Depends(get_session)):
    db_project = session.get(models.Project, project_id)
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project