from enum import Enum as PyEnum

from sqlalchemy import Column, Enum, Integer, String
from sqlalchemy.ext.declarative import declarative_base


class TaskStatus(PyEnum):
    READY = "ready"
    IN_PROGRESS = "in-progress"
    COMPLETE = "complete"


Base = declarative_base()


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.READY)
    assignee = Column(String, index=True)
