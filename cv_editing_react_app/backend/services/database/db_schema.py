from sqlalchemy import (
    String,
    Integer,
    Text,
    JSON,
    Float,
    DateTime
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)

    job_link: Mapped[str] = mapped_column(Text, nullable=False)
    job_location: Mapped[str | None] = mapped_column(String, nullable=True)
    company_name: Mapped[str | None] = mapped_column(String, nullable=True)
    job_title: Mapped[str | None] = mapped_column(String, nullable=True)
    job_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    job_posted_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    applicantsCount: Mapped[int | None] = mapped_column(Integer, nullable=True)

    technical_skills_score: Mapped[int] = mapped_column(default=0)
    tools_frameworks_score: Mapped[int] = mapped_column(default=0)
    experience_score: Mapped[int] = mapped_column(default=0)
    domain_score: Mapped[int] = mapped_column(default=0)
    education_score: Mapped[int] = mapped_column(default=0)

    matching_score: Mapped[int] = mapped_column(default=0)

    review: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Stored as JSON array
    job_keywords: Mapped[list[str] | None] = mapped_column(JSON)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    def __repr__(self):
        return f"Job(id={self.id}, company_name={self.company_name}, job_title={self.job_title})"
    
class LLM_Eval(Base):
    __tablename__ = "llm_eval"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    model_name: Mapped[str] = mapped_column(String(255), nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    task_name: Mapped[str] = mapped_column(String(255), nullable=False)

    raw_output: Mapped[str | None] = mapped_column(Text, nullable=True)

    time_taken: Mapped[float] = mapped_column(Float, nullable=False)

    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    total_tokens: Mapped[int] = mapped_column(Integer, default=0)

    error: Mapped[str | None] = mapped_column(Text, nullable=True)

    def __repr__(self):
        return f"LLM_Eval(id={self.id}, task_name={self.task_name}, time_taken={self.time_taken})"



    


