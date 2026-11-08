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
        context.add_init_script("""(() => {
          window.__vey_si_script_lifecycle = [];
          const add = Node.prototype.appendChild;
          Node.prototype.appendChild = function(n) {
            if (n?.tagName === 'SCRIPT' && n.src?.includes('speed-insights')) {
              window.__vey_si_script_lifecycle.push({action:'append',src:new URL(n.src).pathname,parent:this.nodeName,t:Math.round(performance.now())});
            }
            return add.apply(this,arguments);
          };
          const rm = Node.prototype.removeChild;
          Node.prototype.removeChild = function(n) {
            if (n?.tagName === 'SCRIPT' && n.src?.includes('speed-insights')) {
              window.__vey_si_script_lifecycle.push({action:'removeChild',src:new URL(n.src).pathname,parent:this.nodeName,t:Math.round(performance.now())});
            }
            return rm.apply(this,arguments);
          };
          const rem=Element.prototype.remove;
          Element.prototype.remove=function() {
            if (this.tagName === 'SCRIPT' && this.src?.includes('speed-insights')) {
              window.__vey_si_script_lifecycle.push({action:'remove',src:new URL(this.src).pathname,parent:this.parentNode?.nodeName,t:Math.round(performance.now())});
            }
            return rem.apply(this,arguments);
          };
          const srcProp = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
          if (srcProp?.get && srcProp?.set) {
            Object.defineProperty(HTMLScriptElement.prototype,'src',{
              configurable:srcProp.configurable,enumerable:srcProp.enumerable,
              get(){return srcProp.get.call(this)},
              set(v){
                if(String(v).includes('speed-insights')){
                  window.__vey_si_script_lifecycle.push({action:'script-src-set',src:String(v).slice(0,160),t:Math.round(performance.now())})
                }
                return srcProp.set.call(this,v);
              }
            });
          }
          const ib=Node.prototype.insertBefore;
          Node.prototype.insertBefore=function(n,r){
            if(n?.tagName==='SCRIPT'&&n.src?.includes('speed-insights')){
              window.__vey_si_script_lifecycle.push({action:'insertBefore',src:new URL(n.src).pathname,parent:this.nodeName,t:Math.round(performance.now())})
            }
            return ib.apply(this,arguments);
          };
          const origCreate=document.createElement.bind(document);
          document.createElement=function(name,...args) {
            if (String(name).toLowerCase()==='script') window.__vey_si_script_lifecycle.push({action:'create-script',t:Math.round(performance.now())});
            return origCreate(name,...args);
          };
        })();""")
        page = context.new_page()
        page_errors = []
        page.on("pageerror", lambda e: page_errors.append(str(e)[:180]))
        def response_handler(resp):
            path = route_only(resp.url)
            if "speed-insights" in path or path.endswith("/vitals") or (path.endswith("/script.js") and resp.request.resource_type=="script"):
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
            page.wait_for_timeout(3000)
            evidence = page.evaluate("""() => ({
                url: location.origin + location.pathname,
                webdriver: navigator.webdriver === true,
                headlessUserAgent: navigator.userAgent.includes('Headless'),
                scriptTags: [...document.querySelectorAll('script[src]')]
                    .filter(s => (s.dataset.sdkn || '').includes('speed-insights') || s.src.includes('speed-insights'))
                    .map(s => ({path: new URL(s.src).pathname, async: s.async, dataset: {...s.dataset}})),
                windowSiType: typeof window.si,
                windowSiBody: typeof window.si === 'function' ? String(window.si).slice(0,150) : null,
                siLifecycle: window.__vey_si_script_lifecycle || [],
                pendingSiQueue: Array.isArray(window.siq) ? window.siq.length : null,
                domReadyState: document.readyState,
                allScriptCount: document.scripts.length,
                scriptPaths: [...document.scripts].map(x=>x.src ? new URL(x.src).pathname : '[inline]').slice(0,35),
                headSpeedTag: [...document.head.querySelectorAll('script')].filter(x=>x.src.includes('speed-insights')).map(x=>x.src),
                nextAppScriptCount: [...document.scripts].filter(s => s.src.includes('/_next/')).length,
                scriptResources: performance.getEntriesByType('resource')
                    .filter(r => r.initiatorType === 'script' && new URL(r.name).pathname.endsWith('/script.js'))
                    .map(r => ({path: new URL(r.name).pathname, durationMs: Math.round(r.duration),
                        responseStatus: r.responseStatus || null, initiatorType: r.initiatorType}))
            })""")
            note(path + " HTTP 200", bool(response) and response.status == 200,
                 response.status if response else None)
            note(path + " Speed Insights injected script", len(evidence["scriptTags"]) > 0,
                 {"tags": evidence["scriptTags"], "si": evidence["windowSiType"],
                  "lifecycle": evidence["siLifecycle"],
                  "ready": evidence["domReadyState"], "scripts": evidence["allScriptCount"],
                  "nextScripts": evidence["nextAppScriptCount"]})
            note(path + " performance resource recorded", len(evidence["scriptResources"]) > 0,
                 evidence["scriptResources"], required=False)
            events.append({"kind": "page", "path": path, "inspect": evidence})

        # Match the vendor-tagged script path, not just a textual speed-insights URL.
        # Vercel can route the SDK under a dynamic, hashed first-party pathname.
        tagged_paths = {tag["path"] for e in events if e.get("kind")=="page"
            for tag in e.get("inspect",{}).get("scriptTags",[])}
        loaded = any(e.get("kind")=="response" and e.get("path") in tagged_paths
                     and e.get("status")==200 for e in events)
        note("Production tagged Speed Insights script HTTP 200", loaded,
             {"taggedPaths":sorted(tagged_paths),"scriptResponses":[e for e in events if e.get("kind") == "response"]})
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
