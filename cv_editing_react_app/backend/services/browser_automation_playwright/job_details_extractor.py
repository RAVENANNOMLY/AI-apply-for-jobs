
import json
from typing import List, Optional, Dict, Any, Union
from pydantic import ValidationError, BaseModel, Field

from services.llm import LLM_With_Tracking

class JobMatchAnalytics(BaseModel):
    technical_skills_score: int
    tools_frameworks_score: int
    experience_score: int
    domain_score: int
    education_score: int
    matching_score: int
    review: str
    job_keywords: List[str]




def extract_job_details(job_description: str, cv_context: Union[str,Dict[str,Any]]) -> JobMatchAnalytics:

    system_prompt = """
You are an expert AI recruiter and resume analyzer.

Your tasks:
1. Read the job description.
2. Compare it with the candidate CV.
3. Extract the 10 most important job keywords.
4. Score the candidate according to the rubric below.
5. Write a single concise sentence explaining the overall verdict.

SCORING RULES

1. Technical Skills Match (0-40 points)
- Nearly all required skills present: 35-40
- Most skills present: 25-34
- Some skills present: 10-24
- Few skills present: 0-9

2. Tools and Frameworks Match (0-20 points)
- Strong overlap: 16-20
- Partial overlap: 8-15
- Little overlap: 0-7

3. Experience Level Match (0-15 points)
- Fully meets requirements: 13-15
- Slightly below requirements: 8-12
- Significantly below requirements: 0-7

4. Domain Expertise (0-15 points)
- Directly relevant domain: 13-15
- Related domain: 7-12
- Weakly related or unrelated: 0-6

5. Education and Research Background (0-10 points)
- Strongly aligned: 8-10
- Partially aligned: 4-7
- Weak alignment: 0-3

FINAL SCORE GUIDELINES

90-100:
Exceptional fit. Use only when almost every major requirement is satisfied.

80-89:
Strong fit. Missing only minor requirements.

70-79:
Good fit. Some important requirements are missing.

60-69:
Moderate fit. Several requirements are missing.

40-59:
Weak fit.

0-39:
Poor fit.

IMPORTANT:
- Be conservative.
- Do not give scores above 90 unless the candidate satisfies nearly all requirements.
- The review must be exactly one sentence.
- Mention the biggest strengths and, if applicable, the main missing requirement.
- Keep the review under 25 words.
- Do NOT wrap the JSON in json or code fences.
- The first character of your response must be {.
- The last character of your response must be }.
- Return only the JSON object matching the required schema.
- Do NOT write any text before or after the JSON.

Output format:

{
  "technical_skills_score": 0,
  "tools_frameworks_score": 0,
  "experience_score": 0,
  "domain_score": 0,
  "education_score": 0,
  "matching_score": 0,
  "review": "",
  "job_keywords": [
    "keyword1",
    "keyword2",
    "keyword3"
  ]
}
"""
    prompt = f"""
Job Description:
{job_description}

Candidate CV:
{cv_context}
"""


    llm_with_tracking = LLM_With_Tracking(temperature=0.1, task_name="cv_to_job_matching")
    messages = [("system", system_prompt),("human", prompt)]
    output =llm_with_tracking.invoke_with_tracking(messages,pydantic_model=JobMatchAnalytics)

    if output["error"]:
        print(output["error"])
        return None

    structured_output = output["structured_output"]

    return structured_output
