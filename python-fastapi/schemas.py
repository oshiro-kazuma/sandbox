from pydantic import BaseModel

from models import TaskStatus


class TaskBase(BaseModel):
    title: str
    description: str
    status: TaskStatus = TaskStatus.READY
    assignee: str = None


class TaskCreate(TaskBase):
    pass


class Task(TaskBase):
    id: int
