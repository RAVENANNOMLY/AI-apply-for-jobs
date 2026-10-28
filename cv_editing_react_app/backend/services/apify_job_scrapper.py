import argparse
import json
import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import dotenv
import pandas as pd
from apify_client import ApifyClient

from services.browser_automation_playwright.job_details_extractor import (
    extract_job_details,
)
from services.database.db import add_a_job, dict_to_job


BASE_DIR = Path(__file__).resolve().parents[1]
dotenv.load_dotenv(BASE_DIR / ".env")


def search_jobs(run_input: dict) -> list[dict]:
    api_key = os.getenv("APIFY_API_KEY")
    if not api_key:
        raise RuntimeError("APIFY_API_KEY is not configured")

    client = ApifyClient(api_key)
    run = client.actor("hKByXkMQaC5Qt9UMN").call(run_input=run_input)
    dataset = client.dataset(run.default_dataset_id)

    with open(BASE_DIR / "CV_DATA.json", encoding="utf-8") as file:
        cv_context = json.load(file)

    job_listings = []

    for item in dataset.iterate_items():
        description = item.get("descriptionText", "")
        job_analytics = extract_job_details(
            job_description=description,
            cv_context=cv_context,
        )

        job_listing = {
            "job_id": item.get("id"),
            "job_link": item.get("link"),
            "job_location": item.get("location"),
            "company_name": item.get("companyName"),
            "job_title": item.get("title"),
            "job_description": description,
            "job_posted_date": item.get("postedAt"),
            "applicantsCount": item.get("applicantsCount"),
            "technical_skills_score": job_analytics.technical_skills_score,
            "tools_frameworks_score": job_analytics.tools_frameworks_score,
            "experience_score": job_analytics.experience_score,
            "domain_score": job_analytics.domain_score,
            "education_score": job_analytics.education_score,
            "matching_score": job_analytics.matching_score,
            "review": job_analytics.review,
            "job_keywords": job_analytics.job_keywords,
        }

        try:
            add_a_job(dict_to_job(job_listing))
        except Exception as error:
            print(f"Error adding job to database: {error}", flush=True)

        job_listings.append(job_listing)

    return job_listings


def main(run_input: dict) -> list[dict]:
    job_listings = search_jobs(run_input)

    timestamp = datetime.now(
        tz=ZoneInfo("Europe/Paris")
    ).strftime("%Y%m%d_%H%M%S")

    output_dir = BASE_DIR.parent / "job_listings"
    output_dir.mkdir(exist_ok=True)

    output_file = output_dir / f"job_listings_{timestamp}.json"
    pd.DataFrame(job_listings).to_json(
        output_file,
        orient="records",
        indent=4,
    )

    print(f"Saved {len(job_listings)} jobs to {output_file}")
    return job_listings


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--urls", default="https://www.linkedin.com/jobs/search/?currentJobId=4463344086&distance=25&f_WT=3%2C1&geoId=106383538&keywords=Machine%20Learning%20Engineer&origin=JOB_SEARCH_PAGE_KEYWORD_HISTORY&refresh=true")
    parser.add_argument("--keywords", default="Machine learning")
    parser.add_argument("--location", default="Bengaluru")
    parser.add_argument(
        "--date-posted",
        default="past24Hours",
        choices=["anyTime", "past24Hours", "pastWeek", "pastMonth"],
    )
    parser.add_argument("--limit", type=int, default=2)
    parser.add_argument(
        "--under-10-applicants",
        action="store_true",
    )

    args = parser.parse_args()

    run_input = {
        "urls": [args.urls],
        "keywords": args.keywords,
        "location": args.location,
        "datePosted": args.date_posted,
        "companyIds": [],
        "under10Applicants": args.under_10_applicants,
        "autoConvertToAiSearch": True,
        "scrapeCompany": True,
        "limitPerSource": args.limit,
        "splitByLocation": False,
    }

    main(run_input)


# python -m services.apify_job_scrapper `
#   --keywords "Computer Vision Engineer" `
#   --location "Paris" `
#   --date-posted pastWeek `
#   --limit 5