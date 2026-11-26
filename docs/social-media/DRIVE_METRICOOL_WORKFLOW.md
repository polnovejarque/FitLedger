# Flujo Oficial: Google Drive + Local + GitHub + Metricool

Este documento define **exactamente** cómo conviven tus carpetas de contenido multimedia en **Google Drive**, tu repositorio de **GitHub**, tu portátil local (**ASUS Vivobook S14 ARM64 + WSL 2**) y **Metricool** sin duplicar archivos ni engordar Git.

---

## 1. Estructura de carpetas en Google Drive (`FitLeader_Content/`)

Crea esta carpeta raíz en tu Google Drive (y sincronízala en tu portátil con **Google Drive for Desktop**, por ejemplo en `G:\Mi unidad\FitLeader_Content\`):

```text
FitLeader_Content/
├── 01_RAW_CAPTURES/          # Grabaciones crudas de pantalla del SaaS (Playwright) y B-roll de móvil
│   ├── WorkoutEditor/        # Para D8
│   ├── CheckIn/              # Para D10
│   ├── Agenda/               # Para D11
│   └── Marketplace/          # Para D13
├── 02_VOZ_HUMANA/            # Audios Vía B grabados con tu voz (official_voice_ig.mp3, official_voice_tt.mp3...)
├── 03_FRAMES_GEMINI/         # Frames fotorrealistas 9:16 (frame_ig_hook.png, frame_tt_hook.png...)
├── 04_LISTO_METRICOOL/       # ÚNICA carpeta que conectas/importas en Metricool
│   ├── Instagram/            # MP4 1080x1920 + carruseles PNG nombrados YYYYMMDD_IG_TEMA.mp4
│   └── TikTok/               # MP4 1080x1920 nombrados YYYYMMDD_TT_TEMA.mp4
└── 05_PUBLICADO_ARCHIVO/     # Mueve aquí lo que ya se haya publicado (2026-11/, 2026-12/...)
```

> **Convención de nombres (obligatoria para no perderse):**
> `YYYYMMDD_PLATAFORMA_ETAPA_TEMA_FORMATO.ext`
> Ejemplo: `20261126_IG_BOFU_ATHLETE-APP_REEL.mp4`

---

## 2. Cómo conectar las 4 piezas (paso a paso, 1 sola vez)

1. **Google Drive Desktop (en tu ASUS Vivobook):**
   - Instala Google Drive para ordenador y activa acceso a `FitLeader_Content/`.
2. **Plugin Google Drive en Antigravity:**
   - En Antigravity → **Customizations → Google Drive**, conecta tu cuenta. Así cualquier conversación (local o remota) podrá leer/organizar `FitLeader_Content/`.
3. **Metricool:**
   - En Metricool → **Planificación → Crear publicación → Añadir vídeo/imagen → Google Drive**, autoriza tu cuenta y apunta a `FitLeader_Content/04_LISTO_METRICOOL/`.
   - Para programar 15 días de golpe: ejecuta `python3 docs/social-media/studio/export_metricool_csv.py` (genera `docs/social-media/studio/out/metricool_import.csv`) e impórtalo en **Metricool → Planificación → Importar CSV**.

---

## 3. Rutina diaria de trabajo (sin fricción)

1. **Al abrir el portátil (en local):**
   ```bash
   cd C:\Users\polno\Desktop\FITLEADER\FitLedger
   git pull origin master
   ```
2. **Crear / renderizar contenido (en Ubuntu WSL 2):**
   - Copia los audios/frames nuevos desde Drive (`02_VOZ_HUMANA/`, `03_FRAMES_GEMINI/`) a `docs/social-media/studio/assets/` (carpeta temporal de render).
   - Renderiza y publica preview en GitHub Pages:
     ```bash
     python3 docs/social-media/studio/generate_audio.py && \
     python3 docs/social-media/studio/render_videos.py && \
     python3 docs/social-media/studio/publish_pages.py
     ```
   - Copia los `.mp4` finales aprobados desde `docs/social-media/studio/out/` a **`FitLeader_Content/04_LISTO_METRICOOL/`** en Google Drive.
3. **Al terminar el día (cierre en 5 segundos):**
   - Actualiza `docs/social-media/STATE.md` y/o `docs/PRODUCT_STATE.md`.
   - Sube el estado a GitHub:
     ```bash
     git add AGENTS.md docs/
     git commit -m "chore: sync daily state"
     git push origin master
     ```
   - Así mañana, abras desde tu portátil o desde **Antigravity Remoto** en cualquier otro dispositivo, el agente tendrá el 100 % del contexto al segundo.
