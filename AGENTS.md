# AGENTS.md — Memoria Persistente del Proyecto FitLeader (`polnovejarque/FitLedger`)

> **LECTURA OBLIGATORIA AL INICIAR CUALQUIER CONVERSACIÓN (LOCAL O REMOTA):**
> Para no perder **jamás** el hilo entre ordenadores o sesiones, **lee siempre primero**:
> 1. [`docs/PRODUCT_STATE.md`](docs/PRODUCT_STATE.md) — **Estado técnico en vivo del SaaS**, alertas de seguridad/RLS pendientes, integración Wearables (Google Health / Fitbit Versa), skills y roadmap técnico activo.
> 2. [`docs/social-media/STATE.md`](docs/social-media/STATE.md) — **Estado en vivo de la Estrategia de Redes Sociales**, últimos acuerdos, guiones aprobados, estado de audios/frames, calendario de 15 días y URL pública permanente del visor de vídeos.
> 3. [`docs/social-media/DRIVE_METRICOOL_WORKFLOW.md`](docs/social-media/DRIVE_METRICOOL_WORKFLOW.md) — Estructura oficial de carpetas multimedia en Google Drive (`FitLeader_Content/`) y flujo de publicación en Metricool.

## Arquitectura Oficial de Trabajo (3 Capas)
- **Modo principal en el portátil (`ASUS Vivobook S14 ARM64`):** trabajar en **Local** (`C:\Users\polno\Desktop\FITLEADER\FitLedger`) y hacer `git push` al cerrar el bloque o el día. En movilidad / otro dispositivo, trabajar en **Remoto** (lee automáticamente este repo y, si está conectado el plugin `gdrive`, accede también a `FitLeader_Content/`).
- **Capa 1 · GitHub (`master`):** Cerebro y código ligero (`src/`, `api/`, `supabase/`, `AGENTS.md`, `docs/PRODUCT_STATE.md`, `docs/social-media/`). **Nunca** subir `.mp4`/`.mov`/audios pesados a `master` ni secretos (`.env`, `google-health-credentials.json`, listas privadas de prospección — el repo es público).
- **Capa 2 · Google Drive (`FitLeader_Content/`):** Almacén multimedia pesado (grabaciones crudas, audios Vía B, frames de Gemini, MP4 finales en `04_LISTO_METRICOOL/`).
- **Capa 3 · Metricool:** Importa vídeos directamente desde `FitLeader_Content/04_LISTO_METRICOOL/` en Drive + captions desde `STATE.md` / `export_metricool_csv.py`.

## Entorno Local del Fundador (ASUS Vivobook S14 `S3407QA`, Snapdragon X ARM64)
- **Windows 11 Home ARM64:** Node `24.x` (`arm64`), Python `3.12` (`arm64`), Git, `gh`, FFmpeg, Docker Desktop. La app SaaS (`npm run dev` / `npm run build` con Vite 7 + React 19 + Framer Motion 12) corre 100 % nativa en Windows ARM64.
- **Ubuntu WSL 2 (`aarch64`, usuario `polno`, ruta `/mnt/c/Users/polno/Desktop/FITLEADER/FitLedger`):** Node `24.x`, Python `3.14`, FFmpeg y librerías de Chromium ya instaladas. **Ejecutar siempre Playwright, Remotion y renders de vídeo dentro de WSL 2** (`@remotion/compositor-linux-arm64-gnu`, códec `--codec h264`; Remotion no tiene compositor para Windows ARM64 y `av1` no está disponible en Linux ARM64).

## Regla de Oro de Sincronización Continua (Cross-Device)
1. **Al empezar cualquier tarea (producto o redes):** lee `docs/PRODUCT_STATE.md` y `docs/social-media/STATE.md` antes de preguntar nada al usuario.
2. **Al terminar cualquier avance importante:**
   - Actualiza `docs/PRODUCT_STATE.md` (si fue código/infra/roadmap) y/o `docs/social-media/STATE.md` (si fue guiones, audios Vía B, frames, renders o calendario).
   - Haz `git add` + `git commit` + `git push` para que mañana, desde cualquier ordenador o conversación nueva, el agente tenga el 100 % de la memoria al segundo.
   - Si se han regenerado vídeos MP4 en `docs/social-media/studio/`, ejecuta `python3 docs/social-media/studio/publish_pages.py` para publicarlos automáticamente en `https://polnovejarque.github.io/FitLedger/` (rama huérfana `gh-pages`), **sin depender de servidores `localhost`**.

## Resumen Rápido del Producto (FitLeader)
- **Qué es:** Ecosistema híbrido Fitness en España (`fitleaderapp.com`) que une **Software SaaS de gestión para entrenadores/centros** + **App móvil nativa/PWA Marca Blanca para atletas** + **Marketplace B2C/B2B (ficha gratuita de coaches en España y alquiler de salas por horas)**.
- **Estética de marca:** Dark mode `#070709` / `#0c0c0c`, acento principal verde esmeralda `#10b981` / `#34d399`, tipografía `Inter` + `JetBrains Mono`, estilo visual limpio tipo Apple / Linear / Framer Motion.

