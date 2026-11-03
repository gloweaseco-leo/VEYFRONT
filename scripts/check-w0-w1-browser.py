#!/usr/bin/env python3
"""W0-A real browser smoke QA against locally served, built VEYFRONT.
No customer data, no real inquiry submission, no protected preview bypass.
Requires a Chrome/Chromium binary and the Python Playwright package.
"""
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import time
import urllib.error
import urllib.request
from playwright.sync_api import sync_playwright

OUT = Path("qa-evidence/w0-w1-browser")
OUT.mkdir(parents=True, exist_ok=True)
HOST = "http://127.0.0.1:3100"
VIEWPORTS = [1440, 768, 390, 360]
PATHS = ["/", "/pricing", "/transformations", "/how-it-works", "/start/launch", "/start/rebuild", "/contact"]
PRICES = ("¥9,800", "¥6,800")
findings = []
errors = []

def check(condition, label, details=""):
    findings.append({"check": label, "passed": bool(condition), "details": str(details)[:500]})
    if not condition:
        errors.append(label + (": " + str(details) if details else ""))

def wait_server(max_seconds=60):
    start = time.monotonic()
    while time.monotonic() - start < max_seconds:
        try:
            with urllib.request.urlopen(HOST + "/pricing", timeout=3) as response:
                if response.status == 200:
                    return
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            pass
        time.sleep(0.4)
    raise RuntimeError("Next.js production server did not serve /pricing")

def inspect_overflow(page, label):
    metrics = page.evaluate("""() => ({
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth
    })""")
    check(metrics["documentWidth"] <= metrics["width"] + 4,
          label + " horizontal overflow", metrics)
    return metrics

def screenshot(page, label):
    page.screenshot(path=str(OUT / (label + ".png")), full_page=True, animations="disabled")

def visit(page, path):
    response = page.goto(HOST + path, wait_until="domcontentloaded", timeout=35000)
    page.locator("main").first.wait_for(state="visible", timeout=20000)
    page.locator('button[aria-label="Language / 语言"], [role="group"][aria-label="Language / 语言"] button').first.wait_for(timeout=15000)
    return response

def run():
    browser_exec = next((shutil.which(n) for n in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser") if shutil.which(n)), None)
    if not browser_exec:
        raise RuntimeError("No Chrome or Chromium binary installed on the CI runner")
    server_log = open(OUT / "server.log", "w", encoding="utf-8")
    server = subprocess.Popen(["pnpm", "start", "-p", "3100"], stdout=server_log, stderr=subprocess.STDOUT)
    try:
        wait_server()
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=browser_exec, headless=True, args=["--no-sandbox"])
            for width in VIEWPORTS:
                context = browser.new_context(viewport={"width": width, "height": 900}, device_scale_factor=1)
                page = context.new_page()
                page_errors = []
                page.on("pageerror", lambda error: page_errors.append(str(error)))
                for path in PATHS:
                    name = path.strip("/").replace("/", "_") or "home"
                    prefix = str(width) + "_" + name
                    response = visit(page, path)
                    check(response is not None and response.status == 200, prefix + " HTTP 200",
                          getattr(response, "status", "no response"))
                    inspect_overflow(page, prefix + " EN")
                    check(page.locator("html").get_attribute("lang") == "en", prefix + " initial lang EN")
                    check(page.locator("meta[name='robots'][content*='noindex']").count() > 0,
                          prefix + " noindex retained")
                    if path in ("/", "/pricing"):
                        body = page.locator("#commercial-offers").inner_text()
                        for amount in (("¥9,800",) if path == "/" else PRICES):
                            check(amount in body, prefix + " price " + amount)
                        check("guide price" in body.lower() or "written" in body.lower() or "indicative" in body.lower(), prefix + " price disclaimer")
                        check("One clear price" in body or "complete" in body.lower(), prefix + " one-price offer")
                        check("12,800" not in body and "+¥5,000" not in body, prefix + " no microaddon price")
                        check("first-year" in body.lower(), prefix + " first year included")
                        if path == "/":
                            check(page.locator('a[href="/pricing"]').count() > 0, prefix + " pricing CTA")
                        else:
                            check(page.locator('a[href="/start/rebuild"]').count() > 0, prefix + " rebuild CTA")
                    if path in ("/start/launch", "/start/rebuild"):
                        check(page.locator('input[name="name"]').count() == 1, prefix + " real intake name field")
                        check(page.locator('input[name="email"]').count() == 1, prefix + " real intake email field")
                        check(page.locator('textarea[name="details"]').count() == 1, prefix + " real intake description")
                        check(not page.locator("form").first.evaluate("(form) => form.checkValidity()"),
                              prefix + " empty intake blocked by native validation")
                        if path.endswith("rebuild"):
                            check(page.locator('input[name="website"][required]').count() == 1, prefix + " rebuild URL required")
                    if path in ("/", "/pricing"):
                        screenshot(page, prefix + "_en")
                    page.locator('[role="group"][aria-label="Language / 语言"] button').filter(has_text="中文").first.click()
                    page.wait_for_function("document.documentElement.lang === 'zh-CN'", timeout=7000)
                    check(page.locator("html").get_attribute("lang") == "zh-CN", prefix + " ZH language toggle")
                    inspect_overflow(page, prefix + " ZH")
                    if path in ("/", "/pricing"):
                        body = page.locator("#commercial-offers").inner_text()
                        for amount in (("¥9,800",) if path == "/" else PRICES):
                            check(amount in body, prefix + " ZH price " + amount)
                        check("参考" in body and "签约前" in body, prefix + " Chinese complete-price disclosure")
                        check("SEO-Native" in body or "原生 SEO" in body, prefix + " native SEO service")
                        check("完整" in body and "首年" in body, prefix + " full-site and year-one hosting")
                        check("标准增项" not in body, prefix + " no microcharge list")
                        check("12,800" not in body, prefix + " no migration surcharge")
                        screenshot(page, prefix + "_zh")
                    if path == "/":
                        check(page.locator("#buyer-capabilities").count() == 1, prefix + " capability section")
                        check(page.locator("#transformation").count() == 1, prefix + " single transformation preview")
                        check(page.locator("#delivery-steps").count() == 1, prefix + " delivery summary")
                        check(page.locator("#report").count() == 0, prefix + " duplicate report removed")
                        check(page.locator("main input[type=url]").count() == 0, prefix + " no competing homepage URL entry")
                        check(page.locator('[data-testid="hero-hybrid-panel"]').count() == 1, prefix + " single hybrid hero panel")
                        check(page.locator('[data-testid="hero-hybrid-signal"]').count() == 4, prefix + " four signal nodes")
                        check(page.locator('[data-testid="hero-site-before"]').count() == 1, prefix + " before visual")
                        check(page.locator('[data-testid="hero-site-after"]').count() == 1, prefix + " after visual")
                        check(page.locator('[data-testid="hero-hybrid-panel"] a[href="/pricing"]').count() == 1, prefix + " right panel pricing CTA")
                        check("设计示意" in page.locator('[data-testid="hero-hybrid-panel"]').inner_text(), prefix + " honest demo disclosure")
                        check(page.locator('[data-testid="hero-hybrid-panel"]').is_visible(), prefix + " hero illustration visible")
                        panel = page.locator('[data-testid="hero-hybrid-panel"]')
                        # The site uses smooth scrolling globally. Test the observer after a deterministic instant scroll,
                        # not during a scroll transition where an intermediate visibility event may arrive.
                        panel.evaluate("(el) => el.scrollIntoView({block:'center',behavior:'instant'})")
                        page.wait_for_function(
                            "() => { const el = document.querySelector('[data-testid=hero-hybrid-panel]'); return el?.dataset.vfMotion === 'started' && el?.dataset.vfVisible === 'yes'; }",
                            timeout=7000
                        )
                        check(panel.get_attribute("data-vf-motion") == "started", prefix + " first-in-view motion triggered")
                        check(panel.get_attribute("data-vf-visible") == "yes", prefix + " stable in-viewport signal")
                        check(page.locator(".vf-motion-orbit-pulse").count() == 2, prefix + " two light signal paths")
                        check("vf-hybrid-after-in" in page.locator('[data-testid="hero-site-after"]').evaluate("(el) => getComputedStyle(el).animationName"),
                              prefix + " after one-shot animation bound")
                        check(page.locator('[data-testid="hero-hybrid-panel"] a[href="/pricing"]').is_enabled(), prefix + " pricing CTA stays actionable")
                        if width == 390:
                            page.emulate_media(reduced_motion="reduce")
                            check(page.locator('[data-testid="hero-site-after"]').evaluate("(el) => getComputedStyle(el).animationName") == "none",
                                  prefix + " reduced motion has no entrance animation")
                            check(page.locator(".vf-motion-orbit-pulse").first.evaluate("(el) => getComputedStyle(el).animationName") == "none",
                                  prefix + " reduced motion disables infinite signal")
                            check(page.locator('[data-testid="hero-site-after"]').is_visible(),
                                  prefix + " reduced motion retains a readable static design")
                            page.emulate_media(reduced_motion="no-preference")
                    if path == "/how-it-works":
                        t = page.locator("main").inner_text()
                        check("书面报价" in t and "确认" in t, prefix + " verified engagement boundary")
                    if path == "/contact":
                        check(page.locator('input[name="email"]').count() == 1, prefix + " contact intake exists")
                    # Reset initial language to EN for next route; provider state is per page context.
                    page.locator('[role="group"][aria-label="Language / 语言"] button').filter(has_text="EN").first.click()
                    page.wait_for_function("document.documentElement.lang === 'en'", timeout=7000)
                check(len(page_errors) == 0, str(width) + " runtime JavaScript errors", page_errors)
                context.close()
            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=8)
        except subprocess.TimeoutExpired:
            server.kill()
        server_log.close()

try:
    run()
except Exception as exc:
    errors.append("Test harness / browser execution failure: " + repr(exc))
    findings.append({"check": "Harness runtime", "passed": False, "details": repr(exc)})
finally:
    report = {
        "status": "PASS" if not errors else "FAIL",
        "checks": len(findings),
        "passed": sum(x["passed"] for x in findings),
        "failures": errors,
        "scope": "Local real Chrome browser of the GitHub Actions built commit; NOT protected Vercel Preview or live submitted lead",
        "viewports": VIEWPORTS,
        "routes": PATHS,
        "evidence": findings
    }
    (OUT / "results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "evidence"}, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
