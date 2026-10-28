from pydantic import BaseModel, Field, field_validator


class LinkedInConnectionMessage(BaseModel):
    """A short, casual LinkedIn connection message."""

    message: str = Field(
        description="A natural, human-like LinkedIn message that can be sent directly. No subject line, explanation, or bullet points."
    )
