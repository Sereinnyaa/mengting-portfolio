#!/usr/bin/env python3
"""Package the Vite build for offline use and generic static hosting."""

from __future__ import annotations

import base64
import mimetypes
import re
import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
PUBLIC = ROOT / "public"
RELEASE = ROOT / "release"


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def inline_site() -> Path:
    html_path = DIST / "index.html"
    if not html_path.exists():
        raise FileNotFoundError("dist/index.html is missing; run the production build first")

    html = html_path.read_text(encoding="utf-8")
    css_match = re.search(r'<link rel="stylesheet"[^>]+href="([^"]+\.css)"[^>]*>', html)
    js_match = re.search(r'<script type="module"[^>]+src="([^"]+\.js)"></script>', html)
    if not css_match or not js_match:
        raise RuntimeError("Could not locate Vite CSS/JS assets in dist/index.html")

    css_path = DIST / css_match.group(1).lstrip("/")
    js_path = DIST / js_match.group(1).lstrip("/")
    css = css_path.read_text(encoding="utf-8")
    js = js_path.read_text(encoding="utf-8")

    # Online builds use Google Fonts, but the offline file uses the declared
    # PingFang/Microsoft YaHei fallbacks and therefore makes no font request.
    css = re.sub(r"@import\s*(?:url\()?['\"]?https://fonts\.googleapis\.com/[^;]+;", "", css, count=1)

    local_urls = sorted(set(re.findall(r"(?:assets|resume)/[A-Za-z0-9._/-]+", js)))
    if not local_urls:
        raise RuntimeError("No local media references found in the JavaScript bundle")

    for url in local_urls:
        source = PUBLIC / url
        if not source.exists():
            raise FileNotFoundError(f"Referenced public asset is missing: {source}")
        js = js.replace(url, data_uri(source))

    css = css.replace("</style", "<\\/style")
    js = js.replace("</script", "<\\/script")
    html = html.replace(css_match.group(0), f"<style>{css}</style>")
    html = html.replace(js_match.group(0), f'<script type="module">{js}</script>')

    forbidden = [r'src="assets/', r'href="assets/', r'resume/', "fonts.googleapis.com"]
    remaining = [token for token in forbidden if token in html]
    if remaining:
        raise RuntimeError(f"Offline HTML still has network/local-root dependencies: {remaining}")

    RELEASE.mkdir(parents=True, exist_ok=True)
    offline_html = RELEASE / "mengting-portfolio-offline.html"
    offline_html.write_text(html, encoding="utf-8")
    return offline_html


def create_archives(offline_html: Path) -> tuple[Path, Path]:
    instructions = (
        "喻梦婷 AI PM 作品集 - 离线版\n\n"
        "1. 解压后，直接双击 mengting-portfolio-offline.html。\n"
        "2. 页面图片、交互和简历均已内嵌，不需要安装软件或启动服务器。\n"
        "3. TripSage、GitHub 等外部链接仍需联网访问。\n"
    )

    offline_zip = RELEASE / "mengting-portfolio-offline.zip"
    with zipfile.ZipFile(offline_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        archive.write(offline_html, "mengting-portfolio-offline.html")
        archive.writestr("使用说明.txt", instructions)

    static_zip = RELEASE / "mengting-portfolio-static-site.zip"
    with zipfile.ZipFile(static_zip, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(DIST.rglob("*")):
            if path.is_file():
                archive.write(path, path.relative_to(DIST))

    return offline_zip, static_zip


def main() -> None:
    if RELEASE.exists():
        shutil.rmtree(RELEASE)
    offline_html = inline_site()
    offline_zip, static_zip = create_archives(offline_html)
    for path in (offline_html, offline_zip, static_zip):
        print(f"Created {path.relative_to(ROOT)} ({path.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
