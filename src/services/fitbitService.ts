import { supabase } from '../lib/supabase';
import type { DailyBiometrics, ClientWearableConnection } from '../types/wearables';

const FITBIT_AUTH_URL = 'https://www.fitbit.com/oauth2/authorize';
const FITBIT_TOKEN_URL = 'https://api.fitbit.com/oauth2/token';
const FITBIT_API_BASE = 'https://api.fitbit.com';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Scopes oficiales para Google Health API (Fitbit, Versa, Pixel Watch)
const GOOGLE_HEALTH_SCOPES = [
    'openid',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/googlehealth.activity_and_fitness.readonly',
    'https://www.googleapis.com/auth/googlehealth.sleep.readonly',
    'https://www.googleapis.com/auth/googlehealth.health_metrics_and_measurements.readonly',
].join(' ');

// Scopes requeridos para API de Fitbit heredada
const LEGACY_FITBIT_SCOPES = ['activity', 'heartrate', 'sleep', 'profile', 'respiratory_rate'].join(' ');

// Generador PKCE nativo para máxima seguridad en Web y Mobile PWA
function generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = new Uint8Array(length);
    window.crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
}

async function sha256(plain: string): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

function base64UrlEncode(buffer: ArrayBuffer): string {
    let str = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        str += String.fromCharCode(bytes[i]);
    }
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export class FitbitService {
    private static getClientId(): string {
        const id = import.meta.env.VITE_FITBIT_CLIENT_ID || localStorage.getItem('fitbit_client_id');
        return id || '';
    }

    private static getClientSecret(): string {
        return import.meta.env.VITE_FITBIT_CLIENT_SECRET || '';
    }

    private static isGoogleOAuth(): boolean {
        return this.getClientId().includes('.apps.googleusercontent.com');
    }

    public static getRedirectUri(): string {
        return `${window.location.origin}/client-app/wearables/callback`;
    }

    /**
     * Inicia el flujo de autorización OAuth 2.0 PKCE con Google Health / Fitbit
     */
    public static async initiateAuth(clientId: string): Promise<void> {
        const fitbitClientId = this.getClientId();
        if (!fitbitClientId) {
            throw new Error('Falta configurar el Client ID. Añade VITE_FITBIT_CLIENT_ID en tu .env.');
        }

        const isGoogle = this.isGoogleOAuth();
        const codeVerifier = generateRandomString(64);
        const codeChallengeBuffer = await sha256(codeVerifier);
        const codeChallenge = base64UrlEncode(codeChallengeBuffer);
        const state = generateRandomString(32);

        // Guardar para validar al regresar del redirect
        sessionStorage.setItem('fitbit_code_verifier', codeVerifier);
        sessionStorage.setItem('fitbit_auth_state', state);
        sessionStorage.setItem('fitbit_target_client_id', clientId);

        if (isGoogle) {
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: fitbitClientId,
                scope: GOOGLE_HEALTH_SCOPES,
                access_type: 'offline',
                prompt: 'consent',
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
                state: state,
                redirect_uri: this.getRedirectUri(),
            });
            window.location.href = `${GOOGLE_AUTH_URL}?${params.toString()}`;
        } else {
            const params = new URLSearchParams({
                response_type: 'code',
                client_id: fitbitClientId,
                scope: LEGACY_FITBIT_SCOPES,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
                state: state,
                redirect_uri: this.getRedirectUri(),
            });
            window.location.href = `${FITBIT_AUTH_URL}?${params.toString()}`;
        }
    }

    /**
     * Procesa el código retornado tras la autorización de Google Health / Fitbit
     */
    public static async handleCallback(code: string, state: string): Promise<{ success: boolean; clientId?: string }> {
        const savedState = sessionStorage.getItem('fitbit_auth_state');
        const codeVerifier = sessionStorage.getItem('fitbit_code_verifier');
        const targetClientId = sessionStorage.getItem('fitbit_target_client_id');

        if (!savedState || savedState !== state) {
            throw new Error('Estado CSRF inválido o sesión expirada.');
        }
        if (!codeVerifier) {
            throw new Error('No se encontró el code_verifier de PKCE.');
        }

        const fitbitClientId = this.getClientId();
        const clientSecret = this.getClientSecret();
        const redirectUri = this.getRedirectUri();
        const isGoogle = this.isGoogleOAuth();

        let tokenData: any;

        if (isGoogle) {
            const bodyParams = new URLSearchParams({
                client_id: fitbitClientId,
                client_secret: clientSecret,
                grant_type: 'authorization_code',
                code: code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri,
            });

            const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyParams.toString(),
            });

            if (!tokenRes.ok) {
                const errData = await tokenRes.json().catch(() => ({}));
                throw new Error(errData?.error_description || errData?.error || 'Error al obtener tokens de Google Health');
            }

            tokenData = await tokenRes.json();
        } else {
            const bodyParams = new URLSearchParams({
                client_id: fitbitClientId,
                grant_type: 'authorization_code',
                code: code,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri,
            });

            const tokenRes = await fetch(FITBIT_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyParams.toString(),
            });

            if (!tokenRes.ok) {
                const errData = await tokenRes.json().catch(() => ({}));
                throw new Error(errData?.errors?.[0]?.message || 'Error al obtener tokens de Fitbit');
            }

            tokenData = await tokenRes.json();
        }

        const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

        // Guardar o actualizar conexión en Supabase
        if (targetClientId) {
            await supabase.from('client_wearables').upsert({
                client_id: targetClientId,
                provider: 'fitbit',
                provider_user_id: tokenData.user_id || 'google_health_user',
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
                expires_at: expiresAt,
                scope: tokenData.scope,
                is_active: true,
                device_name: 'Google Fitbit Versa',
                last_sync_at: new Date().toISOString(),
            }, { onConflict: 'client_id,provider' });

            // Sincronizar datos del día de hoy de inmediato
            await this.syncClientMetrics(targetClientId, tokenData.access_token);
        }

        // Limpiar sessionStorage
        sessionStorage.removeItem('fitbit_auth_state');
        sessionStorage.removeItem('fitbit_code_verifier');
        sessionStorage.removeItem('fitbit_target_client_id');

        return { success: true, clientId: targetClientId || undefined };
    }

    /**
     * Refresca un token expirado de Google Health / Fitbit
     */
    public static async refreshToken(connection: ClientWearableConnection): Promise<string> {
        if (!connection.refresh_token) {
            throw new Error('No se dispone de refresh token para Fitbit.');
        }

        const fitbitClientId = this.getClientId();
        const clientSecret = this.getClientSecret();
        const isGoogle = this.isGoogleOAuth();

        let tokenData: any;

        if (isGoogle) {
            const bodyParams = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: connection.refresh_token,
                client_id: fitbitClientId,
                client_secret: clientSecret,
            });

            const res = await fetch(GOOGLE_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyParams.toString(),
            });

            if (!res.ok) throw new Error('Error al refrescar token de Google Health');
            tokenData = await res.json();
        } else {
            const bodyParams = new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: connection.refresh_token,
                client_id: fitbitClientId,
            });

            const res = await fetch(FITBIT_TOKEN_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: bodyParams.toString(),
            });

            if (!res.ok) throw new Error('Error al refrescar token de Fitbit');
            tokenData = await res.json();
        }

        const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString();

        await supabase.from('client_wearables').update({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || connection.refresh_token,
            expires_at: expiresAt,
            last_sync_at: new Date().toISOString(),
        }).eq('id', connection.id);

        return tokenData.access_token;
    }

    /**
     * Sincroniza las métricas diarias del cliente desde la API de Fitbit
     */
    public static async syncClientMetrics(clientId: string, explicitAccessToken?: string, targetDate?: string): Promise<DailyBiometrics | null> {
        let token = explicitAccessToken;
        const dateStr = targetDate || new Date().toISOString().split('T')[0];

        if (!token) {
            const { data: connection } = await supabase
                .from('client_wearables')
                .select('*')
                .eq('client_id', clientId)
                .eq('provider', 'fitbit')
                .single();

            if (!connection || !connection.is_active) {
                return null;
            }

            // Verificar si el token expiró
            const isExpired = connection.expires_at && new Date(connection.expires_at) <= new Date();
            if (isExpired) {
                token = await this.refreshToken(connection);
            } else {
                token = connection.access_token;
            }
        }

        if (!token) return null;

        const authHeaders = { Authorization: `Bearer ${token}` };

        try {
            // 1. Actividad del día (Pasos, Calorías, Distancia)
            const activityRes = await fetch(`${FITBIT_API_BASE}/1/user/-/activities/date/${dateStr}.json`, { headers: authHeaders });
            const activityData = activityRes.ok ? await activityRes.json() : null;

            // 2. Frecuencia cardíaca (RHR en reposo)
            const heartRes = await fetch(`${FITBIT_API_BASE}/1/user/-/activities/heart/date/${dateStr}/1d.json`, { headers: authHeaders });
            const heartData = heartRes.ok ? await heartRes.json() : null;

            // 3. Sueño (Tiempo dormido, fases, eficiencia)
            const sleepRes = await fetch(`${FITBIT_API_BASE}/1.2/user/-/sleep/date/${dateStr}.json`, { headers: authHeaders });
            const sleepData = sleepRes.ok ? await sleepRes.json() : null;

            // 4. HRV (Variabilidad cardíaca)
            const hrvRes = await fetch(`${FITBIT_API_BASE}/1/user/-/hrv/date/${dateStr}.json`, { headers: authHeaders });
            const hrvData = hrvRes.ok ? await hrvRes.json() : null;

            // Procesar y consolidar datos
            const summary = activityData?.summary || {};
            const steps = summary.steps || 0;
            const calories = summary.caloriesOut || 0;
            const activeMinutes = (summary.fairlyActiveMinutes || 0) + (summary.veryActiveMinutes || 0);
            const distanceKm = summary.distances?.[0]?.distance || 0;

            const heartSummary = heartData?.['activities-heart']?.[0]?.value || {};
            const restingHr = heartSummary.restingHeartRate || null;

            const sleepSummary = sleepData?.summary || {};
            const sleepMinutes = sleepSummary.totalMinutesAsleep || 0;
            const sleepStages = sleepSummary.stages || {};
            const deepSleep = sleepStages.deep || 0;
            const lightSleep = sleepStages.light || 0;
            const remSleep = sleepStages.rem || 0;
            const wakeMinutes = sleepStages.wake || 0;

            // Calcular score de sueño orientativo (0-100)
            let sleepScore: number | null = null;
            if (sleepMinutes > 0) {
                const idealMinutes = 480; // 8 horas
                const durationScore = Math.min(100, (sleepMinutes / idealMinutes) * 70);
                const efficiencyBonus = (sleepData?.sleep?.[0]?.efficiency || 85) * 0.3;
                sleepScore = Math.min(100, Math.round(durationScore + efficiencyBonus));
            }

            const hrvDaily = hrvData?.hrv?.[0]?.value?.dailyRmssd || null;

            const biometrics: DailyBiometrics = {
                client_id: clientId,
                date: dateStr,
                provider: 'fitbit',
                steps,
                distance_km: Number(distanceKm.toFixed(2)),
                active_minutes: activeMinutes,
                calories_burned: calories,
                resting_hr: restingHr,
                sleep_minutes: sleepMinutes,
                sleep_score: sleepScore,
                deep_sleep_minutes: deepSleep,
                light_sleep_minutes: lightSleep,
                rem_sleep_minutes: remSleep,
                wake_minutes: wakeMinutes,
                hrv_rmssd: hrvDaily,
                raw_data: {
                    activity: activityData,
                    heart: heartData,
                    sleep: sleepData,
                    hrv: hrvData,
                },
            };

            // Upsert a Supabase
            await supabase.from('client_biometrics_daily').upsert(biometrics, {
                onConflict: 'client_id,date,provider',
            });

            // Actualizar timestamp de última sincronización
            await supabase.from('client_wearables')
                .update({ last_sync_at: new Date().toISOString() })
                .eq('client_id', clientId)
                .eq('provider', 'fitbit');

            return biometrics;
        } catch (error) {
            console.error('Error sincronizando métricas de Fitbit:', error);
            throw error;
        }
    }

    /**
     * Obtiene el estado de conexión de wearables del cliente
     */
    public static async getConnection(clientId: string): Promise<ClientWearableConnection | null> {
        try {
            const { data, error } = await supabase
                .from('client_wearables')
                .select('*')
                .eq('client_id', clientId)
                .eq('provider', 'fitbit')
                .maybeSingle();

            if (error) {
                console.warn('Error fetching wearable connection:', error);
                return null;
            }
            return data;
        } catch {
            return null;
        }
    }

    /**
     * Desconecta el wearable
     */
    public static async disconnect(clientId: string): Promise<void> {
        await supabase
            .from('client_wearables')
            .delete()
            .eq('client_id', clientId)
            .eq('provider', 'fitbit');
    }

    /**
     * Genera datos de prueba simulados (Sandbox) para verificar UI antes de tener credenciales en producción
     */
    public static getMockBiometrics(clientId: string): DailyBiometrics {
        return {
            client_id: clientId,
            date: new Date().toISOString().split('T')[0],
            provider: 'fitbit',
            steps: 9420,
            distance_km: 6.8,
            active_minutes: 54,
            calories_burned: 2380,
            resting_hr: 58,
            sleep_minutes: 462, // 7h 42m
            sleep_efficiency: 92,
            sleep_score: 87,
            deep_sleep_minutes: 95,
            light_sleep_minutes: 245,
            rem_sleep_minutes: 122,
            wake_minutes: 28,
            hrv_rmssd: 54.5,
            recovery_score: 84,
        };
    }
}
