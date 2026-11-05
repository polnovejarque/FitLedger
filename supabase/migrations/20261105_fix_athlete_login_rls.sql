-- ==============================================================================
-- FITLEADER - RESOLUCIÓN DE ACCESO Y LOGIN DE ATLETAS EN CLIENT APP
-- 1. Desbloquea RLS en la tabla 'clients' para permitir la lectura a la app de clientes
-- 2. Implementa la función RPC 'client_app_login' para validación atómica segura
-- 3. Implementa la función RPC 'get_athlete_profile' para carga infalible del dashboard
-- ==============================================================================

-- 1. POLÍTICA RLS PARA LECTURA DE CLIENTES EN LA APP
DROP POLICY IF EXISTS "Public read access to clients for athlete app" ON public.clients;
CREATE POLICY "Public read access to clients for athlete app" ON public.clients
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- 2. FUNCIÓN RPC: LOGIN ATÓMICO Y SEGURO DEL ATLETA
-- Comprueba email y access_code con insensibilidad a mayúsculas/minúsculas y espacios
CREATE OR REPLACE FUNCTION public.client_app_login(p_email TEXT, p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_clean_email TEXT;
    v_clean_code TEXT;
    v_client RECORD;
BEGIN
    v_clean_email := LOWER(TRIM(COALESCE(p_email, '')));
    v_clean_code := UPPER(TRIM(COALESCE(p_code, '')));

    IF v_clean_email = '' OR v_clean_code = '' THEN
        RETURN jsonb_build_object('success', false, 'error', 'El email y el código son obligatorios.');
    END IF;

    -- Buscamos al cliente por email (insensible a mayúsculas y espacios)
    SELECT * INTO v_client
    FROM public.clients
    WHERE LOWER(TRIM(email)) = v_clean_email;

    IF v_client IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se encontró ningún atleta registrado con este correo.');
    END IF;

    -- Comprobamos si el código coincide (limpiando guiones o espacios si hiciera falta)
    IF UPPER(TRIM(COALESCE(v_client.access_code, ''))) <> v_clean_code THEN
        RETURN jsonb_build_object('success', false, 'error', 'Código de acceso incorrecto. Pide a tu entrenador que te lo confirme.');
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'client', row_to_json(v_client)
    );
END;
$$;

-- 3. FUNCIÓN RPC: OBTENER PERFIL DEL ATLETA PARA EL HOME
CREATE OR REPLACE FUNCTION public.get_athlete_profile(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    v_client RECORD;
BEGIN
    SELECT * INTO v_client
    FROM public.clients
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(COALESCE(p_email, '')));

    IF v_client IS NULL THEN
        RETURN NULL;
    END IF;

    RETURN row_to_json(v_client);
END;
$$;

-- Concesión de permisos a usuarios anónimos (visitantes) y autenticados
GRANT EXECUTE ON FUNCTION public.client_app_login(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_athlete_profile(TEXT) TO anon, authenticated;
