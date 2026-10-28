from typing import List, Optional
from pydantic import BaseModel, Field


class SummarySection(BaseModel):
    """Rewritten professional summary tailored to the target job."""
    summary: str = Field(
        description="A concise 2-4 sentence professional summary aligned with the target role."
    )


class ExperienceEntry(BaseModel):
    """A single professional experience entry."""
    company: str = Field(description="Exact original company name.")
    position: str = Field(description="Exact original job title.")
    start_date: str = Field(description="Exact original start date.")
    end_date: str = Field(description="Exact original end date.")
    location: str = Field(description="Exact original location.")
    highlights: List[str] = Field(
        description="Tailored achievement bullets emphasizing relevant experience without changing facts."
    )



class ProjectEntry(BaseModel):
    """A single CV project."""
    name: str = Field(description="Exact original project name.")
    url: Optional[str] = Field(description="Original project URL if available.")
    highlights: List[str] = Field(
        description="Tailored project highlights emphasizing relevant technologies and outcomes."
    )



class SkillGroup(BaseModel):
    """A category of technical skills."""
    label: str = Field(
        description="Single-word category name for the skills."
    )
    details: List[str] = Field(
        description="List of relevant skills, each containing 1-2 words."
    )





if __name__ == "__main__":
    def get_simple_schema(model):
        schema = model.model_json_schema()

        return {
            field: [info.get("type"), info.get("description")]
            for field, info in schema["properties"].items()
        }
    
    print(ExperienceSection.model_json_schema())
    # print(JobInsights.model_json_schema())