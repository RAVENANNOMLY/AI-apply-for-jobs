from playwright.sync_api import sync_playwright
from playwright.sync_api import TimeoutError
from dotenv import load_dotenv
import time, random
import os,json
from urllib.parse import urlencode
import pandas as pd
from datetime import datetime
from zoneinfo import ZoneInfo
import os
import argparse

from .browser_automation_utlis import build_linkedin_job_url, get_hiring_team_info
from .job_details_extractor import extract_job_details
from services.database.db import add_a_job, dict_to_job





#################### Job Serach Settings
search_url = "https://www.linkedin.com/jobs/search/?currentJobId=4419066237&f_E=2%2C3%2C4&f_F=it&f_JT=F&f_T=25206%2C30128&f_TPR=r604800&keywords=%20(%27Artificial%20Intelligence%27)%20&location=France&origin=JOB_SEARCH_PAGE_JOB_FILTER&refresh=true&sortBy=R&spellCorrectionEnabled=true"
    
timestamp = datetime.now(tz=ZoneInfo("Europe/Paris")).strftime("%Y%m%d_%H%M%S")
role = ''' ('Artificial Intelligence') '''
location = 'France'
easy_apply = None # True, False, None (None means no filter on easy apply)
work_mode = None # 'remote', 'on-site', 'hybrid', None
seniority = ["2", "3", "4"]# LinkedIn codes: 1 = Internship, 2 = Entry, 3 = Associate, 4 = Mid-Senior, 5 = Director, 6 = Executive
posted_time = "r604800"# Posted time filter (r86400 = 24h, r604800 = week, r2592000 = month)
job_type = ["F"] # ["F", "P", "C", "T"] LinkedIn codes: F = Full-time, P = Part-time, C = Contract, T = Temporary

#################### Job Serach Settings End

def automated_job_search(search_url=search_url):
    #################### Load CV Context

    with open("CV_DATA.json", "r") as f:
        cv_context = json.load(f)

    #################### Start Job Search
    with sync_playwright() as p:
        # Launch visible browser with slow motion for observation
        browser = p.chromium.launch(headless=False, slow_mo=50)
        context = browser.new_context(storage_state="./services/browser_automation_playwright/linkedin_login.json")
        # context = browser.new_context()
        page = context.new_page()

        # Step 1: Go to LinkedIn login page
        if search_url is None:
            search_url = build_linkedin_job_url(
                                                role=role,
                                                location=location,
                                                easy_apply=easy_apply,
                                                remote=work_mode,
                                                seniority=seniority,  # Mid-Senior & Director
                                                posted_time=posted_time,
                                                job_type=job_type
                                            )

        page.goto(search_url,
                wait_until="domcontentloaded",
                timeout=9000)

        job_listings = []
        job_counter = 0
        while True:
            # Wait for job results to load
            page.wait_for_timeout(3000)
            
            ul_element =page.query_selector('div.scaffold-layout__list-detail-container ul')
            li_elements = ul_element.query_selector_all(':scope > li')
            total_elements_in_page = len(li_elements)
            
            for i in range(total_elements_in_page):
                
                try:
                
                    ul_element =page.query_selector('div.scaffold-layout__list-detail-container ul')
                    li_elements = ul_element.query_selector_all(':scope > li')
                    li = li_elements[i]
                
                    a_tag = li.query_selector('a')
                    
                    # Scroll the job link into view
                    page.evaluate("(element) => element.scrollIntoView({behavior: 'smooth', block: 'center'})", a_tag)
                    
                    # Optional: move mouse to hover over the element (LinkedIn sometimes requires this)
                    box = a_tag.bounding_box()
                    if box:
                        page.mouse.move(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2)
                    
                    a_tag.click()
                    page.wait_for_timeout(1000)  # small wait for job details panel to load

                    try:
                        job_link = "https://www.linkedin.com" + li.query_selector('a').get_attribute('href')
                    except:
                        job_link = None  # skip or set default value if job link is not found   
                    # Job location
                    try:
                        job_location_el = page.query_selector('ul.job-card-container__metadata-wrapper')
                        job_location = job_location_el.inner_text() if job_location_el else None
                    except:
                        job_location = None

                    # Company name
                    try:
                        company_el = page.query_selector('div.job-details-jobs-unified-top-card__company-name a[data-test-app-aware-link]')
                        company_name = company_el.inner_text() if company_el else None
                    except:
                        company_name = None

                    # Job title
                    try:
                        title_el = page.query_selector('h1.t-24.t-bold.inline')
                        job_title = title_el.inner_text() if title_el else None
                    except:
                        job_title = None

                    # Job description
                    try:
                        desc_el = page.query_selector('div.mt4 p[dir="ltr"]')
                        job_description = desc_el.inner_text() if desc_el else None
                    except:
                        job_description = None
                        job_lang = None

                    # Get Job details 

                    analytics = extract_job_details(job_description=job_description,
                                                    cv_context=cv_context)




                    if analytics is None:
                        print("No Job Analytics Available", flush=True)
                        job_listing = {
                        "job_link": job_link,
                        "job_location": job_location,
                        "company_name": company_name,
                        "job_title": job_title,
                        "job_description": job_description,}
                    else:
                        job_listing = {
                            "job_link": job_link,
                            "job_location": job_location,
                            "company_name": company_name,
                            "job_title": job_title,
                            "job_description": job_description,

                            "technical_skills_score": analytics.technical_skills_score,
                            "tools_frameworks_score": analytics.tools_frameworks_score,
                            "experience_score": analytics.experience_score,
                            "domain_score": analytics.domain_score,
                            "education_score": analytics.education_score,
                            "matching_score": analytics.matching_score,
                            "review": analytics.review,
                            "job_keywords": analytics.job_keywords,}
                    
                    # Get hiring team info
                    # hiring_team_info = get_hiring_team_info(page)
                    # job_listing.update(hiring_team_info)

                    # Add job to SQLlite database
                    try:
                        job = dict_to_job(job_listing)
                        add_a_job(job)
                    except Exception as e:
                        print(f"Error adding job to database: {e}", flush=True)
                
                    job_listings.append(job_listing)
                    job_counter+=1
                    
                    print(f'{job_counter} Jobs scraped || Job Title: {job_title} || Company: {company_name} || Matching Score: {analytics.matching_score}', flush=True)
                    time.sleep(random.uniform(0.5, 1.5))  # Random sleep to mimic human behavior and avoid rate limits
                    
                except Exception as e:
                    print(f"Skipped a job due to error: {e}", flush=True)
                    continue

            
                job_pd = pd.DataFrame(job_listings)
                os.makedirs('../../job_listings', exist_ok=True)
                job_pd.to_json(f'../../job_listings/job_listings_{timestamp}.json', orient='records', indent=4)
            
            # Find the "Next" button
            next_button = page.query_selector("button[aria-label='View next page']")
            if next_button:
                next_button.click()
            else:
                break


            

        browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--search_url", required=True)
    args = parser.parse_args()

    automated_job_search(search_url=args.search_url)

# uv run python -m services.browser_automation_playwright.browser_automation ///// [when inside backend folder]
