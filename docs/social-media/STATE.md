# Estado Vivo — Estrategia de Redes Sociales FitLeader

**Última actualización:** 2026-11-26  
**URL Permanente Review Studio (24/7, sin servidor local):** `https://polnovejarque.github.io/FitLedger/`  
**Motor de Renderizado en Repo:** `docs/social-media/studio/` (`generate_audio.py` + `stage.html` + `render_videos.py` + `publish_pages.py`)

---

## 1. Última Conversación y Estado Actual (Lo último hablado)

1. **Corrección visual aplicada (Centrado 100% + Silueta exacta iPhone Web):**
   - Toda la composición `1080×1920` (cabecera cinética, tarjetas, iPhone, Dashboard Coach, encuestas y subtítulos) queda **100% centrada simétricamente en `x = 540px`** (antes quedaba desplazada a la izquierda por reservar margen extra al rail derecho).
   - El mockup del teléfono se ha sustituido por una **réplica 1:1 del iPhone de `LandingPage.tsx`** (`aspect-ratio: 9/19.5`, chasis `#000` con borde `#27272a` redondeado `78px`, *Dynamic Island* real con doble lente sin texto dentro, logo oficial `public/logo.png` + `FitLeader`, pantalla *Hola, Campeón 👋*, *Objetivo Semanal 3/4*, *Tip del Día*, *Próxima sesión*, botón flotante verde de chat y barra inferior de 5 iconos con el círculo central `🔥`).
2. **Memoria persistente activada:** Todo vive sincronizado en GitHub (`AGENTS.md` + `docs/social-media/STATE.md` + skill global `fitleader-social`).
3. **Visor permanente sin `localhost`:** Publicado automáticamente en la rama `gh-pages` (`https://polnovejarque.github.io/FitLedger/`) con `?v={timestamp}` anti-caché.
4. **Voz humana (Doble vía en marcha):**
   - **Vía C (Ejecutada):** 2 pilotos renderizados en `1080×1920` con pista guía por *beats* y efectos UI.
   - **Vía B (Pendiente de recibir del usuario):** En cuanto pase los audios oficiales humanos, se colocan en `docs/social-media/studio/assets/official_voice_ig.mp3` y `official_voice_tt.mp3` y se relanza el render.
5. **Frames fotorrealistas de Gemini + Grabaciones reales:**
   - Pendiente de que el usuario nos pase los frames de Gemini y/o grabaciones de pantalla para inyectarlos en `docs/social-media/studio/assets/`.

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
