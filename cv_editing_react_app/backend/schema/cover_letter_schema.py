from pydantic import BaseModel, Field, field_validator


class CoverLetterResponse(BaseModel):
    """AI-generated tailored cover letter with extracted job metadata."""

    cover_letter: str = Field(
        description="A professional cover letter written in Markdown format, maximum 200 words."
    )

    job_title: str = Field(
        description="Extracted or inferred job title from the job description."
    )

    company: str = Field(
        default="Unknown",
        description="Extracted company name or Unknown if not available."
    )
