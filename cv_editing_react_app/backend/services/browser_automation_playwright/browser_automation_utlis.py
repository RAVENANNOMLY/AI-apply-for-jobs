
from dotenv import load_dotenv
from urllib.parse import urlencode
import pandas as pd
from datetime import datetime
from zoneinfo import ZoneInfo


#################### Job Serach Settings End

def get_hiring_team_info(page):
    hirer_section = page.locator("div.job-details-people-who-can-help__section--two-pane")
    hirers = hirer_section.locator("div.display-flex.align-items-center.mt4")
    if hirer_section.count() == 0:
        return {
        "name": None,
        "profile": None,
        "title": None,
    }
        
    hirer = hirers.nth(0)
    
    # Name + profile URL
    profile_link = hirer.locator("a[href*='linkedin.com/in/']").first
    url = profile_link.get_attribute("href") if profile_link.count() > 0 else None
    
    name_locator = hirer.locator("span.jobs-poster__name")
    name = name_locator.inner_text().strip() if name_locator.count() > 0 else None

    # Title / role
    title = hirer.locator("div.text-body-small").inner_text() \
        if hirer.locator("div.text-body-small").count() > 0 else None


    return {
        "name": name,
        "profile": url,
        "title": title,
    }
    


def build_linkedin_job_url(
    role: str,
    location: str,
    easy_apply: bool = True,
    remote: str = None,
    seniority: list = None,
    posted_time: str = None,
    job_type: list = None
) -> str:
    """
    Builds a LinkedIn job search URL with filters for role, location,
    easy apply, remote option, seniority level, posting time, and job type.

    Parameters:
        role (str): Job title or keyword.
        location (str): Location for job search.

        easy_apply (bool):
            Include only 'Easy Apply' jobs if True.

        remote (str):
            Optional remote filter:
            - 'remote'
            - 'hybrid'
            - 'on-site'

        seniority (list):
            LinkedIn seniority codes:
            - 1 = Internship
            - 2 = Entry
            - 3 = Associate
            - 4 = Mid-Senior
            - 5 = Director
            - 6 = Executive

            Example:
            seniority=["2", "3", "4"]

        posted_time (str):
            Job posting time filter:
            - 'r86400'   = past 24 hours
            - 'r604800'  = past week
            - 'r2592000' = past month

        job_type (list):
            LinkedIn job type codes:
            - F = Full-time
            - P = Part-time
            - C = Contract
            - T = Temporary
            - V = Volunteer
            - I = Internship

            Example:
            job_type=["F", "C"]
    """

    base_url = "https://www.linkedin.com/jobs/search/?"

    params = {
        "keywords": role,
        "location": location,
        "refresh": "true",
    }

    # Easy Apply filter
    if easy_apply:
        params["f_AL"] = "true"

    # Remote filter
    remote_map = {
        "remote": "2",
        "hybrid": "1",
        "on-site": "3"
    }

    if remote and remote in remote_map:
        params["f_WT"] = remote_map[remote]

    # Seniority filter
    if seniority:
        params["f_E"] = ",".join(seniority)

    # Posted time filter
    if posted_time:
        params["f_TPR"] = posted_time

    # Job type filter
    if job_type:
        params["f_JT"] = ",".join(job_type)

    return base_url + urlencode(params)