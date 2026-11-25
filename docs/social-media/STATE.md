# Estado Vivo — Estrategia de Redes Sociales FitLeader

**Última actualización:** 2026-11-25  
**URL Permanente Review Studio (24/7, sin servidor local):** `https://polnovejarque.github.io/FitLedger/`  
**Motor de Renderizado en Repo:** `docs/social-media/studio/` (`generate_audio.py` + `stage.html` + `render_videos.py` + `publish_pages.py`)

---

## 1. Última Conversación y Estado Actual (Lo último hablado)

1. **Memoria persistente activada:** El usuario pidió que cualquier conversación futura (incluso desde otro ordenador) lea siempre lo último hablado sin perder contexto aunque falle un chat. Todo vive sincronizado en GitHub (`AGENTS.md` + `docs/social-media/STATE.md` + skill global `fitleader-social`).
2. **Visor permanente sin `localhost`:** El usuario no quiere depender de servidores locales que se apagan. Todos los vídeos MP4 y guiones se publican automáticamente en la rama `gh-pages` (`https://polnovejarque.github.io/FitLedger/`).
3. **Voz humana (Doble vía en marcha):**
   - **Vía C (Ejecutada):** Se han renderizado los 2 pilotos (`1080×1920`, `30fps` deterministas con físicas reales estilo Framer Motion) con pista guía troceada por *beats*, ajuste prosódico por frase, efectos de sonido UI sutiles y cama ambiental cálida.
   - **Vía B (En curso por el usuario):** El usuario está generando los **audios oficiales con voz humana natural** (Google AI Studio / Gemini Speech / ElevenLabs) usando los guiones v2 validados. En cuanto los pase, se guardan en `docs/social-media/studio/assets/official_voice_ig.mp3` (o `.wav`) y `official_voice_tt.mp3`, y se relanza el pipeline para actualizar los MP4 en la web pública.
4. **Frames fotorrealistas de Gemini (Listos para revisar e inyectar):**
   - El usuario **ya tiene hechos los frames realistas** y nos va a indicar dónde están para revisarlos, comprobar cómo han quedado, corregir o pedir alguno más específico si hace falta, e inyectarlos en `docs/social-media/studio/assets/frame_ig_hook.png` y `frame_tt_hook.png`.
5. **Grabaciones reales del software FitLeader (Pendientes cuando el usuario quiera grabarlas):**
   - App Atleta PWA en móvil (`ClientHome` → `WorkoutPlayer` → marcar series `100kg x 8 ✓` → racha `🔥 12`).
   - `WorkoutEditor` creando rutina con vídeo y Carga/RPE (D8/D6).
   - Check-in fotográfico 3 pasos (D10), Agenda con buffer 10 min (D11), Marketplace + Salas B2B (D13), Dashboard + Chat modo oscuro (D1/D15).

---

## 2. Guiones v2 Oficiales (Validados con `beats.py` + `/ig-human`, < 3.6 s por plano)

### Piloto 1 · Instagram BOFU (`20261126_IG_PRODUCT_ATHLETE-APP_REEL`)
**Texto para locución Vía B (con intención natural):**
```text
¿Cobras ochenta euros al mes, y sigues mandando un PDF?
Normal que a los quince días nadie lo abra.
Mira el cambio cuando entran en tu propia app, con tu logo.
Abren la sesión de hoy con su vídeo listo.
Anotan cien kilos por ocho en sentadilla.
Suman doce días seguidos en racha.
Y a ti te salta al segundo en tu panel de entrenador.
Cero Excels rotos. Cero audios eternos.
Comenta APP y empieza gratis hoy en FitLeader.
```

**Caption Instagram:**
```text
Si trabajas como entrenador personal y todavía mandas rutinas en 1 PDF por WhatsApp, mira esta diferencia.

Con FitLeader tu cliente abre su propia app PWA con tu logo y tu marca. Ve exactamente qué entrena hoy, anota sus kilos y repeticiones, sigue su racha semanal y tiene todo su progreso en un solo sitio.

Puedes empezar gratis (y crear tu ficha gratuita en el marketplace para toda España) en fitleaderapp.com.

Comenta APP y te enseño cómo funciona por dentro.

#entrenadorpersonal #coachonline #negociofitness
```

---

### Piloto 2 · TikTok POV TOFU (`20261126_TT_HUMOR_WHATSAPP-CLIENTS_POV`)
**Texto para locución Vía B (tono domingo noche resignado → giro firme → pregunta cercana):**
```text
Domingo, nueve de la noche. Abres WhatsApp.
Un audio de cuatro minutos para cambiar las sentadillas.
Dos fotos de check-in mezcladas con el grupo de tu madre.
Y el clásico: oye, ¿te llegó ya mi Bizum?
Tu problema no es tener treinta clientes.
Es llevar todo tu negocio metido en WhatsApp.
Dime la verdad, ¿cuál de los tres te cae cada domingo?
```

**Caption TikTok:**
```text
Domingo 21:00 y tu WhatsApp parece la recepción de un gimnasio. ¿Cuál de los 3 mensajes te toca más cada semana: 1, 2 o 3? 👇

#entrenadorpersonal #coachonline #entrenadoronline #negociofitness
```

---

## 3. Cómo Re-renderizar y Publicar en 1 Comando

```bash
# 1. (Opcional) Colocar nuevos assets en docs/social-media/studio/assets/:
#    - frame_ig_hook.png / .jpg   (Frame realista Gemini para Piloto IG)
#    - frame_tt_hook.png / .jpg   (Frame realista Gemini para Piloto TikTok)
#    - official_voice_ig.mp3/.wav (Voz humana Vía B para Piloto IG)
#    - official_voice_tt.mp3/.wav (Voz humana Vía B para Piloto TikTok)

# 2. Generar audio + timings, renderizar MP4 1080x1920 y publicar en GitHub Pages:
python3 docs/social-media/studio/generate_audio.py && \
python3 docs/social-media/studio/render_videos.py && \
python3 docs/social-media/studio/publish_pages.py
```

---

## 4. Calendario Operativo de 15 Días (IG & TikTok Separados)

| Día | Instagram | TikTok | Etapa | Estado |
| :---: | :--- | :--- | :---: | :--- |
| **D1** | Reel: *"Tu WhatsApp no puede ser tu CRM"* + Stories encuesta | **PILOTO TT:** POV 30 chats de clientes en WhatsApp | TOFU | Piloto TT renderizado (Vía C lista, esperando Vía B + Frame) |
| **D2** | Carrusel (8 slides): 5 tareas que devoran el día de un coach | Lista cinética: 4 tipos de clientes | TOFU/MOFU | Pendiente |
| **D3** | **PILOTO IG:** Reel App Marca Blanca PWA real | Micro-demo: lo que ve tu cliente sin PDFs | BOFU | Piloto IG renderizado (Vía C lista, esperando Vía B + Frame) |
| **D4** | Reel educativo: estructura de check-in en 4 bloques | Respuesta: *"¿Qué preguntas hacer en un check-in?"* | MOFU | Pendiente |
| **D5** | Carrusel: Facturación vs. beneficio real | Calculadora animada 30 × 80 € *(con disclaimer)* | MOFU | Pendiente |
| **D6** | Reel Caos vs Sistema: Excel roto vs FitLeader | POV: abrir tu Excel desde el móvil en el gym | TOFU/BOFU | Pendiente |
| **D7** | Stories Q&A + mini demo | Storytime: una semana de administración sin sistema | MOFU | Pendiente |
| **D8** | Reel: crear y asignar rutina con vídeos y Carga/RPE | Tutorial 18 s: organiza una rutina sin 40 pestañas | BOFU | Pendiente grabación `WorkoutEditor` |
| **D9** | Carrusel: onboarding de cliente nuevo | 3 errores al empezar con un cliente | MOFU | Pendiente |
| **D10** | Reel: check-in fotográfico 3 pasos | De perseguir fotos a tener un flujo ordenado | BOFU | Pendiente grabación Check-in |
| **D11** | Reel: agenda + buffer automático de 10 min | POV: 6 citas seguidas sin descanso | TOFU/BOFU | Pendiente grabación `Agenda` |
| **D12** | Carrusel Studios: gestionar equipo y salas | *"Tienes horas muertas en tu studio cada día"* | MOFU | Pendiente |
| **D13** | Reel Marketplace: ficha gratis toda España + salas B2B | Coach freelance sin local fijo: salas por horas | MOFU/BOFU | Pendiente grabación `Marketplace` |
| **D14** | Reel App Atleta: racha "On Fire" y objetivo 3/4 | El detalle visual que ayuda a no fallar | BOFU | Pendiente |
| **D15** | Reel Tour 30 s FitLeader + CTA *"Comenta DEMO"* | Tour rápido 20 s: sistema para coaches en España | BOFU | Pendiente |
