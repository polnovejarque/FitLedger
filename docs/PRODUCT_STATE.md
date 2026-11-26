# Estado Vivo del Producto y Roadmap Técnico — FitLeader

**Última actualización:** 2026-11-26  
**Repositorio:** `polnovejarque/FitLedger` (`master`, último hito SaaS `a490476` + estudio social `cc65595`)  
**Producción:** `https://fitleaderapp.com` (Vercel + Supabase + Stripe + Google Health/Fitbit `fitleader-2`)

---

## 1. En qué punto está el SaaS (Últimos hitos cerrados)
- ✅ **Login de atletas y perfil (5 nov 2026):** RPCs `SECURITY DEFINER` (`client_app_login` y `get_athlete_profile`) en `supabase/migrations/20261105_fix_athlete_login_rls.sql`.
- ✅ **Borrado en cascada de atletas (30 oct 2026):** Eliminación completa en todas las tablas + `auth.users` y limpieza previa de cuentas huérfanas (`supabase/migrations/20261030_cascade_delete_client_auth.sql`).
- ✅ **Integración Google Fitbit Versa (24 oct 2026):** OAuth PKCE + función serverless `api/fitbit-token.ts` + tablas `client_wearables` y `client_biometrics_daily` + tarjetas de biometría en `ClientProfile.tsx` y `ClientWorkout.tsx`.
- ✅ **Logo marca blanca y Storage (24 oct 2026):** `supabase/migrations/20261024_storage_buckets.sql` + subida desde `Settings.tsx`.
- ✅ **Check-ins con fotos en 3 pasos y tracking de Carga (ago–oct 2026):** Renombrado `RIR` → `Carga` y fixes de `workout_results`.

---

## 2. Pendientes Inmediatos de Entorno (Al abrir en local en el ASUS Vivobook S14)
- [ ] **Git / GitHub local:** ejecutar `git config --global user.name`, `git config --global user.email` y `gh auth login`, luego `git pull origin master` en `C:\Users\polno\Desktop\FITLEADER\FitLedger`.
- [ ] **Conectar Google Drive:**
  - Crear la estructura `FitLeader_Content/` en Google Drive (ver `docs/social-media/DRIVE_METRICOOL_WORKFLOW.md`).
  - Sincronizar con Google Drive Desktop en el portátil + conectar el plugin **Google Drive** en Antigravity (para acceso también desde remoto).
- [ ] **Conectar Metricool:** vincular la cuenta de Google Drive en Metricool para importar vídeos desde `FitLeader_Content/04_LISTO_METRICOOL/` y usar el CSV generado por `docs/social-media/studio/export_metricool_csv.py`.
- [ ] **Entregar assets pendientes de redes (Vía B):** audios humanos (`official_voice_ig.mp3`, `official_voice_tt.mp3`) y frames de Gemini (`frame_ig_hook.png`, `frame_tt_hook.png`) en `02_VOZ_HUMANA/` y `03_FRAMES_GEMINI/` (ver `docs/social-media/STATE.md`).

---

## 3. Roadmap Técnico Activo (Ejecutar paso a paso)

### Fase 1 — Seguridad sin romper accesos de atletas ni coaches (PRIORIDAD ALTA)
> **Regla crítica:** Cualquier cambio de RLS debe ser incremental, reversible y verificado para NO romper el login directo de atletas (`client_app_login`), la carga de `ClientWorkout`, la gestión de clientes por coaches/staff ni las reservas públicas en `DropinLanding.tsx` (`/join/:eventId`).

- [ ] **1.1 Sacar `VITE_FITBIT_CLIENT_SECRET` del frontend (0 % riesgo)**
  - Eliminar `getClientSecret()` y el envío de `client_secret` desde el navegador en `src/services/fitbitService.ts`.
  - En `api/fitbit-token.ts`, leer `process.env.FITBIT_CLIENT_SECRET || process.env.VITE_FITBIT_CLIENT_SECRET` (compatibilidad hacia atrás mientras se renombra la variable en Vercel).
- [ ] **1.2 Endurecer RLS de `clients` sin romper ningún flujo**
  - Migrar el flujo anónimo de `src/pages/DropinLanding.tsx` a una RPC `SECURITY DEFINER` (`book_dropin_class`) para que no dependa de `SELECT/INSERT` público directo en `clients`.
  - Sustituir `USING (true)` para `anon` por políticas acotadas a coaches/staff autenticados (`user_id = auth.uid()` / `studio_id`) y al atleta autenticado, manteniendo `client_app_login` y `get_athlete_profile` operativos.
  - Incluir script SQL de rollback en la migración.
- [ ] **1.3 Proteger `client_wearables` y `client_biometrics_daily`**
  - Sustituir `FOR ALL USING (true)` por políticas acotadas al coach propietario + RPCs seguras para el atleta, evitando exponer `access_token` / `refresh_token`.

### Fase 2 — Validación E2E de Wearables (Google Health / Fitbit Versa)
- [ ] **2.1 Alinear proveedor de datos en `fitbitService.ts`**
  - Verificar si la sincronización real va contra **Google Health API** (`fitleader-2`) o **Fitbit Web API** y mover los fetches de métricas a un endpoint serverless (`/api/fitbit-sync`) para evitar CORS y exposición de tokens.
- [ ] **2.2 Sync multi-día (últimos 7 días)**
  - Traer histórico reciente para poblar gráficas de sueño, RHR, HRV y pasos desde el día 1.

### Fase 3 — Prospección B2B (Harvey / Sellbird)
- [ ] **3.1 Instalar y configurar Harvey / Sellbird (`ethanplusai/sellbird`)**
  - Las 13 skills de Instagram (`ig-viral`, `ig-reel`, `ig-caption`, `ig-human`, etc.) + `fitleader-social` ya están activas en Antigravity.
  - Falta instalar **Harvey / Sellbird** para prospección de entrenadores personales y estudios boutique en España (guardar listas de leads en Google Drive o repo privado, nunca en el repo público `FitLedger`).

### Fase 4 — Deuda Técnica (Backlog)
- [ ] Dividir pantallas monolíticas (`ClientWorkout.tsx` ~2.500 líneas, `LandingPage.tsx` ~2.200, `ClientProfile.tsx` ~2.000).
- [ ] Limpiar vistas legacy sin enrutar en `src/pages/client/` (`ClientHome.tsx`, `ClientProgress.tsx`, `WorkoutPlayer.tsx`, `WorkoutSummary.tsx`) y `check_profiles.js`.
