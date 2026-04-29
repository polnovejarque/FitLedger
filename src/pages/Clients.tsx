import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { 
    Search, Filter, MoreVertical, 
    Target, AlertTriangle, Edit, Trash2,
    Loader2, Plus, X, User, Key 
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Clients = () => {
    const navigate = useNavigate(); 
    
    // ESTADOS
    const [clients, setClients] = useState<any[]>([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [studioId, setStudioId] = useState<string | null>(null);

    // Filtros y Búsqueda
    const [searchTerm, setSearchTerm] = useState("");
    
    // Menús y Modales
    const [openMenuId, setOpenMenuId] = useState<number | null>(null); 
    const [showNewClientModal, setShowNewClientModal] = useState(false); 
    const [isSaving, setIsSaving] = useState(false); 

    // Estados formulario nuevo cliente
    const [newClientName, setNewClientName] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientObjective, setNewClientObjective] = useState("");
    const [newClientLimitations, setNewClientLimitations] = useState("");

    // 1. Cargar Clientes al entrar
    useEffect(() => {
        fetchClients();
        
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Carga inteligente de clientes
    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, studio_id')
                .eq('id', user.id)
                .single();

            // LÓGICA CORREGIDA: Si tiene studio_id es empleado. Si no lo tiene, es su propio jefe (independiente).
            const currentStudioId = profile?.studio_id || user.id;
            setStudioId(currentStudioId);

            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('studio_id', currentStudioId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error cargando clientes:', error);
            } else {
                setClients(data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Guardar Cliente Nuevo
    const handleAddClient = async () => {
        if (!newClientName) { alert("El nombre es obligatorio."); return; }
        if (!newClientEmail) { alert("El email es obligatorio para crear su acceso a la app."); return; }
        
        setIsSaving(true);

        const { data: { user } } = await supabase.auth.getUser();

        // LÓGICA CORREGIDA: Solo falla si no hay usuario logueado en absoluto.
        if (!user) {
            alert("Error de sesión. Recarga la página.");
            setIsSaving(false);
            return;
        }

        // Por seguridad, aseguramos el ID del negocio en el último milisegundo
        const finalStudioId = studioId || user.id;

        // Generamos el código de acceso
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const generatedPassword = `FIT-${randomCode}`;

        try {
            // PASO 1: Guardamos en la BD con tu cuenta de Jefe
            const { error: dbError } = await supabase.from('clients').insert([{
                user_id: user.id, 
                studio_id: finalStudioId, 
                name: newClientName,
                email: newClientEmail,
                access_code: generatedPassword, 
                objective: newClientObjective || "Mejorar salud",
                limitations: newClientLimitations || "Ninguna",
                status: "Activo",
                plan: "Básico",
                location: "Presencial",
                image_url: null, 
                payment_status: 'pending'
            }]);

            if (dbError) throw dbError;

            // PASO 2: EL CLON FANTASMA (Crea la cuenta sin iniciar sesión)
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
            
            const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
                auth: { persistSession: false, autoRefreshToken: false }
            });

            // Registramos al atleta usando el clon
            const { error: authError } = await tempClient.auth.signUp({
                email: newClientEmail,
                password: generatedPassword,
            });

            if (authError) {
                console.error("Aviso Auth:", authError);
            }

            // ¡Éxito! Refrescamos y cerramos
            await fetchClients();
            setShowNewClientModal(false);
            setNewClientName("");
            setNewClientEmail("");
            setNewClientObjective("");
            setNewClientLimitations("");
            
        } catch (error: any) {
            alert("Error al guardar: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClient = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        if(!confirm("¿Seguro que quieres eliminar este cliente? Perderá el acceso a la app.")) return;

        const { error } = await supabase.from('clients').delete().eq('id', id);
        
        if (!error) {
            setClients(clients.filter(c => c.id !== id));
            setOpenMenuId(null);
        }
    };

    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        setOpenMenuId(openMenuId === id ? null : id);
    };

    // --- RENDER ---
    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans animate-in fade-in duration-500 relative">
            
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Cartera de Clientes</h1>
                    <p className="text-zinc-400 mt-1">Gestiona el progreso y accesos de los atletas del centro.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            type="text" 
                            placeholder="Buscar por nombre..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111] border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none transition-all focus:ring-1 focus:ring-emerald-500" 
                        />
                    </div>
                    <button className="p-2 border border-zinc-800 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    <Button onClick={() => setShowNewClientModal(true)} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 transition-colors">
                        <Plus className="w-4 h-4 mr-1" /> Nuevo Cliente
                    </Button>
                </div>
            </div>

            {/* TABLA DE CLIENTES */}
            <div className="bg-[#111] border border-zinc-800 rounded-2xl overflow-visible shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Atleta y Acceso</th>
                            <th className="px-6 py-4 hidden md:table-cell">Objetivo</th>
                            <th className="px-6 py-4">Estado</th>
                            <th className="px-6 py-4 hidden md:table-cell">Pago</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Cargando clientes...</td></tr>
                        ) : filteredClients.length > 0 ? (
                            filteredClients.map((client) => (
                                <tr 
                                    key={client.id} 
                                    onClick={() => navigate(`/dashboard/client/${client.id}`)} 
                                    className="hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {client.image_url ? (
                                                <img src={client.image_url} alt={client.name} className="w-10 h-10 rounded-full border border-zinc-800 object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full border border-zinc-800 bg-zinc-800 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-zinc-500" />
                                                </div>
                                            )}
                                            
                                            <div>
                                                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{client.name}</p>
                                                <p className="text-xs text-zinc-500 mb-0.5">{client.email}</p>
                                                {client.access_code && (
                                                    <p className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
                                                        <Key className="w-3 h-3" /> {client.access_code}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-3 h-3 text-zinc-500" />
                                            <span className="text-sm text-zinc-300">{client.objective}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${client.status === 'Activo' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {client.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden md:table-cell">
                                        {client.payment_status === 'paid' && <div className="w-2 h-2 rounded-full bg-emerald-500" title="Pagado"></div>}
                                        {client.payment_status === 'pending' && <div className="w-2 h-2 rounded-full bg-yellow-500" title="Pendiente"></div>}
                                        {client.payment_status === 'overdue' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Vencido"></div>}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="relative inline-block">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="hover:bg-zinc-800 relative z-10"
                                                onClick={(e) => toggleMenu(e, client.id)}
                                            >
                                                <MoreVertical className="w-4 h-4 text-zinc-500" />
                                            </Button>

                                            {openMenuId === client.id && (
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181b] border border-zinc-700 rounded-lg shadow-2xl z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                                                    <div className="p-1">
                                                        <button 
                                                            className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white rounded flex items-center gap-2 transition-colors"
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                navigate(`/dashboard/client/${client.id}`); 
                                                            }}
                                                        >
                                                            <Edit className="w-4 h-4" /> Ver Perfil Completo
                                                        </button>
                                                        <div className="h-[1px] bg-zinc-800 my-1"></div>
                                                        <button 
                                                            className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded flex items-center gap-2 transition-colors"
                                                            onClick={(e) => handleDeleteClient(e, client.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4" /> Eliminar Cliente
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 flex flex-col items-center justify-center w-full"><div className="mb-2">📭</div>No tienes clientes aún.<br/>Dale a "+ Nuevo Cliente" para empezar.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL NUEVO CLIENTE */}
            {showNewClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setShowNewClientModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
                        <h2 className="text-xl font-bold text-white mb-6">Añadir Nuevo Cliente</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-zinc-400 mb-1 block">Nombre Completo</label>
                                    <input autoFocus required type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="Ej: Juan Pérez" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-emerald-400 mb-1 block flex items-center gap-1"><Key className="w-3 h-3"/> Email para la App</label>
                                    <input required type="email" className="w-full bg-zinc-900 border border-emerald-900 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="juan@email.com" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
                                    <p className="text-[10px] text-zinc-500 mt-1">Con este email y el código que se generará, el cliente entrará a la app.</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-zinc-400 mb-1 block">Objetivo Principal</label>
                                    <div className="relative">
                                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                        <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-emerald-500 outline-none" placeholder="Ej: Hipertrofia..." value={newClientObjective} onChange={(e) => setNewClientObjective(e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-zinc-400 mb-1 block flex items-center gap-1">Limitaciones <span className="text-zinc-600">(Opcional)</span></label>
                                    <div className="relative">
                                        <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-500" />
                                        <input type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-orange-500 outline-none" placeholder="Ej: Dolor rodilla..." value={newClientLimitations} onChange={(e) => setNewClientLimitations(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                            <Button 
                                className="w-full bg-emerald-500 text-black hover:bg-emerald-400 mt-4 font-bold" 
                                onClick={handleAddClient}
                                disabled={isSaving}
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : <><Plus className="w-4 h-4 mr-2" /> Crear Cliente y Acceso</>}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;