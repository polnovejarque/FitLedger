import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Loader2, ChevronRight, Dumbbell } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const ClientLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [accessCode, setAccessCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // 1. Buscar al cliente por email y código
            const { data: client, error: queryError } = await supabase
                .from('clients')
                .select('*')
                .eq('email', email.trim())
                .eq('access_code', accessCode.trim())
                .maybeSingle();

            if (queryError) throw queryError;

            if (!client) {
                setError('Email o código incorrectos.');
                setIsLoading(false);
                return;
            }

            // 2. GUARDAR SESIÓN (CLAVE PARA QUE FUNCIONE EL HOME)
            // Guardamos el email con la clave EXACTA que busca ClientWorkout.tsx
            localStorage.setItem('fit_client_email', client.email); 
            
            // También guardamos estos por si los necesitamos luego (opcional pero útil)
            localStorage.setItem('fitleader_client_id', client.id);
            localStorage.setItem('fitleader_client_name', client.name);
            localStorage.setItem('fitleader_client_img', client.image_url || '');

            // 3. Redirigir a la Home del Cliente
            navigate('/client-app/home');

        } catch (err: any) {
            console.error(err); // Añadido log para debug
            setError(err.message || 'Error al conectar.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center p-6 font-sans relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-32 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="max-w-md mx-auto w-full relative z-10">
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 mb-6 shadow-lg shadow-emerald-500/20">
                        <Dumbbell className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Bienvenido, Atleta</h1>
                    <p className="text-zinc-400">Introduce tus credenciales para acceder a tu plan.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Código de Acceso</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input 
                                type="password" 
                                required
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all tracking-widest"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-6 text-lg font-bold bg-emerald-500 text-black hover:bg-emerald-400 rounded-xl mt-4 shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98]"
                    >
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="flex items-center gap-2">Entrar <ChevronRight className="w-5 h-5"/></span>}
                    </Button>
                </form>

                <p className="text-center text-xs text-zinc-600 mt-8">
                    ¿No tienes código? Contacta con tu entrenador.
                </p>
            </div>
        </div>
    );
};

export default ClientLogin;