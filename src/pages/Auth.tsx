import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { sendWelcomeCoachEmail } from '../services/emailService';
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Auth = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [userType, setUserType] = useState<'coach' | 'athlete'>('coach');

    // Inicializar estados con searchParams
    useEffect(() => {
        if (searchParams.get('mode') === 'register') {
            setIsLogin(false);
        }
        if (searchParams.get('role') === 'athlete') {
            setUserType('athlete');
            setIsLogin(true);
        }
    }, [searchParams]);
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isFreelanceOnly, setIsFreelanceOnly] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        loadingStateSet(true);
        setError(null);
        setMessage(null);

        try {
            if (isResetting && userType === 'coach') {
                // ✅ Lógica de recuperación de contraseña (solo Coach)
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password`,
                });
                if (error) throw error;
                setMessage("Te hemos enviado un enlace para recuperar tu contraseña. Revisa tu bandeja de entrada.");
            } else if (isLogin) {
                if (userType === 'athlete') {
                    // ✅ Lógica de inicio de sesión de Atleta (Email + Código de Acceso como password)
                    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                        email: email.trim(),
                        password: password.trim(),
                    });

                    if (authError || !authData.user) {
                        throw new Error('Email o código de acceso incorrectos.');
                    }

                    // Buscamos sus datos en la tabla clients
                    const { data: client, error: queryError } = await supabase
                        .from('clients')
                        .select('*')
                        .ilike('email', email.trim())
                        .single();

                    if (queryError || !client) {
                        throw new Error('Tu cuenta no está vinculada a ningún entrenador.');
                    }

                    // Guardamos sesión del atleta
                    localStorage.setItem('fit_client_email', client.email); 
                    localStorage.setItem('fitleader_client_id', client.id);
                    localStorage.setItem('fitleader_client_name', client.name);
                    localStorage.setItem('fitleader_client_img', client.image_url || '');

                    navigate('/client-app/home');
                } else {
                    // ✅ Lógica de inicio de sesión de Coach
                    const { error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    navigate('/dashboard'); 
                }
            } else {
                // Registro (solo Coach)
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                
                const userId = data.user?.id;
                const selectedPlan = isFreelanceOnly ? 'free' : (searchParams.get('plan') || 'pro');
                if (userId && (selectedPlan !== 'pro' || isFreelanceOnly)) {
                    // Esperar 500ms para asegurar que el trigger de base de datos haya insertado el perfil
                    await new Promise(resolve => setTimeout(resolve, 500));
                    await supabase
                        .from('profiles')
                        .update({ 
                            plan: selectedPlan,
                            subscription_plan: selectedPlan
                        })
                        .eq('id', userId);
                }

                // Enviar correo de bienvenida/onboarding
                sendWelcomeCoachEmail(email, "Entrenador").catch(console.error);

                setMessage("¡Cuenta creada! Ya puedes iniciar sesión.");
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || "Ha ocurrido un error");
        } finally {
            loadingStateSet(false);
        }
    };

    // Helper alias to avoid collision with loading state named "loading" in auth context
    const loadingStateSet = (val: boolean) => {
        setLoading(val);
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
            <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 text-sm font-bold transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </button>

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/10">
                        <img src="/logo.png" alt="FitLeader" className="w-10 h-10 object-contain" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {userType === 'athlete' ? 'Acceso Atletas' : (isResetting ? 'Recupera tu acceso' : (isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'))}
                    </h1>
                    <p className="text-zinc-400">
                        {userType === 'athlete' ? 'Entra a tu plan de entrenamiento y nutrición.' : (isResetting ? 'Te enviaremos un enlace seguro.' : (isLogin ? 'Gestiona tu negocio fitness.' : 'Prueba FitLeader gratis 14 días.'))}
                    </p>
                </div>

                {/* Selector de tipo de usuario */}
                <div className="flex bg-zinc-900/80 border border-zinc-800 rounded-2xl p-1 mb-6 max-w-xs mx-auto">
                    <button
                        type="button"
                        onClick={() => { 
                            setUserType('coach'); 
                            setError(null); 
                            setMessage(null); 
                            setIsResetting(false);
                        }}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-300 ${
                            userType === 'coach'
                                ? 'bg-emerald-500 text-black shadow-lg'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Entrenador
                    </button>
                    <button
                        type="button"
                        onClick={() => { 
                            setUserType('athlete'); 
                            setError(null); 
                            setMessage(null); 
                            setIsLogin(true); 
                            setIsResetting(false);
                        }}
                        className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all duration-300 ${
                            userType === 'athlete'
                                ? 'bg-emerald-500 text-black shadow-lg'
                                : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        Atleta / Alumno
                    </button>
                </div>

                <div className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl backdrop-blur-xl">
                    <form onSubmit={handleAuth} className="space-y-5">
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
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-zinc-900/50 outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {!isResetting && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                        {userType === 'athlete' ? 'Código de Acceso' : 'Contraseña'}
                                    </label>
                                    {isLogin && userType === 'coach' && (
                                        <button 
                                            type="button"
                                            onClick={() => { setIsResetting(true); setError(null); setMessage(null); }}
                                            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                                        >
                                            ¿Has olvidado tu contraseña?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                                    <input 
                                        type="password" 
                                        required={!isResetting}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-black/50 border border-zinc-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-emerald-500 focus:bg-zinc-900/50 outline-none transition-all placeholder:text-zinc-700 font-mono tracking-wide"
                                        placeholder={userType === 'athlete' ? "FIT-XXXX" : "••••••••••••"}
                                    />
                                </div>
                            </div>
                        )}

                        {!isLogin && !isResetting && userType === 'coach' && (
                            <div className="flex items-start gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-xl">
                                <input 
                                    type="checkbox" 
                                    id="freelanceOnly"
                                    checked={isFreelanceOnly}
                                    onChange={(e) => setIsFreelanceOnly(e.target.checked)}
                                    className="w-4 h-4 text-emerald-500 bg-black border-zinc-800 rounded focus:ring-emerald-500 mt-1 cursor-pointer"
                                />
                                <label htmlFor="freelanceOnly" className="text-xs text-zinc-400 leading-normal cursor-pointer select-none">
                                    <span className="font-bold text-white block mb-0.5">Entrenador Freelance (Solo Marketplace)</span>
                                    Quiero registrarme gratis solo para buscar, reservar salas de gimnasios y publicitarme. No necesito el software SaaS de rutinas por ahora.
                                </label>
                            </div>
                        )}

                        <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]" disabled={loading}>
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isResetting ? 'Enviar enlace' : (isLogin ? (userType === 'athlete' ? 'Entrar a la App' : 'Entrar') : 'Crear Cuenta'))}
                        </Button>
                    </form>

                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        {userType === 'athlete' ? (
                            <p className="text-zinc-500 text-xs italic">
                                ¿No tienes código de acceso? Pídeselo directamente a tu entrenador.
                            </p>
                        ) : (
                            <p className="text-zinc-500 text-sm">
                                {isResetting ? (
                                    <button 
                                        onClick={() => { setIsResetting(false); setError(null); setMessage(null); }} 
                                        className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors ml-1"
                                    >
                                        Volver a iniciar sesión
                                    </button>
                                ) : (
                                    <>
                                        {isLogin ? "¿Aún no tienes cuenta? " : "¿Ya eres miembro? "}
                                        <button 
                                            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} 
                                            className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors ml-1"
                                        >
                                            {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                                        </button>
                                    </>
                                )}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;