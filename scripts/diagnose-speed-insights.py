#!/usr/bin/env python3
"""Read-only Speed Insights integration probe against the ACTUAL production site.

DOES NOT generate synthetic web vital events, modify Vercel settings,
fill forms, or include customer data in evidence. Headless automation is
normally filtered by the Vercel client and must not be used to prove
whether real visitor events arrive in the dashboard.
"""
import json
import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

HOST = "https://veyfront.com"
PAGES = ["/", "/pricing", "/zh", "/zh/pricing"]
ARTIFACT = Path("qa-evidence/speed-insights-probe")
ARTIFACT.mkdir(parents=True, exist_ok=True)
events = []
failures = []
checks = []

def note(label, ok, detail=None, required=True):
    checks.append({"check": label, "pass": bool(ok), "detail": detail})
    if not ok and required:
        failures.append(label)

def route_only(url):
    p = urlparse(url)
    return p.path if p.hostname in ("veyfront.com", "www.veyfront.com") else "<external>"

def probe():
    executable = next((shutil.which(n) for n in
        ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser")
        if shutil.which(n)), None)
    if not executable:
        raise RuntimeError("Chrome/Chromium unavailable on CI")
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=executable, headless=True,
            args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 1200, "height": 900})
        page = context.new_page()
        page_errors = []
        page.on("pageerror", lambda e: page_errors.append(str(e)[:180]))
        def response_handler(resp):
            path = route_only(resp.url)
            if "speed-insights" in path or path.endswith("/vitals"):
                events.append({"kind": "response", "path": path, "method": resp.request.method,
                               "status": resp.status, "resourceType": resp.request.resource_type})
        def failed_handler(req):
            path = route_only(req.url)
            if "speed-insights" in path or path.endswith("/vitals"):
                events.append({"kind": "requestfailed", "path": path,
                               "method": req.method, "error": str(req.failure)[:120]})
        page.on("response", response_handler)
        page.on("requestfailed", failed_handler)

        for path in PAGES:
            response = page.goto(HOST + path, wait_until="domcontentloaded", timeout=40000)
            page.locator("main").first.wait_for(state="visible", timeout=15000)
            page.wait_for_timeout(8500)
            evidence = page.evaluate("""() => ({
                url: location.origin + location.pathname,
                webdriver: navigator.webdriver === true,
                headlessUserAgent: navigator.userAgent.includes('Headless'),
                scriptTags: [...document.querySelectorAll('script[src]')]
                    .filter(s => s.src.includes('speed-insights'))
                    .map(s => ({path: new URL(s.src).pathname, async: s.async, dataset: {...s.dataset}})),
                windowSiType: typeof window.si,
                pendingSiQueue: Array.isArray(window.siq) ? window.siq.length : null,
                domReadyState: document.readyState,
                allScriptCount: document.scripts.length,
                nextAppScriptCount: [...document.scripts].filter(s => s.src.includes('/_next/')).length,
                scriptResources: performance.getEntriesByType('resource')
                    .filter(r => r.name.includes('speed-insights'))
                    .map(r => ({path: new URL(r.name).pathname, durationMs: Math.round(r.duration),
                        responseStatus: r.responseStatus || null, initiatorType: r.initiatorType}))
            })""")
            note(path + " HTTP 200", bool(response) and response.status == 200,
                 response.status if response else None)
            note(path + " Speed Insights injected script", len(evidence["scriptTags"]) > 0,
                 {"tags": evidence["scriptTags"], "si": evidence["windowSiType"],
                  "ready": evidence["domReadyState"], "scripts": evidence["allScriptCount"],
                  "nextScripts": evidence["nextAppScriptCount"]})
            note(path + " performance resource recorded", len(evidence["scriptResources"]) > 0,
                 evidence["scriptResources"], required=False)
            events.append({"kind": "page", "path": path, "inspect": evidence})

        loaded = any(e.get("kind") == "response" and
                     ("speed-insights" in e.get("path", "")) and
                     ("/script" in e.get("path", "")) and
                     e.get("status") == 200 for e in events)
        note("Production Speed Insights script HTTP 200", loaded,
             [e for e in events if e.get("kind") == "response"])
        note("No uncaught JavaScript errors", len(page_errors) == 0, page_errors)
        events.append({"kind":"caveat","message":
            "Headless browser navigator.webdriver is often true, and SDK filters automated visitors. "
            "No /vitals request here CANNOT establish a production collection failure. "
            "GET /vitals 404 is not a valid POST event ingestion test."})
        browser.close()

try:
    probe()
except Exception as ex:
    failures.append("Probe harness: " + type(ex).__name__)
    events.append({"kind": "harness-error", "error": (type(ex).__name__ + ": " + str(ex))[:350]})
report = {
    "recordedAt": datetime.now(timezone.utc).isoformat(),
    "source": "Read-only independent GitHub Actions Chrome against public production domain",
    "target": HOST,
    "status": "PASS" if not failures else "FAIL",
    "checks": checks,
    "events": events,
    "failures": failures,
    "limitations": "Script injection/load check, not real-user LCP/INP/CLS or platform ingestion proof. "
                   "No synthetic vitals POSTs are sent.",
}
(ARTIFACT / "probe.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({ "status": report["status"], "checks": checks,
    "failures": failures, "events": events,
    "limitations": report["limitations"] }, ensure_ascii=False, indent=2))
if failures:
    raise SystemExit(1)
