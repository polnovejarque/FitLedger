export type WearableProvider = 'fitbit' | 'whoop' | 'apple_health' | 'garmin';

export interface ClientWearableConnection {
    id: string;
    client_id: string | number;
    provider: WearableProvider;
    provider_user_id?: string;
    access_token?: string;
    refresh_token?: string;
    token_type?: string;
    expires_at?: string;
    scope?: string;
    is_active: boolean;
    last_sync_at?: string;
    device_name?: string;
    battery_level?: number;
    created_at?: string;
    updated_at?: string;
}

export interface DailyBiometrics {
    id?: string;
    client_id: string | number;
    date: string; // YYYY-MM-DD
    provider: WearableProvider;

    // Actividad & NEAT
    steps: number;
    distance_km: number;
    active_minutes: number;
    calories_burned: number;

    // Frecuencia Cardíaca
    resting_hr?: number | null;
    min_hr?: number | null;
    max_hr?: number | null;
    hrv_rmssd?: number | null;

    // Sueño & Recuperación
    sleep_minutes: number;
    sleep_efficiency?: number | null;
    sleep_score?: number | null;
    deep_sleep_minutes?: number;
    light_sleep_minutes?: number;
    rem_sleep_minutes?: number;
    wake_minutes?: number;
    recovery_score?: number | null;

    raw_data?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
}

export interface FitbitTokenResponse {
    access_token: string;
    refresh_token: string;
    user_id: string;
    expires_in: number;
    token_type: string;
    scope: string;
}
