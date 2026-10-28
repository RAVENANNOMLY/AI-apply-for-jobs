from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

import uuid
import subprocess
import os
import sys
from datetime import datetime, timezone

from schema.fast_api_data_validation import LinkedInSearchURL, JobDBSchema, Html2PdfRequest, ConnectionRequest, JobDescriptionAnalysisRequest, CoverLetterRequest, CVRequest, CVJSONRequest
from services.pdf_render import html_to_pdf
from services.ai_editing_tools import create_cover_letter, extract_job_insights, edit_cv_with_ai, generate_connection_message
from services.database.db import add_a_job, get_all_jobs, job_to_dict, dict_to_job
from services.load_and_reset_cv_data import load_cv_data, reset_cv_data
# from services.browser_automation_playwright.browser_automation import automated_job_search
# from services.browser_automation_playwright .save_login_cookies import linkedin_login
from services.apify_job_scrapper import search_jobs


app = FastAPI()
# ---------- CORS CONFIG ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to specific domains in production
    # allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- API Endpoint for CV Data Management ----------
@app.post("/load-cv-data")
def load_cv_data_api():
    cv_data = load_cv_data()
    return cv_data

@app.post("/reset-cv-data")
def reset_cv_data_api(payload: CVJSONRequest):
    reset_cv_data(payload.cv_json)
    return "CV data reset successfully"

# ---------- API Endpoint for automated job serach on linkedin ----------
running_processes = {}
@app.post("/automated-job-search")
def automated_job_search_api(payload: LinkedInSearchURL):
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    process_id = f"{timestamp}_{uuid.uuid4()}"

    process = subprocess.Popen(
        [
            sys.executable,
            "-u",
            "-m",
            "services.apify_job_scrapper",
            "--urls",
            payload.search_url,
            "--keywords",
            " ".join(payload.keywords),
            "--location",
            payload.location or "",
            "--date-posted",
            payload.date_posted or "past24Hours",
            "--limit",
            str(payload.limit),
            *(
                ["--under-10-applicants"]
                if payload.under_10_applicants else []
            ),
        ],
        text=True,
    )

    running_processes[process_id] = process

    return {"process_id": process_id}

@app.get("/check/{process_id}")
def check_process_api(process_id: str):
    process = running_processes.get(process_id)
    if not process:
        return {"error": "process not found"}
    return {"status": "running"}

@app.post("/automated-job-search/stop/{process_id}")
def stop_job_search_api(process_id: str):
    process = running_processes.get(process_id)
    if not process:
        return {"error": "process not found"}

    # kill entire process tree (IMPORTANT for Playwright)
    process.kill()
    running_processes.pop(process_id, None)

    return {"status": "stopped"}



# ---------- API Endpoint for HTML to PDF ----------
@app.post("/html-to-pdf")
def html_to_pdf_api(payload: Html2PdfRequest):

    output_dir = "./rendered_pdf"
    os.makedirs(output_dir, exist_ok=True)

    name = "_".join(payload.name.strip().split()) if payload.name else ""
    file_name = f"{name}_{payload.doc_type}" if name else payload.doc_type

    pdf_path = f"./rendered_pdf/{file_name}.pdf"

    html_to_pdf(payload.html_string, pdf_path)

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{file_name}.pdf",
    )


# ---------- API Endpoint for Keyword Extraction ----------
@app.post("/extract-job-insights")
def extract_job_insights_api(payload: JobDescriptionAnalysisRequest):
    result = extract_job_insights(payload.job_description)
    return result

# ---------- API Endpoint for CV editing ----------
@app.post("/edit-cv")
def edit_cv_ai_api(payload: CVRequest):   
    result = edit_cv_with_ai(payload.full_cv_context, payload.job_analytics, payload.sections)
    return result


# ---- API Endpoint for Cover Letter Creation ----------
@app.post("/create-cover-letter")
def create_cover_letter_api(payload: CoverLetterRequest):
    result = create_cover_letter(full_cv_context=payload.full_cv_context,
                                 job_analytics=payload.job_analytics)
    return result

# ------- API Endpoint for Connection Message Generation ----------
@app.post("/generate-connection-message")
def generate_connection_message_api(payload: ConnectionRequest):

    result = generate_connection_message(profileText=payload.profileText,
                                         wordLimit=payload.wordLimit,
                                         promptText=payload.promptText,
                                         cvText=payload.cvText,
                                         temperature=payload.creativity)

    return result

# ---------- API Endpoint for DataBase Management ----------
@app.get("/jobs", response_model=list[JobDBSchema])
def get_all_jobs_api():
    return get_all_jobs()

# uv run uvicorn server:app --host 0.0.0.0 --port 8000 --reload
# uv run uvicorn api.server:app --host 0.0.0.0 --port 8000 --reload
