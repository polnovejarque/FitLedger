-- ==============================================================================
-- FITLEADER - BORRADO EN CASCADA AUTOMÁTICO DE CLIENTES Y CUENTAS SUPABASE AUTH
-- ==============================================================================

-- 1. FUNCIÓN TRIGGER: Cuando se borra un cliente de 'public.clients', 
-- se eliminan automáticamente todos sus datos relacionados y su cuenta de 'auth.users'
CREATE OR REPLACE FUNCTION public.handle_client_deleted_cascade()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- 1. Limpiar registros relacionados en tablas hijas (evita bloqueos de Foreign Key)
    DELETE FROM public.client_assigned_routines WHERE client_id = OLD.id;
    DELETE FROM public.client_weekly_plan WHERE client_id = OLD.id;
    DELETE FROM public.client_progress WHERE client_id = OLD.id;
    DELETE FROM public.class_bookings WHERE client_id = OLD.id;
    DELETE FROM public.chat_messages WHERE client_id = OLD.id;
    DELETE FROM public.client_wearables WHERE client_id = OLD.id;
    DELETE FROM public.client_biometrics_daily WHERE client_id = OLD.id;

    -- 2. Eliminar la cuenta en Supabase Auth directamente por su email
    IF OLD.email IS NOT NULL AND OLD.email <> '' THEN
        DELETE FROM auth.users WHERE LOWER(email) = LOWER(OLD.email);
    END IF;

    RETURN OLD;
END;
$$;

-- Vincular el trigger a la tabla clients
DROP TRIGGER IF EXISTS on_client_deleted_cascade ON public.clients;
CREATE TRIGGER on_client_deleted_cascade
BEFORE DELETE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION public.handle_client_deleted_cascade();

-- 2. FUNCIÓN RPC: Borrado explícito completo invocable desde el frontend
CREATE OR REPLACE FUNCTION public.delete_client_completely(target_client_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    client_email TEXT;
BEGIN
    SELECT email INTO client_email FROM public.clients WHERE id = target_client_id;
    
    IF client_email IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cliente no encontrado');
    END IF;

    -- Limpieza de tablas hijas
    DELETE FROM public.client_assigned_routines WHERE client_id = target_client_id;
    DELETE FROM public.client_weekly_plan WHERE client_id = target_client_id;
    DELETE FROM public.client_progress WHERE client_id = target_client_id;
    DELETE FROM public.class_bookings WHERE client_id = target_client_id;
    DELETE FROM public.chat_messages WHERE client_id = target_client_id;
    DELETE FROM public.client_wearables WHERE client_id = target_client_id;
    DELETE FROM public.client_biometrics_daily WHERE client_id = target_client_id;

    -- Borrado de la tabla clients
    DELETE FROM public.clients WHERE id = target_client_id;

    -- Borrado de la cuenta en auth.users
    DELETE FROM auth.users WHERE LOWER(email) = LOWER(client_email);

    RETURN jsonb_build_object('success', true);
END;
$$;

-- 3. FUNCIÓN RPC: Limpiar cuenta huérfana en auth.users si existe antes de registrar un nuevo cliente
CREATE OR REPLACE FUNCTION public.clean_orphan_auth_user(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
    -- Solo elimina de auth si NO existe ningún cliente activo con ese email en public.clients
    IF NOT EXISTS (SELECT 1 FROM public.clients WHERE LOWER(email) = LOWER(target_email)) THEN
        DELETE FROM auth.users WHERE LOWER(email) = LOWER(target_email);
        RETURN true;
    END IF;
    RETURN false;
END;
$$;

-- Conceder permisos de ejecución para usuarios autenticados (coaches)
GRANT EXECUTE ON FUNCTION public.delete_client_completely(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clean_orphan_auth_user(TEXT) TO authenticated;
