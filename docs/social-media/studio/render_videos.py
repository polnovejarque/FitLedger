#!/usr/bin/env python3
"""
FitLeader Social Studio — Deterministic 1080x1920 MP4 Renderer
Steps stage.html frame-by-frame via Playwright + Chrome and pipes directly to FFmpeg H.264 + AAC (+faststart).
"""

import base64
import json
import mimetypes
import subprocess
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

STUDIO_DIR = Path(__file__).resolve().parent
OUT_DIR = STUDIO_DIR / "out"
ASSETS_DIR = STUDIO_DIR / "assets"
STAGE_HTML = STUDIO_DIR / "stage.html"

FPS = 30


def find_asset_data_uri(stem: str) -> str | None:
    for ext in (".png", ".jpg", ".jpeg", ".webp"):
        p = ASSETS_DIR / f"{stem}{ext}"
        if p.exists():
            mime = mimetypes.guess_type(str(p))[0] or "image/png"
            b64 = base64.b64encode(p.read_bytes()).decode("ascii")
            return f"data:{mime};base64,{b64}"
    return None


def render_one(browser, slug: str, out_mp4_name: str):
    t0 = time.time()
    manifest_path = OUT_DIR / f"{slug}_timings.json"
    audio_path = OUT_DIR / f"{slug}_audio.wav"
    out_mp4 = OUT_DIR / out_mp4_name

    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    duration = float(manifest["duration"])
    total_frames = int(round(duration * FPS))

    extra_assets = {}
    ig_bg = find_asset_data_uri("frame_ig_hook")
    tt_bg = find_asset_data_uri("frame_tt_hook")
    if ig_bg:
        extra_assets["frame_ig_hook"] = ig_bg
    if tt_bg:
        extra_assets["frame_tt_hook"] = tt_bg

    page = browser.new_page(viewport={"width": 1080, "height": 1920}, device_scale_factor=1)
    page.goto(STAGE_HTML.as_uri(), wait_until="networkidle")
    page.evaluate("([m, a]) => window.initStage(m, a)", [manifest, extra_assets])

    ffmpeg_cmd = [
        "ffmpeg",
        "-y",
        "-loglevel",
        "error",
        "-f",
        "image2pipe",
        "-vcodec",
        "mjpeg",
        "-framerate",
        str(FPS),
        "-i",
        "-",
        "-i",
        str(audio_path),
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        "-movflags",
        "+faststart",
        str(out_mp4),
    ]
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
    assert proc.stdin is not None

    qa_Snapshot_times = {
        "cover": 1.2,
        "mid": round(duration * 0.50, 2),
        "cta": max(0.5, round(duration - 1.1, 2)),
    }
    qa_frames = {int(sec * FPS): name for name, sec in qa_Snapshot_times.items()}

    for f in range(total_frames):
        sec = f / FPS
        page.evaluate("(t) => window.renderAtTime(t)", sec)
        jpg = page.screenshot(type="jpeg", quality=92)
        proc.stdin.write(jpg)
        if f in qa_frames:
            qa_name = qa_frames[f]
            (OUT_DIR / f"qa_{slug}_{qa_name}.jpg").write_bytes(jpg)

    proc.stdin.close()
    ret = proc.wait()
    page.close()
    if ret != 0:
        raise RuntimeError(f"FFmpeg exited with {ret} for {slug}")
    mb = out_mp4.stat().st_size / (1024 * 1024)
    print(f"[RENDERED] {out_mp4.name} ({duration:.2f}s, {total_frames} frames, {mb:.2f} MB) in {time.time()-t0:.1f}s")


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path="/usr/bin/google-chrome",
            headless=True,
            args=["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
        )
        render_one(browser, "ig_pilot_v2", "20261126_IG_PRODUCT_ATHLETE-APP_REEL.mp4")
        render_one(browser, "tt_pilot_v2", "20261126_TT_HUMOR_WHATSAPP-CLIENTS_POV.mp4")
        browser.close()


if __name__ == "__main__":
    main()
