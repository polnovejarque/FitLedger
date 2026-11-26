#!/usr/bin/env python3
"""
FitLeader Social Studio — Permanent Cloud Publisher (GitHub Pages `gh-pages`)
Builds a standalone dark-mode Review Studio website with the rendered MP4s, QA posters,
1-click copyable scripts/captions, and deploys it to `https://polnovejarque.github.io/FitLedger/`
so no local server is ever needed.
"""

import json
import shutil
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

STUDIO_DIR = Path(__file__).resolve().parent
REPO_ROOT = STUDIO_DIR.parent.parent.parent
OUT_DIR = STUDIO_DIR / "out"
ASSETS_DIR = STUDIO_DIR / "assets"


def build_index_html(ig_meta: dict, tt_meta: dict, has_ig_frame: bool, has_tt_frame: bool) -> str:
    now_dt = datetime.now(timezone.utc)
    now_str = now_dt.strftime("%Y-%m-%d %H:%M UTC")
    ver = int(now_dt.timestamp())
    ig_voice_badge = "Vía B · Voz Humana Oficial" if ig_meta.get("voice_mode") == "official_via_b" else "Vía C · Pista Guía Temporal"
    tt_voice_badge = "Vía B · Voz Humana Oficial" if tt_meta.get("voice_mode") == "official_via_b" else "Vía C · Pista Guía Temporal"
    ig_frame_badge = "Frame Gemini Activo" if has_ig_frame else "Fondo Studio (Esperando Frame Gemini)"
    tt_frame_badge = "Frame Gemini Activo" if has_tt_frame else "Fondo Studio (Esperando Frame Gemini)"

    ig_script = "\n".join(b["text"] for b in ig_meta["beats"])
    tt_script = "\n".join(b["text"] for b in tt_meta["beats"])

    ig_caption = """Si trabajas como entrenador personal y todavía mandas rutinas en 1 PDF por WhatsApp, mira esta diferencia.

Con FitLeader tu cliente abre su propia app PWA con tu logo y tu marca. Ve exactamente qué entrena hoy, anota sus kilos y repeticiones, sigue su racha semanal y tiene todo su progreso en un solo sitio.

Puedes empezar gratis (y crear tu ficha gratuita en el marketplace para toda España) en fitleaderapp.com.

Comenta APP y te enseño cómo funciona por dentro.

#entrenadorpersonal #coachonline #negociofitness"""

    tt_caption = """Domingo 21:00 y tu WhatsApp parece la recepción de un gimnasio. ¿Cuál de los 3 mensajes te toca más cada semana: 1, 2 o 3? 👇

#entrenadorpersonal #coachonline #entrenadoronline #negociofitness"""

    return f"""<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FitLeader — Social Review Studio (24/7 Cloud)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    background: #070709;
    color: #f4f4f5;
    font-family: 'Inter', -apple-system, sans-serif;
    line-height: 1.5;
    padding: 32px 20px 80px;
  }}
  .wrap {{ max-width: 1180px; margin: 0 auto; }}
  .header {{
    display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center;
    gap: 16px; padding-bottom: 28px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 32px;
  }}
  .pill {{
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 800;
    background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.35); color: #34d399;
    text-transform: uppercase; letter-spacing: 0.08em;
  }}
  h1 {{ font-size: clamp(26px, 4vw, 38px); font-weight: 900; letter-spacing: -0.03em; margin-top: 8px; }}
  .sub {{ color: #a1a1aa; font-size: 14px; margin-top: 4px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px; }}
  .card {{
    background: #0f0f14; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px;
    padding: 24px; display: flex; flex-direction: column; gap: 18px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.55);
  }}
  .badges {{ display: flex; flex-wrap: wrap; gap: 8px; }}
  .badge {{
    font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 8px;
    background: rgba(255,255,255,0.06); color: #d4d4d8; border: 1px solid rgba(255,255,255,0.08);
  }}
  .badge-amber {{ background: rgba(245,158,11,0.14); color: #fbbf24; border-color: rgba(245,158,11,0.3); }}
  .badge-emerald {{ background: rgba(16,185,129,0.14); color: #34d399; border-color: rgba(16,185,129,0.3); }}
  .player-wrap {{
    width: 100%; max-width: 360px; margin: 0 auto; aspect-ratio: 9 / 16;
    background: #000; border-radius: 20px; overflow: hidden; border: 2px solid #27272a;
  }}
  video {{ width: 100%; height: 100%; object-fit: cover; display: block; }}
  .btn-row {{ display: flex; flex-wrap: wrap; gap: 10px; }}
  .btn {{
    flex: 1; min-width: 140px; text-align: center; text-decoration: none; cursor: pointer;
    padding: 12px 16px; border-radius: 12px; font-weight: 800; font-size: 13px; border: none;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }}
  .btn:hover {{ opacity: 0.92; transform: translateY(-1px); }}
  .btn-primary {{ background: linear-gradient(135deg, #10b981, #34d399); color: #04130d; }}
  .btn-sec {{ background: #18181f; color: #f4f4f5; border: 1px solid rgba(255,255,255,0.12); }}
  pre {{
    background: #08080b; border: 1px solid rgba(255,255,255,0.07); border-radius: 14px;
    padding: 14px; font-family: 'Inter', sans-serif; font-size: 13px; color: #d4d4d8;
    white-space: pre-wrap; max-height: 210px; overflow-y: auto;
  }}
  .label {{ font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 6px; }}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div>
      <span class="pill">● Cloud Studio Activo 24/7 · Sin Localhost</span>
      <h1>FitLeader — Review Studio (Pilotos v2 Framer Motion)</h1>
      <p class="sub">Último render sincronizado: {now_str} · Resolución nativa 1080×1920 H.264 + AAC</p>
    </div>
  </div>

  <div class="grid">
    <!-- PILOTO 1 IG -->
    <div class="card">
      <div>
        <div class="badges">
          <span class="badge badge-emerald">PILOTO 1 · INSTAGRAM REEL (BOFU)</span>
          <span class="badge badge-amber">{ig_voice_badge}</span>
          <span class="badge">{ig_frame_badge}</span>
        </div>
        <h2 style="font-size:21px;font-weight:900;margin-top:10px">App Atleta Marca Blanca vs PDF ({ig_meta['duration']:.1f}s)</h2>
      </div>

      <div class="player-wrap">
        <video controls playsinline preload="metadata" poster="qa_ig_pilot_v2_phone.jpg?v={ver}">
          <source src="20261126_IG_PRODUCT_ATHLETE-APP_REEL.mp4?v={ver}" type="video/mp4" />
        </video>
      </div>

      <div class="btn-row">
        <a class="btn btn-primary" href="20261126_IG_PRODUCT_ATHLETE-APP_REEL.mp4?v={ver}" download="20261126_IG_PRODUCT_ATHLETE-APP_REEL.mp4">⬇ Descargar MP4 (IG)</a>
        <button class="btn btn-sec" onclick="copyTxt('ig-script', this)">📋 Copiar Guion Vía B</button>
        <button class="btn btn-sec" onclick="copyTxt('ig-cap', this)">📋 Copiar Caption</button>
      </div>

      <div>
        <div class="label">Guion Locución Vía B (9 beats &lt; 3.5s)</div>
        <pre id="ig-script">{ig_script}</pre>
      </div>
      <div>
        <div class="label">Caption validado Instagram</div>
        <pre id="ig-cap">{ig_caption}</pre>
      </div>
    </div>

    <!-- PILOTO 2 TIKTOK -->
    <div class="card">
      <div>
        <div class="badges">
          <span class="badge badge-emerald">PILOTO 2 · TIKTOK POV (TOFU)</span>
          <span class="badge badge-amber">{tt_voice_badge}</span>
          <span class="badge">{tt_frame_badge}</span>
        </div>
        <h2 style="font-size:21px;font-weight:900;margin-top:10px">Domingo 21:00 · Caos WhatsApp ({tt_meta['duration']:.1f}s)</h2>
      </div>

      <div class="player-wrap">
        <video controls playsinline preload="metadata" poster="qa_tt_pilot_v2_mid.jpg?v={ver}">
          <source src="20261126_TT_HUMOR_WHATSAPP-CLIENTS_POV.mp4?v={ver}" type="video/mp4" />
        </video>
      </div>

      <div class="btn-row">
        <a class="btn btn-primary" href="20261126_TT_HUMOR_WHATSAPP-CLIENTS_POV.mp4?v={ver}" download="20261126_TT_HUMOR_WHATSAPP-CLIENTS_POV.mp4">⬇ Descargar MP4 (TikTok)</a>
        <button class="btn btn-sec" onclick="copyTxt('tt-script', this)">📋 Copiar Guion Vía B</button>
        <button class="btn btn-sec" onclick="copyTxt('tt-cap', this)">📋 Copiar Caption</button>
      </div>

      <div>
        <div class="label">Guion Locución Vía B (7 beats &lt; 3.5s)</div>
        <pre id="tt-script">{tt_script}</pre>
      </div>
      <div>
        <div class="label">Caption validado TikTok</div>
        <pre id="tt-cap">{tt_caption}</pre>
      </div>
    </div>
  </div>
</div>

<script>
function copyTxt(id, btn) {{
  const txt = document.getElementById(id).innerText;
  navigator.clipboard.writeText(txt);
  const old = btn.innerText;
  btn.innerText = '✓ Copiado';
  setTimeout(() => btn.innerText = old, 1600);
}}
</script>
</body>
</html>
"""


def main():
    ig_meta = json.loads((OUT_DIR / "ig_pilot_v2_timings.json").read_text(encoding="utf-8"))
    tt_meta = json.loads((OUT_DIR / "tt_pilot_v2_timings.json").read_text(encoding="utf-8"))
    has_ig_frame = any((ASSETS_DIR / f"frame_ig_hook{e}").exists() for e in (".png", ".jpg", ".jpeg", ".webp"))
    has_tt_frame = any((ASSETS_DIR / f"frame_tt_hook{e}").exists() for e in (".png", ".jpg", ".jpeg", ".webp"))

    remote_url = subprocess.check_output(
        ["git", "-C", str(REPO_ROOT), "remote", "get-url", "origin"], text=True
    ).strip()

    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        (tmp_path / ".nojekyll").write_text("", encoding="utf-8")
        (tmp_path / "index.html").write_text(
            build_index_html(ig_meta, tt_meta, has_ig_frame, has_tt_frame), encoding="utf-8"
        )

        files_to_copy = [
            "20261126_IG_PRODUCT_ATHLETE-APP_REEL.mp4",
            "20261126_TT_HUMOR_WHATSAPP-CLIENTS_POV.mp4",
            "qa_ig_pilot_v2_cover.jpg",
            "qa_ig_pilot_v2_phone.jpg",
            "qa_ig_pilot_v2_mid.jpg",
            "qa_ig_pilot_v2_cta.jpg",
            "qa_tt_pilot_v2_cover.jpg",
            "qa_tt_pilot_v2_mid.jpg",
            "qa_tt_pilot_v2_cta.jpg",
        ]
        for fname in files_to_copy:
            src = OUT_DIR / fname
            if src.exists():
                shutil.copy2(src, tmp_path / fname)

        subprocess.run(["git", "init", "-b", "gh-pages"], cwd=tmp_path, check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "config", "user.name", "FitLeader Studio Bot"], cwd=tmp_path, check=True)
        subprocess.run(["git", "config", "user.email", "studio@fitleaderapp.com"], cwd=tmp_path, check=True)
        subprocess.run(["git", "add", "."], cwd=tmp_path, check=True)
        subprocess.run(["git", "commit", "-m", "chore: publish FitLeader Social Review Studio MP4s"], cwd=tmp_path, check=True, stdout=subprocess.DEVNULL)
        subprocess.run(["git", "remote", "add", "origin", remote_url], cwd=tmp_path, check=True)
        subprocess.run(["git", "push", "--force", "origin", "gh-pages"], cwd=tmp_path, check=True)

    # Ensure GitHub Pages is enabled on gh-pages branch
    has_pages = subprocess.check_output(
        ["gh", "api", "repos/polnovejarque/FitLedger", "--jq", ".has_pages"], text=True
    ).strip()
    if has_pages != "true":
        subprocess.run(
            [
                "gh",
                "api",
                "-X",
                "POST",
                "repos/polnovejarque/FitLedger/pages",
                "-f",
                "source[branch]=gh-pages",
                "-f",
                "source[path]=/",
            ],
            check=False,
        )
    print("[PUBLISHED] https://polnovejarque.github.io/FitLedger/")


if __name__ == "__main__":
    main()
