import re
import os
from datetime import date, datetime
from sqlalchemy import create_engine, delete
from sqlalchemy.orm import Session
try:
    from .db_schema import Base, Job, LLM_Eval  # Relative import when called as a module
except ImportError:
    from db_schema import Base, Job, LLM_Eval   # Absolute import when run as a standalone script



# Database functions

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///jobs.db")
engine = create_engine(DATABASE_URL)

def init_db():
    Base.metadata.create_all(engine)

def remove_db():
    Base.metadata.drop_all(engine)


def delete_all_jobs():
    with Session(engine) as session:
        session.execute(delete(Job))
        session.commit()

def add_a_job(job: Job):
    job_id = job.id
    with Session(engine) as session:
        existing_job = session.get(Job, job_id)
        if existing_job is None:
            session.add(job)
            session.commit()
        else:
            print("Job already exists in the database")

def get_all_jobs():
    with Session(engine) as session:
        jobs = session.query(Job).all()
        return [job_to_dict(j) for j in jobs]

def delete_job_by_id(job_id: int):
    with Session(engine) as session:
        job = session.get(Job, job_id)
        if job is not None:
            session.delete(job)
            session.commit()
        else:
            print("Job not found in the database")


# Helper functions
def get_job_id(job_link):
    match = re.search(r"/view/(\d+)/", job_link)
    job_id = int(match.group(1))
    return job_id

def parse_job_posted_date(value):
    if value in (None, ""):
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time())
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    raise TypeError("job_posted_date must be a datetime, date, ISO string, or None")

def job_to_dict(job):
    return {
        "id": getattr(job, "id", None),
        "job_link": getattr(job, "job_link", None),
        "job_location": getattr(job, "job_location", None),
        "company_name": getattr(job, "company_name", None),
        "job_title": getattr(job, "job_title", None),
        "job_description": getattr(job, "job_description", None),
        "job_posted_date": getattr(job, "job_posted_date", None),
        "applicantsCount": getattr(job, "applicantsCount", None),

        "technical_skills_score": getattr(job, "technical_skills_score", 0),
        "tools_frameworks_score": getattr(job, "tools_frameworks_score", 0),
        "experience_score": getattr(job, "experience_score", 0),
        "domain_score": getattr(job, "domain_score", 0),
        "education_score": getattr(job, "education_score", 0),
        "matching_score": getattr(job, "matching_score", 0),

        "review": getattr(job, "review", None),
        "job_keywords": getattr(job, "job_keywords", []),
        "created_at": getattr(job, "created_at", None),
    }

def dict_to_job(data: dict) -> Job:
    return Job(
        id=data.get("job_id") if data.get("job_id") else get_job_id(data.get("job_link")),
        job_link=data.get("job_link"),
        job_location=data.get("job_location"),
        company_name=data.get("company_name"),
        job_title=data.get("job_title"),
        job_description=data.get("job_description"),
        job_posted_date=parse_job_posted_date(data.get("job_posted_date")),
        applicantsCount=data.get("applicantsCount"),

        technical_skills_score=data.get("technical_skills_score", 0),
        tools_frameworks_score=data.get("tools_frameworks_score", 0),
        experience_score=data.get("experience_score", 0),
        domain_score=data.get("domain_score", 0),
        education_score=data.get("education_score", 0),
        matching_score=data.get("matching_score", 0),

        review=data.get("review"),
        job_keywords=data.get("job_keywords", []),
    )

# LLM Evaluation functions
def add_llm_eval(llm_eval):
    with Session(engine) as session:
        session.add(llm_eval)
        session.commit()

import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Database management")

    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete all tables and recreate the database"
    )

    args = parser.parse_args()

    if args.reset:
        print("Dropping all tables...")
        remove_db()

        print("Creating tables...")
        init_db()

        print("Database reset completed.")
    else:
        init_db()
        print("Database initialized.")

# uv run python -m services.database.db --reset   