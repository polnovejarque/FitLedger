# AGENTS.md — Memoria Persistente del Proyecto FitLeader (`polnovejarque/FitLedger`)

> **LECTURA OBLIGATORIA AL INICIAR CUALQUIER CONVERSACIÓN:**
> Cada conversación corre en una máquina virtual nueva clonada desde GitHub. Para no perder **jamás** el hilo entre ordenadores o sesiones, **lee siempre primero**:
> - [`docs/social-media/STATE.md`](docs/social-media/STATE.md) — **Estado en vivo de la Estrategia de Redes Sociales**, últimos acuerdos con el usuario, guiones aprobados, estado de audios/frames, calendario de 15 días y URL pública permanente del visor de vídeos.

## Regla de Oro de Sincronización Continua (Cross-Device)
1. **Al empezar una tarea de redes/contenido o producto:** lee `docs/social-media/STATE.md` antes de preguntar nada al usuario para saber exactamente qué fue lo último que se habló e hizo.
2. **Al terminar cualquier avance importante (nuevos guiones, audios Vía B integrados, frames de Gemini añadidos, vídeos renderizados o ajustes de estrategia):**
   - Actualiza la sección `Última Actualización y Contexto Reciente` de `docs/social-media/STATE.md`.
   - Haz `git add AGENTS.md docs/social-media/ && git commit && git push origin master` para que mañana, desde cualquier otro ordenador o conversación nueva, el agente tenga el 100% de la memoria al segundo.
   - Si se han regenerado vídeos MP4 en `docs/social-media/studio/`, ejecuta `python3 docs/social-media/studio/publish_pages.py` para publicarlos automáticamente en la web pública permanente (`https://polnovejarque.github.io/FitLedger/`), **sin depender de servidores `localhost`**.

## Resumen Rápido del Producto (FitLeader)
- **Qué es:** Ecosistema híbrido Fitness en España (`fitleaderapp.com`) que une **Software SaaS de gestión para entrenadores/centros** + **App móvil nativa/PWA Marca Blanca para atletas** + **Marketplace B2C/B2B (ficha gratuita de coaches en España y alquiler de salas por horas)**.
- **Estética de marca:** Dark mode `#070709` / `#0c0c0c`, acento principal verde esmeralda `#10b981` / `#34d399`, tipografía `Inter` + `JetBrains Mono`, estilo visual limpio tipo Apple / Linear / Framer Motion.
