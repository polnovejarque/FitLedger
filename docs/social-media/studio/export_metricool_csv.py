#!/usr/bin/env python3
"""
Exportador de calendario y captions de FitLeader a CSV compatible con Metricool (Importar CSV).

Uso:
  python3 docs/social-media/studio/export_metricool_csv.py --start-date 2026-11-27
  python3 docs/social-media/studio/export_metricool_csv.py --dry-run

Salida por defecto:
  docs/social-media/studio/out/metricool_import.csv
  (Carpeta ignorada por Git; sube o abre el CSV directo en Metricool -> Planificación -> Importar CSV)
"""

from __future__ import annotations

import argparse
import csv
from datetime import date, timedelta
from pathlib import Path

STUDIO_DIR = Path(__file__).resolve().parent
OUT_FILE = STUDIO_DIR / "out" / "metricool_import.csv"

# Columnas oficiales del importador masivo de Metricool
METRICOOL_HEADERS = [
    "Text",
    "Date",
    "Time",
    "Draft",
    "Instagram",
    "TikTok",
    "Picture Url 1",
    "Document title",
]

# Piezas piloto listas con captions oficiales de docs/social-media/STATE.md
POSTS = [
    {
        "day_offset": 0,
        "time": "19:30",
        "instagram": "false",
        "tiktok": "true",
        "title": "20261126_TT_HUMOR_WHATSAPP-CLIENTS_POV",
        "text": (
            "Domingo 21:00 y tu WhatsApp parece la recepción de un gimnasio. "
            "¿Cuál de los 3 mensajes te toca más cada semana: 1, 2 o 3? 👇\n\n"
            "#entrenadorpersonal #coachonline #entrenadoronline #negociofitness"
        ),
        "media_url": "",  # Opcional: pegar enlace directo o adjuntar desde Drive 04_LISTO_METRICOOL/TikTok/
    },
    {
        "day_offset": 2,
        "time": "19:00",
        "instagram": "true",
        "tiktok": "false",
        "title": "20261126_IG_PRODUCT_ATHLETE-APP_REEL",
        "text": (
            "Si trabajas como entrenador personal y todavía mandas rutinas en 1 PDF por WhatsApp, mira esta diferencia.\n\n"
            "Con FitLeader tu cliente abre su propia app PWA con tu logo y tu marca. "
            "Ve exactamente qué entrena hoy, anota sus kilos y repeticiones, sigue su racha semanal y tiene todo su progreso en un solo sitio.\n\n"
            "Puedes empezar gratis (y crear tu ficha gratuita en el marketplace para toda España) en fitleaderapp.com.\n\n"
            "Comenta APP y te enseño cómo funciona por dentro.\n\n"
            "#entrenadorpersonal #coachonline #negociofitness"
        ),
        "media_url": "",  # Opcional: adjuntar desde Drive 04_LISTO_METRICOOL/Instagram/
    },
]


def main() -> None:
    parser = argparse.ArgumentParser(description="Export FitLeader social calendar to Metricool CSV.")
    parser.add_argument(
        "--start-date",
        default=date.today().isoformat(),
        help="Fecha de inicio (YYYY-MM-DD) para el Día 1 del calendario.",
    )
    parser.add_argument(
        "--output",
        default=str(OUT_FILE),
        help="Ruta de salida del CSV.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Solo valida y muestra las filas por consola sin escribir archivo.",
    )
    args = parser.parse_args()

    start = date.fromisoformat(args.start_date)
    rows = []
    for post in POSTS:
        post_date = (start + timedelta(days=post["day_offset"])).isoformat()
        rows.append(
            {
                "Text": post["text"],
                "Date": post_date,
                "Time": post["time"],
                "Draft": "true",  # Siempre como borrador en Metricool hasta adjuntar el MP4 de Drive y revisar
                "Instagram": post["instagram"],
                "TikTok": post["tiktok"],
                "Picture Url 1": post["media_url"],
                "Document title": post["title"],
            }
        )

    if args.dry_run:
        print(f"[DRY-RUN] {len(rows)} publicaciones válidas para Metricool (inicio {start.isoformat()}):")
        for row in rows:
            print(f"  - {row['Date']} {row['Time']} | IG={row['Instagram']} TT={row['TikTok']} | {row['Document title']}")
        return

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=METRICOOL_HEADERS)
        writer.writeheader()
        writer.writerows(rows)

    print(f"CSV de Metricool generado correctamente: {out_path} ({len(rows)} borradores)")


if __name__ == "__main__":
    main()
