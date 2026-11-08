#!/usr/bin/env python3
"""Validate mount in a real local Next.js production build, not actual Vercel ingestion."""
import json
import shutil
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:3183"
OUT = Path("qa-evidence/speed-insights-local")
OUT.mkdir(parents=True, exist_ok=True)
checks = []
def record(ok, label, evidence=None):
    checks.append({"check": label, "passed": bool(ok), "evidence": evidence})
    if not ok: raise AssertionError(label + ": " + repr(evidence))
chrome = next((shutil.which(x) for x in ("google-chrome","google-chrome-stable","chromium","chromium-browser") if shutil.which(x)),None)
if not chrome: raise SystemExit("No Chrome available")
log = open(OUT/"next-server.log","w",encoding="utf-8")
server = subprocess.Popen(["pnpm","start","-p","3183"],stdout=log,stderr=subprocess.STDOUT)
failure=None
try:
    for _ in range(100):
        try:
            with urllib.request.urlopen(BASE+"/zh",timeout=3) as r:
                if r.status==200: break
        except Exception: time.sleep(0.4)
    else: raise RuntimeError("Local production server not ready")
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=chrome,headless=True,args=["--no-sandbox"])
        page=browser.new_page()
        for path in ("/zh","/zh/pricing"):
            response=page.goto(BASE+path,wait_until="domcontentloaded",timeout=40000)
            record(response is not None and response.status==200,path+" HTTP 200")
            page.wait_for_function("""() => document.querySelector('script[src*="speed-insights/script"]') !== null""",timeout=15000)
            result=page.evaluate("""() => [...document.querySelectorAll('script[src*="speed-insights/script"]')].map(s=>({
              path:new URL(s.src).pathname,rate:s.dataset.sampleRate,sdk:s.dataset.sdkn
            }))""")
            record(bool(result),path+" SDK script injected",result)
            record(result[0]["rate"]=="0.25",path+" sample rate preserved",result)
            record(result[0]["sdk"]=="@vercel/speed-insights/next",path+" Next SDK framework",result)
        browser.close()
except Exception as e:
    failure=type(e).__name__+": "+str(e)[:350]
finally:
    server.terminate()
    try: server.wait(timeout=7)
    except subprocess.TimeoutExpired: server.kill()
    log.close()
    report={"status":"FAIL" if failure else "PASS","checks":checks,"failure":failure,
      "limit":"Production-mode localhost script injection only; cannot prove Vercel metric ingestion."}
    (OUT/"report.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps(report,indent=2))
if failure: raise SystemExit(1)
