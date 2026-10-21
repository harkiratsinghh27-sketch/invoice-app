import sys, os, site, glob

for p in [os.getcwd(), os.path.expanduser("~/.chrome-bridge"), os.path.expanduser("~/chrome-bridge")]:
    if os.path.exists(os.path.join(p, "chrome_sdk.py")):
        if p not in sys.path:
            sys.path.insert(0, p)
        venv = os.path.join(p, ".venv")
        if os.path.isdir(venv):
            if sys.platform == "win32":
                sp = os.path.join(venv, "Lib", "site-packages")
                if os.path.isdir(sp):
                    site.addsitedir(sp)
            else:
                for sp in glob.glob(os.path.join(venv, "lib", "python*", "site-packages")):
                    if os.path.isdir(sp):
                        site.addsitedir(sp)
        break

from chrome_sdk import chrome
import time

try:
    print("Navigating to production site...")
    chrome.navigate("https://invoice-app-jade-one.vercel.app/")
    time.sleep(3) # Wait for page to load
    
    snapshot = chrome.snapshot()
    print("=== PAGE SNAPSHOT ===")
    print(snapshot)
    
except Exception as e:
    print("Error:", str(e))
