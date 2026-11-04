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
lab_navigation = []

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
                    suffix = '' if path == '/' else path
                    check(page.locator('link[rel="canonical"]').get_attribute("href") == "https://veyfront.com" + suffix,
                          prefix + " English self canonical")
                    for hreflang, href in (('en', 'https://veyfront.com' + suffix),
                                           ('zh-CN', 'https://veyfront.com/zh' + suffix),
                                           ('x-default', 'https://veyfront.com' + suffix)):
                        loc = page.locator('link[rel="alternate"][hreflang="' + hreflang + '"]')
                        check(loc.count() == 1 and loc.first.get_attribute("href") == href,
                              prefix + " reciprocal " + hreflang + " hreflang")
                    check(page.locator('meta[property="og:title"]').count() == 1, prefix + " Open Graph title")
                    check(page.locator('meta[property="og:image"]').count() >= 1, prefix + " Open Graph image")
                    check(page.locator('meta[name="twitter:card"][content="summary_large_image"]').count() == 1,
                          prefix + " Twitter summary image card")
                    scripts = page.locator('script[type="application/ld+json"]')
                    graph = [json.loads(x.inner_text()) for x in scripts.all() if x.inner_text().strip()]
                    check(any(any(n.get('@type') == 'Organization' and n.get('name') == 'VEYFRONT'
                                  for n in doc.get('@graph', [])) for doc in graph if isinstance(doc, dict)),
                          prefix + " verified brand Organization schema")
                    check(not any('aggregateRating' in json.dumps(doc) or 'reviewCount' in json.dumps(doc)
                                  for doc in graph), prefix + " no invented reviews")
                    if width in (390, 1440) and path in ('/', '/pricing', '/contact'):
                        sample = page.evaluate("""() => {
                          const n=performance.getEntriesByType('navigation')[0];
                          const resources=performance.getEntriesByType('resource');
                          return {domContentLoadedMs: Math.round(n?.domContentLoadedEventEnd||0),
                            responseStartMs: Math.round(n?.responseStart||0),
                            resourceCount: resources.length,
                            sameOriginTransferBytes: Math.round(resources.filter(r=>r.name.startsWith(location.origin)).reduce((s,r)=>s+(r.transferSize||0),0))};
                        }""")
                        lab_navigation.append({"viewport":width,"route":path,"locale":"en","sample":sample})
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
                    page.wait_for_url(HOST + ("/zh" if path == "/" else "/zh" + path), timeout=12000)
                    page.wait_for_function("document.documentElement.lang === 'zh-CN'", timeout=7000)
                    page.wait_for_function("""() => document.querySelector('meta[property="og:locale"]')?.getAttribute('content') === 'zh_CN'""", timeout=9000)
                    check(page.locator("html").get_attribute("lang") == "zh-CN", prefix + " ZH language toggle")
                    check(page.locator('meta[property="og:locale"][content="zh_CN"]').count() == 1,
                          prefix + " Chinese Open Graph locale")
                    inspect_overflow(page, prefix + " ZH")
                    if path in ("/", "/pricing"):
                        body = page.locator("#commercial-offers").inner_text()
                        for amount in (("¥9,800",) if path == "/" else PRICES):
                            check(amount in body, prefix + " ZH price " + amount)
                        check("参考" in body and "签约前" in body, prefix + " Chinese complete-price disclosure")
                        check("SEO-Native" in body or "原生 SEO" in body or "搜索优化基础" in body, prefix + " native SEO service")
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
                        check(page.locator('[data-testid="hero-hybrid-panel"] a[href="/zh/pricing"]').count() == 1, prefix + " right panel Chinese pricing CTA")
                        check("设计示意" in page.locator('[data-testid="hero-hybrid-panel"]').inner_text(), prefix + " honest demo disclosure")
                        check(page.locator('[data-testid="hero-hybrid-panel"]').is_visible(), prefix + " hero illustration visible")
                        panel = page.locator('[data-testid="hero-hybrid-panel"]')
                        # The site uses smooth scrolling globally. Test the observer after a deterministic instant scroll,
                        # not during a scroll transition where an intermediate visibility event may arrive.
                        # Full-page screenshots may leave the IntersectionObserver's last
                        # entry as not-visible while the document is restored without a scroll.
                        # Force a genuine out-of-view -> in-view crossing before asserting.
                        page.evaluate("window.scrollTo({top: document.documentElement.scrollHeight, behavior:'instant'})")
                        page.wait_for_function("() => document.querySelector('[data-testid=hero-hybrid-panel]')?.dataset.vfVisible === 'no'", timeout=5000)
                        panel.evaluate("(el) => el.scrollIntoView({block:'center',behavior:'instant'})")
                        try:
                            page.wait_for_function(
                                "() => { const el=document.querySelector('[data-testid=hero-hybrid-panel]'); return el?.dataset.vfMotion === 'started' && el?.dataset.vfVisible === 'yes'; }",
                                timeout=6000
                            )
                        except Exception as observer_error:
                            observer_debug = page.evaluate("""() => {
                                const el=document.querySelector('[data-testid=hero-hybrid-panel]');
                                const r=el?.getBoundingClientRect();
                                return {top:r?.top,bottom:r?.bottom,height:r?.height,viewport:innerHeight,scrollY:scrollY,
                                        motion:el?.dataset.vfMotion,visible:el?.dataset.vfVisible,documentHeight:document.documentElement.scrollHeight};
                            }""")
                            check(False, prefix + " viewport observer readiness", str(observer_debug) + " " + repr(observer_error))
                        check(panel.get_attribute("data-vf-motion") == "started", prefix + " first-in-view motion triggered")
                        check(panel.get_attribute("data-vf-visible") == "yes", prefix + " stable in-viewport signal")
                        check("vf-hybrid-frame-breathe" in panel.evaluate("(el) => getComputedStyle(el).animationName"),
                              prefix + " outer frame breathing animation bound")
                        safe_arrows = page.evaluate("""() => {
                            const a=document.querySelector('[data-testid=hero-upgrade-arrow]')?.getBoundingClientRect();
                            const b=document.querySelector('[data-testid=hero-site-after]')?.getBoundingClientRect();
                            const info=document.querySelector('[data-testid=hero-hybrid-panel]')?.querySelector('a[href="/zh/pricing"]')?.getBoundingClientRect();
                            if(!a || !b || !info)return {safe:false, reason:'missing element'};
                            return {safe:a.right <= b.left - 2 && a.bottom <= info.top - 8,
                              arrowRight:Math.round(a.right),afterLeft:Math.round(b.left),arrowBottom:Math.round(a.bottom),infoTop:Math.round(info.top)};
                        }""")
                        check(safe_arrows["safe"], prefix + " arrow clear of after content and bottom copy", safe_arrows)
                        check(page.locator(".vf-motion-orbit-pulse").count() == 2, prefix + " two light signal paths")
                        check("vf-hybrid-after-in" in page.locator('[data-testid="hero-site-after"]').evaluate("(el) => getComputedStyle(el).animationName"),
                              prefix + " after one-shot animation bound")
                        check(page.locator('[data-testid="hero-hybrid-panel"] a[href="/zh/pricing"]').is_enabled(), prefix + " Chinese pricing CTA stays actionable")
                        if width == 390:
                            page.emulate_media(reduced_motion="reduce")
                            check(page.locator('[data-testid="hero-site-after"]').evaluate("(el) => getComputedStyle(el).animationName") == "none",
                                  prefix + " reduced motion has no entrance animation")
                            check(panel.evaluate("(el) => getComputedStyle(el).animationName") == "none",
                                  prefix + " reduced motion disables frame breathing")
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
                        check(page.locator('#wechat').count() == 1, prefix + " Chinese WeCom contact card exists")
                        check(page.locator('input[name="wechat"]').count() == 1, prefix + " WeChat ID contact field")
                        check(page.locator('input[name="phone"]').count() == 1, prefix + " phone contact field")
                        check(page.locator('input[name="email"][required]').count() == 0, prefix + " general inquiry email optional")
                        check(page.locator('input[name="preferredContact"]').count() == 4, prefix + " contact preference options")
                        check("企业微信接待入口尚未启用" not in page.locator('#wechat').inner_text(),
                              prefix + " WeCom contact enabled with real QR")
                        check(page.locator('#wechat img[src="/contact/veyfront-wecom.png"]').count() == 1,
                              prefix + " provided WeCom QR is mounted")
                        check(page.locator('#wechat a[href^="https://work.weixin.qq.com/u/"]').count() == 1,
                              prefix + " official decoded WeCom mobile contact link")
                        qr = page.locator('#wechat img').first
                        qr.scroll_into_view_if_needed()
                        page.wait_for_function("() => document.querySelector('#wechat img')?.naturalWidth > 0", timeout=8000)
                        check(qr.evaluate("(img) => img.complete && img.naturalWidth > 0"),
                              prefix + " WeCom QR asset actually loaded")
                        if width == 1440:
                            page.locator('header button:has-text("微信咨询")').first.click()
                            check(page.locator('#vf-header-contact img[src="/contact/veyfront-wecom.png"]').count() == 1,
                                  prefix + " desktop header QR panel opens")
                            page.locator('#vf-header-contact button[aria-label="关闭微信联系面板"]').click()
                        if width in (1440, 390):
                            screenshot(page, prefix + "_contact_l1l3_zh")
                    # Reset initial language to EN for next route; provider state is per page context.
                    page.locator('[role="group"][aria-label="Language / 语言"] button').filter(has_text="EN").first.click()
                    page.wait_for_url(HOST + path, timeout=12000)
                    page.wait_for_function("document.documentElement.lang === 'en'", timeout=7000)
                if width in (1440, 390):
                    for zh_path in ("/zh", "/zh/pricing", "/zh/contact", "/zh/contact/privacy", "/zh/start/launch", "/zh/start/rebuild"):
                        response = visit(page, zh_path)
                        zprefix = str(width) + "_" + zh_path.strip("/").replace("/", "_")
                        check(response is not None and response.status == 200, zprefix + " direct Chinese URL HTTP 200")
                        check(page.locator("html").get_attribute("lang") == "zh-CN", zprefix + " SSR lang zh-CN")
                        check(page.locator('link[rel="canonical"]').get_attribute("href") == "https://veyfront.com" + zh_path, zprefix + " localized canonical")
                        check(page.locator('meta[name="robots"][content*="noindex"]').count() > 0, zprefix + " preview stays noindex")
                        inspect_overflow(page, zprefix + " ZH")
                        if zh_path == "/zh":
                            check(page.locator("h1").first.inner_text().startswith("让海外客户找到你"), zprefix + " Chinese SSR headline")
                            check(page.locator('a[href="/zh/pricing"]').count() > 0, zprefix + " Chinese nav pricing URL")
                        if zh_path == "/zh/contact":
                            check(page.locator('input[name="email"][required]').count() == 0, zprefix + " email optional on Chinese contact")
                            check(page.locator('#wechat').count() == 1, zprefix + " Chinese WeCom path")
                        if zh_path == "/zh/contact/privacy":
                            check(page.locator('input[name="email"][required]').count() == 1, zprefix + " privacy email still required")
                            check(page.locator('input[name="wechat"]').count() == 0, zprefix + " privacy is not sales intake")
                            tx = page.locator("main").inner_text()
                            check("个人信息与隐私请求" in tx and "提交隐私请求" in tx, zprefix + " privacy-specific content and CTA")
                            check("标准建设范围" not in tx and "完整报价" not in tx, zprefix + " no sales quote on privacy form")
                if width == 1440:
                    response = page.request.get(HOST + "/opengraph-image", timeout=60000)
                    check(response.status == 200 and "image/png" in (response.headers.get("content-type","")),
                          str(width) + " brand social PNG route generated",
                          {"status":response.status,"type":response.headers.get("content-type")})
                    check(response.body()[:8] == b"\x89PNG\r\n\x1a\n",
                          str(width) + " actual PNG magic bytes")
                    robots = page.request.get(HOST + "/robots.txt")
                    check("Disallow: /" in robots.text(), str(width) + " preview robot isolation")
                    sitemap = page.request.get(HOST + "/sitemap.xml")
                    check("veyfront.com/zh/contact" not in sitemap.text(), str(width) + " preview sitemap empty")
                    for internal in ("/a", "/b", "/review/stage-1"):
                        v = page.request.get(HOST + internal, timeout=20000)
                        check(v.status == 200 and "noindex" in v.text().lower(),
                              str(width) + " internal design noindex " + internal)
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
        "evidence": findings,
        "labNavigation": lab_navigation
    }
    (OUT / "results.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: v for k, v in report.items() if k != "evidence"}, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
