from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = ("postgresql+psycopg2://"
                           "sandbox_user:sandbox_user@db/sandbox")

# If you want to run it locally, please uncomment it.
# SQLALCHEMY_DATABASE_URL = ("postgresql+psycopg2://"
#                            "sandbox_user:sandbox_user@localhost/sandbox")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
