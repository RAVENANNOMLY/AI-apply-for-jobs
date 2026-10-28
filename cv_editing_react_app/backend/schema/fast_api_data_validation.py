from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union, Literal
from datetime import datetime


class LinkedInSearchURL(BaseModel):
    search_url: Optional[str] = None
    keywords: List[str] = []
    location: Optional[str] = None
    date_posted: Optional[str] = None
    under_10_applicants: Optional[bool] = None
    limit: Optional[int] = 2

    
class Html2PdfRequest(BaseModel):
    html_string: str
    name: Optional[str] = None
    doc_type: Literal["cv", "cover_letter"]
    

class CoverLetterRequest(BaseModel):
    full_cv_context: Dict[str, Any]
    job_analytics: Optional[Union[str, Dict[str, Any]]] = None

class CVRequest(BaseModel):
    full_cv_context: Dict[str, Any]
    job_analytics: Optional[Union[str, Dict[str, Any]]] = None
    sections: List[str] = None

class CVJSONRequest(BaseModel):
    cv_json: Dict[str, Any]


class JobDescriptionAnalysisRequest(BaseModel):
    job_description: str


class ConnectionRequest(BaseModel):
    profileText: str
    wordLimit: int 
    promptText: str
    cvText: Optional[Union[str, Dict[str, Any]]]
    creativity: float



class JobDBSchema(BaseModel):
    id: int
    job_link: str
    job_location: Optional[str]
    company_name: Optional[str]
    job_title: Optional[str]
    job_description: Optional[str]

    technical_skills_score: int
    tools_frameworks_score: int
    experience_score: int
    domain_score: int
    education_score: int
    matching_score: int

    review: Optional[str]
    job_keywords: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}