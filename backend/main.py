from fastapi import FastAPI, Depends, HTTPException, status
from sqlmodel import Session, select
from database import init_db, get_session, engine
from security import get_password_hash, verify_password, create_access_token
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
def login(login_data: models.UserLogin, session: Session = Depends(get_session)):

    statement = select(models.User).where(models.User.email == login_data.email)
    db_user = session.exec(statement).first()
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )
        
    if not verify_password(login_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid email or password"
        )

    access_token = create_access_token(data={"sub": db_user.email})    
    return {"access_token": access_token, "token_type": "bearer"}