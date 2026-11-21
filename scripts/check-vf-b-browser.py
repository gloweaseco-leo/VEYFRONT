"""Local-only browser pass against the VEYFRONT G1 synthetic HTTPS harness."""
import shutil
import sys
from playwright.sync_api import expect, sync_playwright

base = sys.argv[1]
assert base == "http://127.0.0.1:3114"
binary = shutil.which("google-chrome") or shutil.which("chromium")

with sync_playwright() as driver:
    for i, locale in enumerate(("zh", "en"), 1):
        browser = driver.chromium.launch(executable_path=binary, args=["--no-sandbox"])
        context = browser.new_context(viewport={"width": 390 if locale == "zh" else 1440, "height": 900})
        context.route("**/*", lambda route: route.continue_() if route.request.url.startswith(base + "/") else route.abort())
        page = context.new_page()
        prefix = "" if locale == "zh" else "/en"
        page.goto(base + prefix + "/website-diagnosis", wait_until="domcontentloaded", timeout=120_000)
        form = page.locator("section").filter(has=page.get_by_role("heading", name="本地 G1 离线联调" if locale == "zh" else "Local G1 offline integration"))
        code = f"local-browser-test-code-{'one' if i == 1 else 'two'}"
        url = form.get_by_label("授权示例网址" if locale == "zh" else "Authorized example URL")
        form.get_by_label("离线邀请码" if locale == "zh" else "Offline invitation code").fill(code)
        for check in form.get_by_role("checkbox").all():
            check.check()
        submit = form.get_by_role("button", name="提交离线任务" if locale == "zh" else "Submit offline task")
        cross_origin = page.request.post(base + "/api/website-diagnosis", headers={"Origin": "http://localhost:3114"}, data={"action": "status", "code": code})
        assert cross_origin.status == 403
        url.fill(f"https://company-{3 - i}.example/")
        with page.expect_response(lambda r: r.url == base + "/api/website-diagnosis") as rejected:
            submit.click()
        assert rejected.value.status == 403
        expect(form.get_by_role("status")).to_contain_text("校验未通过" if locale == "zh" else "was rejected")
        url.fill(f"https://company-{i}.example/")
        with page.expect_response(lambda r: r.url == base + "/api/website-diagnosis") as accepted:
            submit.click()
        assert accepted.value.status == 202
        payload = accepted.value.json()
        assert set(payload) == {"status", "auditRef", "pollAfterSeconds"}
        assert payload["auditRef"] == "aref-" + str(i).zfill(32)
        expect(form.get_by_role("status")).to_contain_text("已受理" if locale == "zh" else "accepted")
        with page.expect_response(lambda r: r.url == base + "/api/website-diagnosis") as current:
            form.get_by_role("button", name="刷新任务状态" if locale == "zh" else "Refresh task status").click()
        assert current.value.status == 200 and current.value.json() == {"status": "running", "reportAvailable": False}
        expect(form.get_by_role("status")).to_contain_text("处理中" if locale == "zh" else "processing")
        expect(page.get_by_test_id("diagnosis-report")).to_have_count(0)
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        assert page.url == base + prefix + "/website-diagnosis"
        browser.close()
print("Client → Next BFF → synthetic HTTPS service: 2 scopes, 2×403, 2×202, 2×200")
