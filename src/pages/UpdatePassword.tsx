import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Lock, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const UpdatePassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    // ✅ TypeScript feliz: leemos la respuesta sin desestructurar 'session' de golpe
    useEffect(() => {
        supabase.auth.getSession().then((response) => {
            if (!response.data.session) {
                setError("El enlace de recuperación no es válido o ha caducado. Vuelve a solicitar el cambio desde la pantalla de inicio de sesión.");
            }
        });
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage("¡Contraseña actualizada con éxito! Redirigiendo...");
            
            // Esperamos 2 segundos para que lea el mensaje y lo metemos al panel
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
            
        } catch (err: any) {
            setError(err.message || "Error al actualizar la contraseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/10">
                        <img src="/logo.png" alt="FitLeader" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Crea tu nueva contraseña
                    </h1>
                    <p className="text-zinc-400">
                        Escribe una contraseña segura que puedas recordar.
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-xl">
                    <form onSubmit={handleUpdate} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in zoom-in-95">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-400 text-sm animate-in zoom-in-95">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <span className="font-medium">{message}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nueva Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    type="password" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-zinc-900/50 outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="••••••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]" disabled={loading || !!message}>
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Guardar y entrar'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdatePassword;