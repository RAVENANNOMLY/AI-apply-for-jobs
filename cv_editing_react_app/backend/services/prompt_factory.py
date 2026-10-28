
from typing import Dict, Any, Optional, Union, List

def get_simple_schema(model):
    schema = model.model_json_schema()

    return {
        field: [info.get("type"), info.get("description")]
        for field, info in schema["properties"].items()
    }

def edit_cv_with_ai_prompt(
    full_cv_context: Dict[str, Any],
    job_analytics: Optional[Union[str, Dict[str, Any]]],
    sections: List[str] = None,
):
    """
    sections can contain any combination of:
    ["summary"]
    ["experience"]
    ["projects"]
    ["skills"]

    or

    ["summary", "experience", "projects", "skills"]
    """

    if sections is None:
        sections = ["summary", "experience", "projects", "skills"]

    cv_context = []
    instructions = []
    output_schema = []

    cv_context.append(f"Summary: {full_cv_context['summary']}")
    cv_context.append(f"Experience: {full_cv_context['experience']}")
    cv_context.append(f"Projects: {full_cv_context['projects']}")
    cv_context.append(f"Skills: {full_cv_context['skills']}")

    if "summary" in sections:

        instructions.append("""
    SUMMARY:
    Rewrite the candidate’s summary to emphasize only the most relevant and verifiable overlaps with the job description, based strictly on the provided Job Analysis and existing summary.

    - Focus on alignment with the role; prioritize shared skills, experience, and domain relevance.
    - Do not introduce any new claims, skills, or experiences not supported by the input.
    - Keep the result concise, clear, and professional (2–4 sentences maximum).
    - Ensure the tone remains natural and avoids exaggeration or overstatement.
    - Use Markdown bold formatting (**text**) to highlight the most relevant keywords, skills, technologies, domain expertise, and measurable achievements.
    - Highlight only the most important parts; do not bold entire sentences or excessive text.
    - The Markdown formatting must be included directly in the JSON string.
    - Example: "PhD-trained **AI/ML Engineer** with experience in **Computer Vision**, **GenAI**, and industrial **fault diagnosis**."
    """)

        output_schema.append(
            '"summary": "<rewritten summary with relevant terms highlighted using **bold** Markdown>"'
        )


    if "experience" in sections:

        instructions.append("""
    EXPERIENCE:
    - Keep the exact same number of experience entries, companies, dates, and titles.
    - Reorder the highlights so the most relevant achievements appear first.
    - Refine wording for clarity and impact without changing factual content.
    - Use Markdown bold formatting (**text**) to highlight the most relevant skills, technologies, methods, domain expertise, and measurable achievements in each highlight.
    - Highlight only important information; do not bold entire sentences.
    - The Markdown formatting must be included directly in the JSON strings.
    """)

        output_schema.append("""
    "experience": [
        {
            "company": "<exact original company>",
            "position": "<exact original position>",
            "start_date": "<exact original start date>",
            "end_date": "<exact original end date>",
            "location": "<exact original location>",
            "highlights": [
                "<tailored bullet 1 with relevant terms highlighted using **bold** Markdown>",
                "<tailored bullet 2 with relevant terms highlighted using **bold** Markdown>"
            ]
        }
    ]
    """)

    if "projects" in sections:
        

        instructions.append("""
PROJECTS:
- Keep the exact same projects.
- Refine descriptions to emphasize the tools, technologies, and outcomes most relevant to the target role.
""")

        output_schema.append("""
"projects": [
    {
        "name": "<exact original name>",
        "url": "<exact original URL or null>",
        "highlights": [
            "<tailored bullet 1>",
            "<tailored bullet 2>"
        ]
    }
]
""")

    if "skills" in sections:
        

        instructions.append("""
SKILLS:
- Extract only skills explicitly mentioned in the Job Analysis.
- Organize skills into ONLY 2–3 sections.
- Section labels must be a single word.
- Each skill must be 1–2 words maximum.
- Maximum total skills: 10–12.
""")

        output_schema.append("""
"skills": [
    {
        "label": "<section>",
        "details": [
            "<skill1>",
            "<skill2>"
        ]
    }
]
""")

    prompt = f"""
You are an expert CV optimization system specialized in AI research and industrial ML roles.

You will rewrite ONLY the requested CV sections.

STRICT GUARDRAILS:
1. NO HALLUCINATION.
2. NO EXAGGERATION.
3. FACTUAL INTEGRITY.
4. VOCABULARY ALIGNMENT.

### TARGET JOB ANALYSIS
<job_analysis>
{job_analytics}
</job_analysis>

### ORIGINAL CV CONTEXT
<cv_context>
{"\n".join(cv_context)}
</cv_context>

### REWRITE INSTRUCTIONS
{"".join(instructions)}

### OUTPUT FORMAT

Return ONLY valid JSON.
- Do NOT wrap the JSON in json or code fences.
- Return only the JSON object matching the required schema.
- Do NOT write any text before or after the JSON.

{{
{",".join(output_schema)}
}}
"""

    return prompt

def extract_job_insights_prompt(job_description: str):

    prompt = f"""
You are an expert AI recruiter and job description analyst.

Analyze the following job description and extract only the most important information needed to understand the role.

STRICT OUTPUT RULES:
- Do NOT wrap the JSON in json or code fences.
- Return only the JSON object matching the required schema.
- Do NOT write any text before or after the JSON.
- Do not include explanations, comments, markdown, or any text outside the JSON.
- All outputs must be in English.
- If the job description is written in another language, internally translate it to English before extracting information.
- Do not hallucinate information.
- If a field is not available, use "Not Specified" or an empty list where appropriate.
- Extract only information explicitly mentioned or strongly implied by the job description.
- Keep lists concise and focus only on the most important items.
- Ensure the output strictly follows the JSON structure below.

JOB DESCRIPTION
---------------
{job_description}

Return a JSON object with exactly this structure:

{{
    "job_title": "The job title",
    "company_name": "The company name or Not Specified",
    "required_skills": [
        "Most important technical skills, tools, frameworks, and technologies required for the role"
    ],
    "key_responsibilities": [
        "Top responsibility or mission of the role",
        "Another key responsibility"
    ],
    "experience_level": "Expected seniority level (Junior, Mid, Senior, Lead, PhD, or Not Specified)",
    "role_summary": "A concise 2-3 sentence summary explaining the purpose and impact of this role"
}}

Field descriptions:
- job_title: Extract the official role title from the job description.
- company_name: Extract the company name. Use "Not Specified" if unavailable.
- required_skills: Include only important technical skills, tools, frameworks, programming languages, and technologies explicitly required or strongly implied.
- key_responsibilities: Extract the top 3-5 responsibilities or missions.
- experience_level: Determine the expected seniority level. Use "Not Specified" if unclear.
- role_summary: Summarize what the person will actually do and why the role exists.

"""
    return prompt

def create_cover_letter_prompt(full_cv_context: Dict[str,Any], job_analytics: Optional[Union[str, Dict[str, Any]]]):
    work_experience = full_cv_context['experience']
    projects = full_cv_context['projects']
    education = full_cv_context['education']


    prompt = f"""
You are an expert professional cover letter writer specialized in Machine Learning and AI research roles.

You will generate a tailored cover letter based ONLY on the provided CV context and job description.

At the same time, you must also extract structured information from the job description.

STRICT RULES (VERY IMPORTANT):
- Do NOT invent any experience, projects, tools, companies, or achievements.
- Do NOT hallucinate or exaggerate impact.
- Do NOT include metadata such as:
  - titles (e.g., "Cover Letter")
  - candidate name headers
  - dates
  - labels like "Subject", "Application"
- Output MUST be valid JSON only.
- Cover letter must be in MARKDOWN format.
- Maximum cover letter length: 200 words strict limit.

EXTRACTION RULES: 
From the job description:
- Extract the **job title** as accurately as possible if can't find one then write ML Engineer.
- Extract the **company name** if explicitly mentioned.
- If the company name is not clearly stated, return "Unknown".
- If the job title is ambiguous, infer the most likely title from context without hallucination.

CONTENT RULES:
- You MAY rephrase CV content into a natural narrative.
- You MAY align wording with job description keywords ONLY when meaning is unchanged.
- You MAY prioritize relevant experiences from CV for the role.
- If information is missing, do NOT fabricate; keep statements general or omit them.
- Tone must be professional, natural, and human-like.
- You MAY use **bold markdown formatting** for key technical skills or achievements.

STRUCTURE REQUIREMENT:
1. Opening paragraph: motivation and role interest
2. Body paragraph(s): relevant experience and technical alignment
3. Closing paragraph: summary and professional sign-off

Return ONLY valid JSON in the following format:

{{
  "cover_letter": "Dear Sir/Madam,\\n...markdown formatted cover letter...",
  "job_title": "...extracted or inferred job title...",
  "company": "...extracted company name or 'Unknown'..."
}}

JOB ANALYTICS:
{job_analytics}

CV CONTEXT (ONLY SOURCE OF TRUTH):
Candidate Name: {full_cv_context['name']}
{education}
{work_experience}
{projects}
"""
    return prompt

def generate_connection_message_prompt(profileText: str, wordLimit: int, promptText: str, cvText: Optional[Union[str, Dict[str, Any]]],):
    system_prompt = """
You write casual, human LinkedIn messages.

Your writing style:
- Direct and specific.
- Slightly informal, like a real person.
- Friendly but not overly enthusiastic.
- Never sound like a recruiter, salesperson, or AI assistant.
- Avoid corporate language and generic networking phrases.
- Do NOT wrap the JSON in json or code fences.
- The first character of your response must be {.
- The last character of your response must be }.
- Return only the JSON object matching the required schema.
- Do NOT write any text before or after the JSON.
"""

    prompt = f"""
    {promptText}

    Your task is to write a short LinkedIn message that I can send directly to this person.

    Use their profile/post as the main context.

    Writing rules:
    - Mention ONE specific thing from their profile, post, project, research, or career journey.
    - Explain naturally why I am reaching out.
    - Include only one relevant detail about me if it helps create a genuine connection.
    - Do not summarize my CV.
    - Do not make claims that are not supported by the provided information.
    - The message should feel personal, not like a template.

    OUTPUT FORMAT REQUIREMENTS:

    - Do not include markdown code blocks.
    - The JSON must contain exactly one field: "message".
    - The value of "message" must contain the complete LinkedIn message text.
    - Do NOT wrap the JSON in json or code fences.
    - Return only the JSON object matching the required schema.
    - Do NOT write any text before or after the JSON.

    Required JSON structure:

    {{
    "message": "Your LinkedIn message here"
    }}

    Rules for the message field:
    - The message must be ready to copy and paste directly into LinkedIn.
    - Do not include a subject line.
    - Do not include bullet points.
    - Do not include greetings/signatures unless they naturally fit the message.
    - Keep the message under {wordLimit} words.
    - Keep it concise (ideally 2-4 sentences).

    Person's profile/post:
    <profile>
    {profileText}
    </profile>

    My background (use only if relevant):
    <cv>
    {cvText}
    </cv>
    """

    return system_prompt, prompt
    

if __name__ == "__main__":
    print(edit_cv_with_ai_prompt(
        full_cv_context={
            "summary": "Summary",
            "experience": "Experience",
            "projects": "Projects",
            "skills": "Skills"
        },
        job_analytics="Job Analytics",
        sections=["summary"]
    ))

