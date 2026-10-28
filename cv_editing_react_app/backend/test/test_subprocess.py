# from services.browser_automation_playwright.browser_automation import automated_job_search
import subprocess
import time

# automated_job_search()
process = subprocess.Popen(
    ["python","-m", "services.browser_automation_playwright.browser_automation"],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE
)

time.sleep(10)
print(process.pid)

process.kill()      # send SIGTERM
process.wait()           # wait until process exits

print(process.poll())