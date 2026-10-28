
import json
from typing import List, Optional, Dict, Any, Union

from services.llm import LLM_With_Tracking
from services.prompt_factory import edit_cv_with_ai_prompt, extract_job_insights_prompt, create_cover_letter_prompt, generate_connection_message_prompt
from schema.job_analysis_schema import JobInsights
from schema.cv_edit_schema import SummarySection, ExperienceEntry, ProjectEntry, SkillGroup
from schema.cover_letter_schema import CoverLetterResponse
from schema.connection_message_schema import LinkedInConnectionMessage
from pydantic import create_model


def extract_job_insights(job_description: str):
    """
    Extract hiring signals from a Job Description.
    Returns:
        {
            "job_title": str,
            "company_name": str,
            "job_analysis_markdown": str
        }
    """


    llm_with_tracking = LLM_With_Tracking(temperature=0.2, task_name="job_analysis")

    prompt = extract_job_insights_prompt(job_description)
    messages = [("human", prompt)]
    output =llm_with_tracking.invoke_with_tracking(messages,pydantic_model=JobInsights)

    if output["error"]:
        raise Exception(output["error"])
    
    job_insights = output["structured_output"]
    parsed = job_insights.model_dump()
    return parsed


def edit_cv_with_ai(full_cv_context: Dict[str,Any], 
                    job_analytics: Optional[Union[str, Dict[str, Any]]],
                    sections: List[str] = None):

    """
    sections can contain any combination of:
    ["summary"]
    ["experience"]
    ["projects"]
    ["skills"]

    or

    ["summary", "experience", "projects", "skills"]
    """

    llm_with_tracking = LLM_With_Tracking(temperature=0.2, task_name="cv_editing")

    prompt = edit_cv_with_ai_prompt(full_cv_context, job_analytics, sections)
    messages = [("human", prompt)]

    fields = {}

    if "summary" in sections:
        fields["summary"] = (Optional[str], None)

    if "experience" in sections:
        fields["experience"] = (Optional[List[ExperienceEntry]], None)

    if "projects" in sections:
        fields["projects"] = (Optional[List[ProjectEntry]], None)

    if "skills" in sections:
        fields["skills"] = (Optional[List[SkillGroup]], None)

    CV_Schema = create_model(
        "EditableCVResponse",
        **fields
    )



    output =llm_with_tracking.invoke_with_tracking(messages,pydantic_model=CV_Schema)

    if output["error"]:
        raise Exception(output["error"])

    structured_output = output["structured_output"]
    parsed = structured_output.model_dump()
    return parsed


def create_cover_letter(full_cv_context: Dict[str,Any], job_analytics: Optional[Union[str, Dict[str, Any]]]):


    llm_with_tracking = LLM_With_Tracking(temperature=0.3, task_name="cover_letter")

    prompt = create_cover_letter_prompt(full_cv_context, job_analytics)
    messages = [("human", prompt)]
    output =llm_with_tracking.invoke_with_tracking(messages,pydantic_model=CoverLetterResponse)


    if output["error"]:
        raise Exception(output["error"])
    
    structured_output = output["structured_output"]
    parsed = structured_output.model_dump()
    return parsed
    

def generate_connection_message(profileText: str, wordLimit: int, promptText: str, cvText: Optional[Union[str, Dict[str, Any]]], temperature: float = 0.2):
    system_prompt, prompt = generate_connection_message_prompt(profileText, wordLimit, promptText, cvText)
    
    llm_with_tracking = LLM_With_Tracking(temperature=temperature, task_name="connction_message")

    messages = [("system", system_prompt), ("human", prompt)]
    output =llm_with_tracking.invoke_with_tracking(messages,pydantic_model=LinkedInConnectionMessage)


    if output["error"]:
        raise Exception(output["error"])
    
    structured_output = output["structured_output"]
    parsed = structured_output.model_dump()
    return parsed
