from typing import List

from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session

import database
import models
import schemas

"""migrate models to database"""
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()


def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def health():
    return {"message": "ok"}


@app.post("/tasks/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status,
        assignee=task.assignee,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@app.get("/tasks/", response_model=List[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = db.query(models.Task).offset(skip).limit(limit).all()
    return tasks


@app.get("/tasks/{task_id}", response_model=schemas.Task)
def read_task(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # wip
    tasks = db.query(models.Task).offset(skip).limit(limit).all()
    return tasks[0]
