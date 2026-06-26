from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from database import init_db, get_session
import models
import uuid

app = FastAPI(
    title="ProjectSphere API",
    description="The heavy-duty backend engine for showcasing student innovations.",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def read_root():
    return {"status": "ProjectSphere Backend Engine is Online"}

@app.post("/users/")
def create_user(user: models.User, session: Session = Depends(get_session)):
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