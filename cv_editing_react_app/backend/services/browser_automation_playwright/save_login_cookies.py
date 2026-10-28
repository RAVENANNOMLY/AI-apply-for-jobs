from playwright.sync_api import sync_playwright
from dotenv import load_dotenv
import os
from pathlib import Path



def linkedin_login():

    env_path = ".env"

    load_dotenv(dotenv_path=env_path, override=True)

    # Retrieve the API key
    username = os.getenv("username")
    password = os.getenv("password")
    print(username,password)
    with sync_playwright() as p:
        # Launch visible browser with slow motion for observation
        browser = p.chromium.launch(headless=False,args=["--lang=en-US"], slow_mo=50)
        context = browser.new_context(
            locale="en-US",
            timezone_id="Europe/Paris",
            extra_http_headers={
                "Accept-Language": "en-US,en;q=0.9"
            }
        )
        context.clear_cookies()
        page = context.new_page()

        # Step 1: Go to LinkedIn login page
        page.goto("https://www.linkedin.com/login")

        page.locator('input[type="email"]:visible').fill(username)
        page.locator('input[type="password"]:visible').fill(password)

        submit = page.locator('button:has-text("S’identifier"), button:has-text("Sign in")').filter(
            has=page.locator(':visible')
        ).last

        submit.click()

        # Optional pause to see post-login page
        page.wait_for_timeout(5000)
        
        # Save the login session
        context.storage_state(path=Path(__file__).resolve().parents[0] / "linkedin_login.json")
        print(Path(__file__).resolve().parents[0] )
        
        browser.close()
    

if __name__ == "__main__":
    linkedin_login()