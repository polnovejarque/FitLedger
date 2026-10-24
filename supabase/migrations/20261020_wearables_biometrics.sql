-- ==============================================================================
-- FITLEADER - MIGRACIÓN PARA INTEGRACIÓN DE WEARABLES (FITBIT & WHOOP) Y BIOMETRÍA
-- ==============================================================================

-- 1. Tabla de conexiones OAuth de wearables por cliente / atleta
CREATE TABLE IF NOT EXISTS public.client_wearables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('fitbit', 'whoop', 'apple_health', 'garmin')),
    provider_user_id TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expires_at TIMESTAMPTZ,
    scope TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    device_name TEXT, -- Ej: 'Fitbit Versa 4', 'Fitbit Versa 3', 'Whoop 4.0'
    battery_level INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_client_provider UNIQUE (client_id, provider)
);

-- 2. Tabla de lecturas biométricas diarias consolidadas
CREATE TABLE IF NOT EXISTS public.client_biometrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    provider TEXT NOT NULL DEFAULT 'fitbit',

    -- Actividad & Gasto Calórico
    steps INT DEFAULT 0,
    distance_km NUMERIC(6, 2) DEFAULT 0,
    active_minutes INT DEFAULT 0,
    calories_burned INT DEFAULT 0,

    -- Frecuencia Cardíaca & Salud Cardiovascular
    resting_hr INT, -- Pulso en reposo (RHR)
    min_hr INT,
    max_hr INT,
    hrv_rmssd NUMERIC(6, 2), -- Variabilidad de la Frecuencia Cardíaca (HRV)

    -- Sueño & Recuperación Muscular
    sleep_minutes INT DEFAULT 0, -- Tiempo total de sueño
    sleep_efficiency INT, -- Eficiencia del sueño (0-100%)
    sleep_score INT, -- Puntuación de sueño (0-100)
    deep_sleep_minutes INT DEFAULT 0,
    light_sleep_minutes INT DEFAULT 0,
    rem_sleep_minutes INT DEFAULT 0,
    wake_minutes INT DEFAULT 0,
    recovery_score INT, -- Puntuación de recuperación diaria (0-100%)

    raw_data JSONB, -- Payload crudo devuelto por la API del fabricante
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_client_date_provider UNIQUE (client_id, date, provider)
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_client_wearables_client ON public.client_wearables(client_id);
CREATE INDEX IF NOT EXISTS idx_client_biometrics_client_date ON public.client_biometrics_daily(client_id, date DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.client_wearables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_biometrics_daily ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
DROP POLICY IF EXISTS "Public access to client_wearables" ON public.client_wearables;
CREATE POLICY "Public access to client_wearables" ON public.client_wearables
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to client_biometrics_daily" ON public.client_biometrics_daily;
CREATE POLICY "Public access to client_biometrics_daily" ON public.client_biometrics_daily
    FOR ALL USING (true) WITH CHECK (true);
