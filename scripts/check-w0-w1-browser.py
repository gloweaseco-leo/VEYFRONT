#!/usr/bin/env python3
"""Read-only production-build browser smoke QA for current VEYFRONT routes.
Tests both canonical locales, responsive layout and real client controls without
submitting leads, signing in, changing production, or asserting historical prices.
"""
import json
import shutil
import subprocess
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

HOST = "http://127.0.0.1:3100"
OUT = Path("qa-evidence/w0-w1-browser")
OUT.mkdir(parents=True, exist_ok=True)
WIDTHS = [320, 360, 390, 430, 768, 1440]
ROUTES = ["/", "/pricing", "/transformations", "/how-it-works",
          "/start/launch", "/start/rebuild", "/contact"]
findings = []
failures = []

def check(ok, name, details=""):
    findings.append({"name": name, "passed": bool(ok), "details": str(details)[:400]})
    if not ok:
        failures.append(name + (": " + str(details) if details else ""))

def wait_server():
    start = time.monotonic()
    while time.monotonic() - start < 75:
        try:
            with urllib.request.urlopen(HOST + "/pricing", timeout=3) as resp:
                if resp.status == 200:
                    return
        except Exception:
            pass
        time.sleep(0.5)
    raise RuntimeError("Local Next production server did not become ready")

def overflow(page):
    return page.evaluate("""() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth
    })""")

def run():
    executable = next((shutil.which(n) for n in
        ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser")
        if shutil.which(n)), None)
    if not executable:
        raise RuntimeError("Chromium binary not installed")
    log = open(OUT / "server.log", "w", encoding="utf-8")
    server = subprocess.Popen(["pnpm", "start", "-p", "3100"], stdout=log, stderr=subprocess.STDOUT)
    try:
        wait_server()
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=executable, headless=True,
                                        args=["--no-sandbox"])
            for width in WIDTHS:
                context = browser.new_context(viewport={"width": width, "height": 860}, device_scale_factor=1)
                page = context.new_page()
                js_errors = []
                page.on("pageerror", lambda err: js_errors.append(str(err)))
                for locale in ("zh", "en"):
                    prefix = "" if locale == "zh" else "/en"
                    for route in ROUTES:
                        path = prefix + ("" if route == "/" else route)
                        if not path:
                            path = "/"
                        label = f"{width}/{locale}{route}"
                        response = page.goto(HOST + path, wait_until="domcontentloaded", timeout=45000)
                        check(response is not None and response.status == 200,
                              label + " HTTP 200", getattr(response, "status", None))
                        page.locator("main").first.wait_for(state="visible", timeout=16000)
                        check(page.locator("h1").count() == 1, label + " semantic heading")
                        expected_lang = "zh-CN" if locale == "zh" else "en"
                        check(page.locator("html").get_attribute("lang") == expected_lang,
                              label + " canonical language")
                        lang_links = page.locator('header [role="group"][aria-label="Language / 语言"] a')
                        check(lang_links.count() == 2, label + " real language links", lang_links.count())
                        metrics = overflow(page)
                        check(max(metrics["document"], metrics["body"]) <= width + 3,
                              label + " horizontal overflow", metrics)
                        nav = page.locator('[data-testid="mobile-quick-nav"]')
                        check(nav.count() == 1 and nav.is_visible() == (width < 768),
                              label + " mobile nav breakpoint")
                        if route == "/":
                            cards = page.locator('[data-testid="mobile-scenario-card"]')
                            check(cards.count() == 3, label + " three buyer scenarios")
                            if width < 768 and cards.count() == 3:
                                for i in range(3):
                                    desc = cards.nth(i).locator('[data-testid="mobile-scenario-description"]').bounding_box()
                                    action = cards.nth(i).locator('[data-testid="mobile-scenario-action"]').bounding_box()
                                    if desc and action:
                                        gap = round(action["y"] - desc["y"] - desc["height"], 2)
                                        check(0 <= gap <= 34, label + f" scenario {i+1} no dead space", gap)
                        elif route == "/pricing":
                            tabs = page.locator('[data-testid="mobile-plan-tabs"]')
                            if width < 768:
                                check(tabs.count() >= 1 and tabs.first.is_visible(),
                                      label + " price tabs usable")
                            text = page.locator("main").inner_text()
                            check(all(x in text for x in ("3,680", "6,680", "9,680")),
                                  label + " published prices")
                        elif route in ("/contact", "/start/launch", "/start/rebuild"):
                            check(page.locator('input[name="email"]').count() == 1,
                                  label + " form field")
                            check(page.locator('textarea[name="details"]').count() == 1,
                                  label + " project brief")
                            if route == "/contact" and locale == "zh":
                                check(page.locator("#wechat").count() == 1,
                                      label + " real WeCom card")
                                if width < 768:
                                    toggle = page.locator('#wechat button[aria-controls="vf-wecom-qr"]')
                                    check(toggle.count() == 1, label + " mobile QR fallback")
                                    if toggle.count():
                                        toggle.click()
                                        check(page.locator("#vf-wecom-qr").is_visible(),
                                              label + " QR expansion")
                                        toggle.click()
                        if width in (390, 1440) and locale == "zh" and route in ("/", "/pricing", "/contact"):
                            page.screenshot(path=str(OUT / f"{width}_{route.strip('/').replace('/','_') or 'home'}_zh.png"),
                                            full_page=True, animations="disabled", timeout=30000)
                check(not js_errors, f"{width} JS errors", js_errors[:5])
                context.close()
            browser.close()
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()
        log.close()

if __name__ == "__main__":
    try:
        run()
    except Exception as e:
        failures.append("Browser harness: " + repr(e))
    result = {"status": "PASS" if not failures else "FAIL",
              "checked": len(findings), "failed": len(failures),
              "failures": failures[:40], "findings": findings}
    (OUT / "result.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in result.items() if k != "findings"}, ensure_ascii=False, indent=2))
    raise SystemExit(0 if not failures else 1)
