from pydantic import BaseModel, Field
from typing import List

class JobInsights(BaseModel):
    job_title: str = Field(
        description="The job title."
    )

    company_name: str = Field(
        description="The company name. Use 'Not Specified' if unavailable."
    )

    required_skills: List[str] = Field(
        description="Most important technical skills, tools, frameworks, and technologies required for the role."
    )

    key_responsibilities: List[str] = Field(
        description="Top 3-5 responsibilities or missions of the role."
    )

    experience_level: str = Field(
        description="Expected seniority level (e.g., Junior, Mid, Senior, Lead, PhD, or Not Specified)."
    )

    role_summary: str = Field(
        description="A concise 2-3 sentence summary explaining the real purpose and impact of this role."
    )

if __name__ == "__main__":
    def get_simple_schema(model):
        schema = model.model_json_schema()

        return {
            field: [info.get("type"), info.get("description")]
            for field, info in schema["properties"].items()
        }
    
    print(get_simple_schema(JobInsights))
    # print(JobInsights.model_json_schema())