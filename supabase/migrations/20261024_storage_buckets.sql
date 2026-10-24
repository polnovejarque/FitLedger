-- ==============================================================================
-- FITLEADER - CONFIGURACIÓN DE BUCKETS PÚBLICOS DE STORAGE (LOGOS Y VÍDEOS)
-- ==============================================================================

-- 1. Crear o actualizar bucket público 'avatars' (Logos, Avatares, Fotos Check-in)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars', 
    'avatars', 
    true, 
    5242880, -- 5 MB máximo por imagen
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- 2. Crear o actualizar bucket público 'Videos' (Vídeos de ejercicios personalizados)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
    'Videos', 
    'Videos', 
    true, 
    104857600 -- 100 MB máximo
)
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    file_size_limit = 104857600;

-- 3. Políticas de acceso público (RLS en storage.objects)
DROP POLICY IF EXISTS "Public Read Avatars and Videos" ON storage.objects;
CREATE POLICY "Public Read Avatars and Videos" ON storage.objects
    FOR SELECT USING (bucket_id IN ('avatars', 'Videos'));

DROP POLICY IF EXISTS "Allow Uploads to Avatars and Videos" ON storage.objects;
CREATE POLICY "Allow Uploads to Avatars and Videos" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id IN ('avatars', 'Videos'));

DROP POLICY IF EXISTS "Allow Updates to Avatars and Videos" ON storage.objects;
CREATE POLICY "Allow Updates to Avatars and Videos" ON storage.objects
    FOR UPDATE USING (bucket_id IN ('avatars', 'Videos'));
