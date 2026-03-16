import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Dumbbell, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';

const StaffRegister = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Extraemos el ID del estudio de la URL
    const studioId = searchParams.get('studio');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [studioName, setStudioName] = useState("un centro");

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Nada más cargar, buscamos cómo se llama el centro que le invita
    useEffect(() => {
        const fetchStudioInfo = async () => {
            if (!studioId) return;
            const { data } = await supabase
                .from('profiles')
                .select('business_name')
                .eq('id', studioId)
                .single();
            
            if (data?.business_name) {
                setStudioName(data.business_name);
            }
        };
        fetchStudioInfo();
    }, [studioId]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studioId) {
            setError("Enlace de invitación no válido.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Creamos la cuenta en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // 2. ACTUALIZAMOS SU PERFIL: Le ponemos rol de empleado y lo atamos a su jefe
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({ 
                        business_name: formData.name, 
                        role: 'staff',
                        studio_id: studioId,
                        subscription_plan: 'studio'
                    })
                    .eq('id', authData.user.id);

                if (profileError) throw profileError;

                // 3. ¡Todo listo! Lo mandamos a su nuevo panel
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || "Error al crear la cuenta. Inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!studioId) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <div className="bg-[#111] p-8 rounded-2xl border border-red-500/30 text-center max-w-md">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Enlace Inválido</h2>
                    <p className="text-zinc-400">Este enlace de invitación no es correcto o ha caducado. Pídele a tu manager que te envíe uno nuevo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4 relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            
            <div className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
                        <Dumbbell className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-center">Únete al equipo</h1>
                    <p className="text-zinc-400 text-center mt-2">
                        Has sido invitado a formar parte del staff de <strong className="text-white">{studioName}</strong>
                    </p>
                </div>

                <div className="bg-[#111] border border-zinc-800 rounded-2xl p-8 shadow-xl">
                    <form onSubmit={handleRegister} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        
                        <div>
                            <label className="text-xs text-zinc-400 mb-1 block">Tu Nombre Completo</label>
                            <input 
                                type="text" 
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors" 
                                placeholder="Ej: Carlos Coach" 
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs text-zinc-400 mb-1 block">Tu Email Profesional</label>
                            <input 
                                type="email" 
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors" 
                                placeholder="carlos@gimnasio.com" 
                            />
                        </div>

                        <div>
                            <label className="text-xs text-zinc-400 mb-1 block">Crea una Contraseña</label>
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors" 
                                placeholder="••••••••" 
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-emerald-500 text-black hover:bg-emerald-400 mt-6 font-bold h-12"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-5 h-5 mr-2" /> Crear cuenta y acceder</>}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StaffRegister;