import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Shield, UserPlus, Copy, Trash2, 
    Loader2, CheckCircle2, User
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Team = () => {
    const [staff, setStaff] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [studioId, setStudioId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setStudioId(user.id); // El ID del admin es el ID del Studio

        // ⚠️ ARREGLO CRÍTICO: Quitamos el order('created_at') porque la tabla profiles no suele tener esa columna
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('studio_id', user.id)
            .eq('role', 'staff');

        if (error) {
            console.error("Error buscando al equipo:", error);
        }

        if (!error && data) {
            setStaff(data);
        }
        setIsLoading(false);
    };

    const handleCopyInviteLink = () => {
        if (!studioId) return;
        const inviteLink = `${window.location.origin}/register?studio=${studioId}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemoveStaff = async (staffId: string, staffName: string) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar a ${staffName} de tu equipo? Perderá el acceso inmediatamente.`)) return;

        // Para "despedirlo", le quitamos el studio_id y lo volvemos un usuario básico
        const { error } = await supabase
            .from('profiles')
            .update({ studio_id: staffId, role: 'admin' }) 
            .eq('id', staffId);

        if (!error) {
            setStaff(staff.filter(s => s.id !== staffId));
        } else {
            alert("Error al eliminar entrenador.");
        }
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans animate-in fade-in duration-500">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Mi Equipo</h1>
                    <p className="text-zinc-400 mt-1">Gestiona los accesos de los entrenadores de tu centro.</p>
                </div>
                
                {/* Zona de Invitación */}
                <div className="bg-[#111] border border-zinc-800 p-2 rounded-xl flex items-center gap-3 w-full md:w-auto">
                    <div className="px-3 py-1 bg-zinc-900 rounded-lg border border-zinc-800">
                        <p className="text-xs text-zinc-500 font-mono">.../register?studio={studioId?.substring(0,6)}...</p>
                    </div>
                    <Button 
                        onClick={handleCopyInviteLink}
                        className={`${copied ? 'bg-emerald-500 text-black hover:bg-emerald-500' : 'bg-white text-black hover:bg-zinc-200'} transition-all`}
                    >
                        {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                        {copied ? '¡Copiado!' : 'Enlace de Invitación'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tarjeta del Dueño (Tú) */}
                <div className="bg-gradient-to-br from-zinc-900 to-[#111] p-6 rounded-2xl border border-emerald-500/30 relative overflow-hidden shadow-lg shadow-emerald-500/5">
                    <div className="absolute top-0 right-0 p-4 bg-emerald-500/10 rounded-bl-2xl">
                        <Shield className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                        <User className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Tú (Dueño)</h3>
                    <p className="text-sm text-zinc-400 mt-1">Acceso total al negocio</p>
                    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                        ADMIN
                    </div>
                </div>

                {/* Tarjetas del Staff */}
                {isLoading ? (
                    <div className="col-span-full py-12 flex justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin"/></div>
                ) : (
                    staff.map((member) => (
                        <div key={member.id} className="bg-[#111] p-6 rounded-2xl border border-zinc-800 relative group hover:border-zinc-700 transition-all">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-4 overflow-hidden">
                                {member.logo_url ? <img src={member.logo_url} className="w-full h-full object-cover" alt="staff"/> : <User className="w-6 h-6 text-zinc-500" />}
                            </div>
                            <h3 className="text-xl font-bold text-white">{member.business_name || 'Entrenador'}</h3>
                            <p className="text-sm text-zinc-500 mt-1 truncate">{member.email || 'Empleado del Centro'}</p>
                            
                            <div className="mt-6 flex items-center justify-between">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-bold border border-zinc-700">
                                    STAFF
                                </span>
                                <button 
                                    onClick={() => handleRemoveStaff(member.id, member.business_name || 'este entrenador')}
                                    className="p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                    title="Revocar acceso"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {/* Tarjeta para añadir más */}
                <div 
                    onClick={handleCopyInviteLink}
                    className="bg-black border-2 border-dashed border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all min-h-[200px]"
                >
                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3">
                        <UserPlus className="w-6 h-6 text-zinc-400" />
                    </div>
                    <h3 className="text-white font-bold">Añadir Entrenador</h3>
                    <p className="text-xs text-zinc-500 mt-2 max-w-[200px]">Copia el enlace y envíaselo por WhatsApp o email.</p>
                </div>
            </div>
        </div>
    );
};

export default Team;