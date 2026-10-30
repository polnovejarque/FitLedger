-- ==============================================================================
-- FITLEADER - BORRADO INTEGRAL EN CASCADA DE CLIENTES Y AUTENTICACIÓN
-- Elimina de forma garantizada cualquier rastro del cliente en:
-- 1. Todas las tablas secundarias (rutinas, planes, nutrición, resultados, biometría, chat, etc.)
-- 2. La tabla principal public.clients (Table Editor)
-- 3. El sistema oficial auth.users (Authentication -> Users de Supabase)
-- ==============================================================================

-- 1. FUNCIÓN TRIGGER: Se dispara automáticamente cuando se elimina una fila de 'public.clients'
-- Funciona tanto si se borra desde la app SaaS como desde el Table Editor de Supabase
CREATE OR REPLACE FUNCTION public.handle_client_deleted_cascade()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    target_email TEXT;
BEGIN
    target_email := LOWER(TRIM(OLD.email));

    -- Limpieza de todas las tablas dependientes comprobando existencia para evitar errores
    IF to_regclass('public.client_assigned_routines') IS NOT NULL THEN
        DELETE FROM public.client_assigned_routines WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.client_weekly_plan') IS NOT NULL THEN
        DELETE FROM public.client_weekly_plan WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.client_progress') IS NOT NULL THEN
        DELETE FROM public.client_progress WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.class_bookings') IS NOT NULL THEN
        DELETE FROM public.class_bookings WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.chat_messages') IS NOT NULL THEN
        DELETE FROM public.chat_messages WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.client_wearables') IS NOT NULL THEN
        DELETE FROM public.client_wearables WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.client_biometrics_daily') IS NOT NULL THEN
        DELETE FROM public.client_biometrics_daily WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.workout_results') IS NOT NULL THEN
        DELETE FROM public.workout_results WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.nutrition_logs') IS NOT NULL THEN
        DELETE FROM public.nutrition_logs WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.nutrition_meals') IS NOT NULL AND to_regclass('public.nutrition_plans') IS NOT NULL THEN
        DELETE FROM public.nutrition_meals WHERE plan_id IN (SELECT id FROM public.nutrition_plans WHERE client_id = OLD.id);
    END IF;

    IF to_regclass('public.nutrition_plans') IS NOT NULL THEN
        DELETE FROM public.nutrition_plans WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.push_subscriptions') IS NOT NULL THEN
        DELETE FROM public.push_subscriptions WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.routine_assignments') IS NOT NULL THEN
        DELETE FROM public.routine_assignments WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.space_bookings') IS NOT NULL THEN
        UPDATE public.space_bookings SET client_id = NULL WHERE client_id = OLD.id;
    END IF;

    IF to_regclass('public.payments') IS NOT NULL THEN
        UPDATE public.payments SET client_id = NULL WHERE client_id = OLD.id;
    END IF;

    -- Eliminar la cuenta en auth.users si existe (protegiendo cuentas de coach/admin)
    IF target_email IS NOT NULL AND target_email <> '' THEN
        DELETE FROM auth.users 
        WHERE LOWER(TRIM(email)) = target_email
          AND id NOT IN (SELECT id FROM public.profiles WHERE role IN ('coach', 'admin', 'superadmin', 'owner'));
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


-- 2. FUNCIÓN RPC: Borrado explícito directo que invoca la app SaaS al eliminar un cliente
CREATE OR REPLACE FUNCTION public.delete_client_completely(target_client_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    client_email TEXT;
BEGIN
    SELECT LOWER(TRIM(email)) INTO client_email FROM public.clients WHERE id = target_client_id;
    
    IF client_email IS NULL AND NOT EXISTS (SELECT 1 FROM public.clients WHERE id = target_client_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cliente no encontrado');
    END IF;

    -- Limpieza de todas las tablas dependientes
    IF to_regclass('public.client_assigned_routines') IS NOT NULL THEN
        DELETE FROM public.client_assigned_routines WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.client_weekly_plan') IS NOT NULL THEN
        DELETE FROM public.client_weekly_plan WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.client_progress') IS NOT NULL THEN
        DELETE FROM public.client_progress WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.class_bookings') IS NOT NULL THEN
        DELETE FROM public.class_bookings WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.chat_messages') IS NOT NULL THEN
        DELETE FROM public.chat_messages WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.client_wearables') IS NOT NULL THEN
        DELETE FROM public.client_wearables WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.client_biometrics_daily') IS NOT NULL THEN
        DELETE FROM public.client_biometrics_daily WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.workout_results') IS NOT NULL THEN
        DELETE FROM public.workout_results WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.nutrition_logs') IS NOT NULL THEN
        DELETE FROM public.nutrition_logs WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.nutrition_meals') IS NOT NULL AND to_regclass('public.nutrition_plans') IS NOT NULL THEN
        DELETE FROM public.nutrition_meals WHERE plan_id IN (SELECT id FROM public.nutrition_plans WHERE client_id = target_client_id);
    END IF;

    IF to_regclass('public.nutrition_plans') IS NOT NULL THEN
        DELETE FROM public.nutrition_plans WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.push_subscriptions') IS NOT NULL THEN
        DELETE FROM public.push_subscriptions WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.routine_assignments') IS NOT NULL THEN
        DELETE FROM public.routine_assignments WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.space_bookings') IS NOT NULL THEN
        UPDATE public.space_bookings SET client_id = NULL WHERE client_id = target_client_id;
    END IF;

    IF to_regclass('public.payments') IS NOT NULL THEN
        UPDATE public.payments SET client_id = NULL WHERE client_id = target_client_id;
    END IF;

    -- Borrado de la tabla principal clients
    DELETE FROM public.clients WHERE id = target_client_id;

    -- Borrado de auth.users si existe (protegiendo cuentas de coach/admin)
    IF client_email IS NOT NULL AND client_email <> '' THEN
        DELETE FROM auth.users 
        WHERE LOWER(TRIM(email)) = client_email
          AND id NOT IN (SELECT id FROM public.profiles WHERE role IN ('coach', 'admin', 'superadmin', 'owner'));
    END IF;

    RETURN jsonb_build_object('success', true);
END;
$$;


-- 3. FUNCIÓN RPC: Limpieza preventiva de cuenta huérfana en auth.users antes de registrar
CREATE OR REPLACE FUNCTION public.clean_orphan_auth_user(target_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    clean_target TEXT;
BEGIN
    clean_target := LOWER(TRIM(target_email));
    IF clean_target IS NULL OR clean_target = '' THEN
        RETURN false;
    END IF;

    -- Proteger cuentas de entrenadores y administradores
    IF EXISTS (
        SELECT 1 FROM public.profiles p
        JOIN auth.users u ON u.id = p.id
        WHERE LOWER(TRIM(u.email)) = clean_target
    ) THEN
        RETURN false;
    END IF;

    -- Eliminar la cuenta del atleta en auth.users para permitir registrar con credenciales nuevas
    DELETE FROM auth.users WHERE LOWER(TRIM(email)) = clean_target;
    RETURN true;
END;
$$;

-- Conceder permisos de ejecución para usuarios autenticados (coaches)
GRANT EXECUTE ON FUNCTION public.delete_client_completely(BIGINT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.clean_orphan_auth_user(TEXT) TO authenticated;
