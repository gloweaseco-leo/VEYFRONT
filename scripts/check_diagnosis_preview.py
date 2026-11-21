#!/usr/bin/env python3
"""Exercise VF-A in Chromium against the local production build."""
import json
import os
import shutil
import subprocess
import time
import urllib.error
import urllib.request
from contextlib import contextmanager
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path("qa-evidence/w0-w1-browser/vf-a")
BASE = "http://127.0.0.1:3101"
PATH = "/website-diagnosis"
TARGET = "https://qa-domain.example.com/" + "long-public-path-" * 20


@contextmanager
def server(environment):
    with (ROOT / f"server-{environment}.log").open("w", encoding="utf-8") as log:
        with subprocess.Popen(
            ["pnpm", "exec", "next", "start", "-p", "3101", "-H", "127.0.0.1"],
            env={**os.environ, "VERCEL_ENV": environment}, stdout=log, stderr=subprocess.STDOUT,
        ) as process:
            try:
                for _ in range(100):
                    try:
                        with urllib.request.urlopen(BASE, timeout=2) as response:
                            if response.status == 200:
                                break
                    except OSError:
                        if process.poll() is not None:
                            raise RuntimeError(f"Next.js exited in {environment}")
                        time.sleep(0.3)
                else:
                    raise RuntimeError(f"Next.js did not start in {environment}")
                yield
            finally:
                process.terminate()
                try:
                    process.wait(timeout=7)
                except subprocess.TimeoutExpired:
                    process.kill()


def run():
    ROOT.mkdir(parents=True, exist_ok=True)
    results = []

    def check(condition, label):
        results.append({"check": label, "passed": bool(condition)})
        if not condition:
            raise AssertionError(label)

    def status(path):
        try:
            with urllib.request.urlopen(BASE + path, timeout=10) as response:
                return response.status
        except urllib.error.HTTPError as error:
            return error.code

    try:
        with server("production"):
            for prefix in ("", "/en"):
                check(status(prefix + PATH) == 404, prefix + " live diagnostic route is closed")
                for path in ("/", "/start/rebuild"):
                    with urllib.request.urlopen(BASE + prefix + path, timeout=10) as response:
                        html = response.read().decode()
                    check('data-testid="diagnosis-entry"' not in html, prefix + path + " no live diagnostic entry")
                with urllib.request.urlopen(BASE + prefix + "/start/rebuild", timeout=10) as response:
                    live_form = response.read().decode()
                check('no crawling' in live_form or '不会自动抓取' in live_form,
                      prefix + " live form preserves no-crawl explanation")

        executable = next((shutil.which(name) for name in ("google-chrome", "chromium") if shutil.which(name)), None)
        with server("preview"), sync_playwright() as playwright:
            for width in (320, 375, 390, 1440):
                for locale, prefix in (("zh", ""), ("en", "/en")):
                    label = f"{width}/{locale}"
                    browser = playwright.chromium.launch(executable_path=executable, args=["--no-sandbox"])
                    context = browser.new_context(viewport={"width": width, "height": 900})
                    context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(BASE + "/") else route.abort())
                    page = context.new_page()
                    requests = []
                    errors = []
                    page.on("request", lambda req: requests.append((req.method, req.url, req.post_data)))
                    page.on("pageerror", lambda err: errors.append(str(err)))
                    page.goto(BASE + prefix + "/")
                    expect(page.get_by_test_id("diagnosis-entry")).to_have_attribute("href", prefix + PATH)
                    page.get_by_test_id("diagnosis-entry").click()
                    expect(page).to_have_url(BASE + prefix + PATH)
                    check(page.locator("html").get_attribute("lang") == ("zh-CN" if locale == "zh" else "en"), label + " browser locale")
                    check(page.locator("h1").count() == 1, label + " one H1")
                    check("noindex" in page.locator('meta[name="robots"]').get_attribute("content"),
                          label + " preview noindex")
                    check(page.locator('meta[name="referrer"]').get_attribute("content") == "no-referrer", label + " referrer suppressed")
                    check(page.locator("#diagnosis-address").get_attribute("name") is None, label + " address not serialized")
                    requests.clear()
                    address = page.locator("#diagnosis-address")
                    feedback = page.locator("#diagnosis-feedback")
                    submit = page.get_by_test_id("diagnosis-address-form").get_by_role("button")
                    submit.click()
                    expect(feedback).to_contain_text("请输入" if locale == "zh" else "Enter your public")
                    address.fill("not a website")
                    submit.click()
                    expect(feedback).to_contain_text("检查网址格式" if locale == "zh" else "Check the address format")
                    for blocked in ("https://localhost", "https://qa-domain.example.com/?secret=not-sent"):
                        address.fill(blocked)
                        submit.click()
                        expect(feedback).to_contain_text("请使用公开" if locale == "zh" else "Use a public website address")
                    address.fill(TARGET)
                    submit.click()
                    expect(feedback).to_contain_text("有权提出" if locale == "zh" else "authorised to request")
                    page.locator("#diagnosis-permission").check()
                    submit.click()
                    expect(feedback).to_contain_text("没有访问网站或创建任务" if locale == "zh" else "no visit or task was created")
                    expect(page.get_by_test_id("diagnosis-task-state")).to_have_count(0)
                    check(page.url == BASE + prefix + PATH, label + " own URL stays out of navigation")
                    check(not any(TARGET in value for value in page.evaluate(
                        "() => [...Object.values(sessionStorage), ...Object.values(localStorage)]")), label + " own URL not stored")
                    check(not any(method == "POST" or "qa-domain.example.com" in url or "qa-domain.example.com" in (body or "")
                                  for method, url, body in requests), label + " own address has no network egress")
                    check(not any("/_vercel/insights/view" in url or "/_vercel/speed-insights/vitals" in url
                                  for _, url, _ in requests), label + " no first-party proxy analytics event on diagnostic page")
                    if width in (390, 1440):
                        page.screenshot(path=str(ROOT / f"{width}-{locale}-entry.png"), full_page=True)

                    page.get_by_test_id("diagnosis-start-example").click()
                    task = page.get_by_test_id("diagnosis-task-state")
                    choose = page.locator("#diagnosis-example-state")
                    report = page.get_by_test_id("diagnosis-report")
                    expect(task).to_have_attribute("data-state", "accepted")
                    page.get_by_test_id("diagnosis-example-next").click()
                    expect(task).to_have_attribute("data-state", "running")
                    expect(report).to_have_count(0)
                    page.get_by_test_id("diagnosis-example-next").click()
                    expect(task).to_have_attribute("data-state", "completed")
                    expect(report).to_be_visible()
                    expect(page.get_by_test_id("buyer-task")).to_have_count(5)
                    expect(report).to_contain_text("UNKNOWN")
                    expect(report).not_to_contain_text(TARGET)
                    expect(report.locator("ol li")).to_have_count(2)
                    report.locator('a[href="#diagnosis-UNDERSTAND"]').click()
                    page.locator("#diagnosis-UNDERSTAND summary").click()
                    expect(page.locator("#diagnosis-UNDERSTAND blockquote")).to_contain_text("Stainless steel 316")
                    check(page.evaluate("document.documentElement.scrollWidth <= innerWidth"), label + " no overflow with long evidence")
                    other = "EN" if locale == "zh" else "中文"
                    page.get_by_role("button", name=other, exact=True).click()
                    expect(report).to_contain_text("Sample report" if locale == "zh" else "报告示例")
                    expect(task).to_have_attribute("data-state", "completed")
                    page.get_by_role("button", name="中文" if locale == "zh" else "EN", exact=True).click()
                    choose.select_option("partial")
                    expect(task).to_have_attribute("data-state", "partial")
                    expect(report).to_contain_text("3 / 4" if locale == "zh" else "3 of 4")
                    if width in (390, 1440):
                        page.screenshot(path=str(ROOT / f"{width}-{locale}-report.png"), full_page=True)
                    contact = page.locator('section[aria-labelledby="diagnosis-contact-title"]')
                    cta = contact.get_by_role("link")
                    expect(cta).to_have_count(1)
                    expect(cta).to_have_text("咨询网站改版" if locale == "zh" else "Discuss a website redesign")
                    expect(cta).to_have_attribute("href", prefix + "/start/rebuild#rebuild-inquiry")
                    check(contact.get_by_role("button").count() == 0, label + " single redesign action after the report")
                    check(not any(word in page.locator("main").inner_text().lower() for word in ("虚构", "fictional")),
                          label + " uses example language throughout")
                    for terminal in ("failed", "expired", "unavailable", "access-ended"):
                        choose.select_option(terminal)
                        expect(task).to_have_attribute("data-state", terminal)
                        expect(report).to_have_count(0)
                        expect(cta).to_be_visible()
                    logged = page.request.post(BASE + "/api/leads", data={"service": "rebuild"})
                    check(logged.status == 403 and "no-store" in logged.headers["cache-control"], label + " preview writes fail closed")

                    cta.click()
                    expect(page).to_have_url(BASE + prefix + "/start/rebuild#rebuild-inquiry")
                    expect(page.locator("#vf-name")).to_be_in_viewport()
                    expect(page.locator("#vf-details")).to_have_value("")
                    expect(page.locator("#vf-website")).to_have_value("")
                    expect(page.locator('a[href="https://veyfront.com' + prefix + '/start/rebuild"]')).to_be_visible()
                    page.locator("#vf-name").fill("Synthetic QA")
                    page.locator("#vf-email").fill("qa@example.com")
                    page.locator("#vf-website").fill("https://example.com")
                    page.locator("#vf-details").fill("I want buyers to find our products more easily.")
                    page.locator("form input[type=checkbox]").press("Space")
                    page.get_by_role("button", name="验证试填信息" if locale == "zh" else "Validate sample fields").click()
                    expect(page.get_by_role("status").filter(has_text="没有发送" if locale == "zh" else "No information was sent")).to_be_visible()
                    check(not any(method == "POST" for method, _, _ in requests), label + " consulting form validates without posting")
                    page.goto(BASE + prefix + "/start/rebuild")
                    expect(page.get_by_test_id("diagnosis-entry")).to_be_visible()
                    if locale == "zh":
                        expect(page.locator('main a[href="/contact#wechat"]')).to_be_visible()
                    check(not errors, label + " no browser exceptions")
                    results.append({"check": label + " buyer journey and all statuses", "passed": True})
                    browser.close()
    except Exception as error:
        results.append({"check": str(error), "passed": False})
        raise
    finally:
        (ROOT / "result.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"VF-A browser assertions: {sum(row['passed'] for row in results)}/{len(results)} recorded checks")


if __name__ == "__main__":
    run()
