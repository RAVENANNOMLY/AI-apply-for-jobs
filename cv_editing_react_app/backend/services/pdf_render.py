from playwright.sync_api import sync_playwright
import os

def html_to_pdf(html_content: str, output_path: str):

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page()

        page.set_content(html_content)
        page.wait_for_load_state("networkidle")
        page.evaluate("document.fonts.ready")

        page.pdf(
            path=output_path,
            # format="A4",
            print_background=True,
            margin={
                "top": "0mm",
                "bottom": "0mm",
                "left": "0mm",
                "right": "0mm"
            }
        )

        browser.close()