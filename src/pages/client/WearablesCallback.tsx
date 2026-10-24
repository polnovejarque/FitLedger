import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Watch, ArrowRight } from 'lucide-react';
import { FitbitService } from '../../services/fitbitService';

export default function WearablesCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            if (error) {
                setStatus('error');
                setErrorMessage(errorDescription || error || 'Autorización denegada por el usuario');
                return;
            }

            if (!code || !state) {
                setStatus('error');
                setErrorMessage('Faltan parámetros requeridos de autorización.');
                return;
            }

            try {
                await FitbitService.handleCallback(code, state);
                setStatus('success');
                setTimeout(() => {
                    navigate('/client-app/home', { replace: true });
                }, 2000);
            } catch (err: any) {
                console.error('Error procesando callback de Fitbit:', err);
                setStatus('error');
                setErrorMessage(err.message || 'Error desconocido al vincular tu dispositivo Fitbit.');
            }
        };

        processCallback();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">
                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <Watch className="w-8 h-8 text-emerald-500 animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold">Vinculando Google Fitbit Versa...</h2>
                        <p className="text-sm text-zinc-400">Estamos verificando la conexión y sincronizando tus primeras métricas de salud.</p>
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mt-4" />
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">¡Dispositivo Vinculado con Éxito!</h2>
                        <p className="text-sm text-zinc-400">Tu Google Fitbit Versa está sincronizado. Pasos, sueño y pulsaciones se registrarán automáticamente.</p>
                        <p className="text-xs text-emerald-400 font-semibold pt-2">Redirigiendo a tu panel...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto">
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white">No se pudo vincular</h2>
                        <p className="text-sm text-red-400/90 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-left text-xs font-mono">
                            {errorMessage}
                        </p>
                        <button
                            onClick={() => navigate('/client-app/home', { replace: true })}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold transition-colors text-sm mt-4"
                        >
                            Volver a la App <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
