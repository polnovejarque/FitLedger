import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '../lib/supabase'; // <--- IMPORTANTE: Conexión con Supabase
import { 
    Search, Filter, MoreVertical, ChevronLeft, MapPin, Mail, 
    Camera, Ruler, TrendingUp, Dumbbell, 
    Download, X, Plus, Play, CheckCircle2, History, Flame,
    Target, AlertTriangle, Activity, Lock, Edit, Trash2,
    CreditCard, Copy, AlertCircle, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- DATOS DE FOTOS (Estos siguen siendo estáticos por ahora) ---
const CLIENT_PHOTOS_DATA = [
    { id: 1, type: 'Frontal', date: '01 Ene 2024', weight: '80.0kg', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=60&w=400' },
    { id: 2, type: 'Espalda', date: '01 Ene 2024', weight: '80.0kg', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=60&w=400' },
    { id: 3, type: 'Frontal', date: '15 Feb 2024', weight: '79.2kg', url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=60&w=400' },
    { id: 4, type: 'Perfil',  date: 'Hoy',        weight: '78.5kg', url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=60&w=400' },
];

// --- RUTINA ASIGNADA (Estática por ahora) ---
const CLIENT_ROUTINE = [
    { id: 1, title: "Sentadilla con Barra", sets: 4, reps: "10-12", last: "100kg x 8", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&auto=format&fit=crop&q=60" },
    { id: 2, title: "Peso Muerto Rumano", sets: 3, reps: "12-15", last: "80kg x 12", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=60&w=400" },
    { id: 3, title: "Prensa Inclinada", sets: 4, reps: "10", last: "140kg x 10", img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=60&w=400" },
];

const Clients = () => {
    const navigate = useNavigate(); 
    
    // CAMBIO 1: El estado inicial ya no son datos falsos, empieza vacío
    const [clients, setClients] = useState<any[]>([]); 
    const [isLoading, setIsLoading] = useState(true); // Para mostrar carga

    const [selectedClientId, setSelectedClientId] = useState<number | null>(null); 
    const [activeTab, setActiveTab] = useState<'resumen' | 'fotos' | 'metricas' | 'rutina'>('resumen');
    
    // Filtros y Búsqueda
    const [searchTerm, setSearchTerm] = useState("");
    const [photoFilter, setPhotoFilter] = useState<'Todos' | 'Frontal' | 'Espalda' | 'Perfil'>('Todos');
    
    // Menús, Modales y Estados
    const [openMenuId, setOpenMenuId] = useState<number | null>(null); 
    const [zoomedPhoto, setZoomedPhoto] = useState<string | null>(null); 
    const [showNewClientModal, setShowNewClientModal] = useState(false); 
    const [showPremiumTooltip, setShowPremiumTooltip] = useState(false);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [isSaving, setIsSaving] = useState(false); // Spinner al guardar

    // Estados formulario nuevo cliente
    const [newClientName, setNewClientName] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientObjective, setNewClientObjective] = useState("");
    const [newClientLimitations, setNewClientLimitations] = useState("");

    // --- LÓGICA CONECTADA A SUPABASE ---

    // 1. Cargar Clientes al entrar
    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setIsLoading(true);
        // Pedimos a Supabase todos los clientes de la tabla
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error cargando clientes:', error);
        } else {
            setClients(data || []);
        }
        setIsLoading(false);
    };

    // 2. Guardar Cliente Nuevo en la Nube
    const handleAddClient = async () => {
        if (!newClientName) return;
        setIsSaving(true);

        // Obtenemos el usuario actual (Entrenador)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            alert("Error: No estás identificado");
            setIsSaving(false);
            return;
        }

        // Insertamos en Supabase
        const { error } = await supabase.from('clients').insert([{
            user_id: user.id, // VINCULAMOS AL ENTRENADOR
            name: newClientName,
            email: newClientEmail || "sin-email@cliente.com",
            objective: newClientObjective || "Mejorar salud",
            limitations: newClientLimitations || "Ninguna",
            status: "Activo",
            plan: "Básico",
            location: "Remoto",
            image_url: `https://i.pravatar.cc/150?u=${Date.now()}`, // Avatar aleatorio
            payment_status: 'pending'
        }]);

        if (error) {
            alert("Error guardando: " + error.message);
        } else {
            // Si todo va bien, recargamos la lista y cerramos modal
            await fetchClients();
            setShowNewClientModal(false);
            setNewClientName("");
            setNewClientEmail("");
            setNewClientObjective("");
            setNewClientLimitations("");
        }
        setIsSaving(false);
    };

    const handleDeleteClient = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        if(!confirm("¿Seguro que quieres eliminar este cliente?")) return;

        // Borrar de Supabase
        const { error } = await supabase.from('clients').delete().eq('id', id);
        
        if (!error) {
            setClients(clients.filter(c => c.id !== id));
            setOpenMenuId(null);
            if(selectedClientId === id) setSelectedClientId(null);
        }
    };

    // --- EL RESTO DE FUNCIONES SIGUEN IGUAL ---
    
    // Cerrar menú si se hace click fuera
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleMenu = (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handlePremiumClick = () => {
        setShowPremiumTooltip(true);
        setTimeout(() => { setShowPremiumTooltip(false); }, 2500);
    };

    // GENERAR LINK (Ahora guarda en Supabase también)
    const generatePaymentLink = async (clientId: number) => {
        setIsGeneratingLink(true);
        const fakeLink = `https://buy.stripe.com/generated_link_${Math.floor(Math.random() * 10000)}`;

        // Guardamos el link en la base de datos
        const { error } = await supabase
            .from('clients')
            .update({ stripe_link: fakeLink })
            .eq('id', clientId);

        if (!error) {
            // Actualizamos la vista local
            const updatedClients = clients.map(c => {
                if (c.id === clientId) return { ...c, stripe_link: fakeLink };
                return c;
            });
            setClients(updatedClients);
        }
        setIsGeneratingLink(false);
    };

    const displayedPhotos = photoFilter === 'Todos' 
        ? CLIENT_PHOTOS_DATA 
        : CLIENT_PHOTOS_DATA.filter(p => p.type === photoFilter);


    // --- RENDER ---
    const renderClientList = () => (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Cartera de Clientes</h1>
                    <p className="text-zinc-400 mt-1">Gestiona el progreso y planes de tus atletas.</p>
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
                        + Nuevo
                    </Button>
                </div>
            </div>

            <div className="bg-[#111] border border-zinc-800 rounded-2xl overflow-visible shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Atleta</th>
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
                                <tr key={client.id} onClick={() => setSelectedClientId(client.id)} className="hover:bg-zinc-900/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={client.image_url || "https://i.pravatar.cc/150"} className="w-10 h-10 rounded-full border border-zinc-800" />
                                            <div>
                                                <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">{client.name}</p>
                                                <p className="text-xs text-zinc-500">{client.email}</p>
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
                                                            onClick={(e) => { e.stopPropagation(); }}
                                                        >
                                                            <Edit className="w-4 h-4" /> Editar Perfil
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
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500 flex flex-col items-center justify-center w-full"><div className="mb-2">📭</div>No tienes clientes aún.<br/>Dale a "+ Nuevo" para empezar.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showNewClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setShowNewClientModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
                        <h2 className="text-xl font-bold text-white mb-6">Añadir Nuevo Cliente</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-xs text-zinc-400 mb-1 block">Nombre Completo</label>
                                    <input autoFocus type="text" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="Ej: Juan Pérez" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-zinc-400 mb-1 block">Email</label>
                                    <input type="email" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" placeholder="juan@email.com" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} />
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
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : <><Plus className="w-4 h-4 mr-2" /> Crear Cliente</>}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderClientDetail = () => {
        // Obtenemos el cliente seleccionado de la lista real
        const client = clients.find(c => c.id === selectedClientId);
        
        if (!client) return <div>Cliente no encontrado</div>;

        const hasLimitations = client.limitations && client.limitations !== "Ninguna";

        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300 relative">
                <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedClientId(null)} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors"><ChevronLeft className="w-4 h-4" /> Volver a la lista</button>
                    <div className="flex gap-2 relative">
                        <div className="group relative">
                            <Button variant="outline" onClick={handlePremiumClick} className="border-zinc-800 text-zinc-500 bg-zinc-900/50 gap-2 hover:bg-zinc-900 transition-colors"><Lock className="w-3 h-3" /> Chat</Button>
                            {showPremiumTooltip && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-black text-white text-xs font-bold rounded-lg shadow-2xl border border-zinc-700 whitespace-nowrap z-50 animate-in fade-in zoom-in-95">💎 Disponible con el plan premium<div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-t border-l border-zinc-700 rotate-45"></div></div>
                            )}
                        </div>
                        <Button onClick={() => navigate('/dashboard/workouts')} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 gap-2"><Edit className="w-4 h-4" /> Editar Plan</Button>
                    </div>
                </div>

                <div className="bg-[#111] border border-zinc-800 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                        <div className="relative">
                            <img src={client.image_url || "https://i.pravatar.cc/150"} className="w-24 h-24 rounded-full border-4 border-[#111] shadow-2xl" />
                            <div className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-4 border-[#111] rounded-full"></div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-white mb-2">{client.name}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-zinc-400 mb-4">
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {client.location}</span>
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {client.email}</span>
                                <span className="flex items-center gap-1"><Activity className="w-4 h-4" /> Activo hoy</span>
                            </div>
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-300"><Target className="w-4 h-4 text-emerald-500" /><span className="font-medium">Objetivo:</span> {client.objective}</div>
                                {hasLimitations && <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-200"><AlertTriangle className="w-4 h-4 text-red-500" /><span className="font-medium text-red-400">Atención:</span> {client.limitations}</div>}
                            </div>
                            <div className="flex gap-1 justify-center md:justify-start bg-zinc-900/50 p-1 rounded-lg inline-flex border border-zinc-800">
                                {['resumen', 'fotos', 'metricas', 'rutina'].map((tab) => (
                                    <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'}`}>{tab}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {/* --- PESTAÑA RESUMEN (INCLUYE PAGOS CONECTADOS) --- */}
                    {(activeTab === 'resumen') && (
                        <>
                            {/* SECCIÓN PAGOS NUEVA */}
                            <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white rounded-lg">
                                        <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none"><path d="M14.9 17.5C14.9 16.2 16 15.3 18.2 15.3C20.8 15.3 22.8 15.8 24.3 16.4V11.6C22.7 11 20.6 10.7 18.3 10.7C12.8 10.7 9.1 13.6 9.1 17.8C9.1 23.3 16.7 24.3 16.7 26.6C16.7 27.9 15.3 29.1 12.8 29.1C9.8 29.1 7.5 28.3 5.7 27.5V32.6C7.8 33.4 10.4 33.8 12.9 33.8C18.9 33.8 22.6 30.8 22.6 26.3C22.6 20.3 14.9 19.4 14.9 17.5Z" fill="#635BFF"/></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Suscripción & Pagos</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs text-zinc-500 font-bold uppercase">Estado del Pago</p>
                                        {client.payment_status === 'paid' ? (
                                            <div className="flex items-center gap-2 text-emerald-400 font-bold"><CheckCircle2 className="w-5 h-5" /> Al día</div>
                                        ) : client.payment_status === 'overdue' ? (
                                            <div className="flex items-center gap-2 text-red-400 font-bold"><AlertCircle className="w-5 h-5" /> Vencido</div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-yellow-500 font-bold"><AlertCircle className="w-5 h-5" /> Pendiente</div>
                                        )}
                                        <p className="text-xs text-zinc-500 mt-1">Renovación: <span className="text-white">Mensual</span></p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase mb-2">Link de Pago (Stripe)</p>
                                        {client.stripe_link ? (
                                            <div className="flex gap-2 animate-in fade-in">
                                                <input type="text" readOnly value={client.stripe_link} className="bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs rounded px-3 py-2 w-full outline-none" />
                                                <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => alert("Link copiado")}><Copy className="w-4 h-4" /></Button>
                                            </div>
                                        ) : (
                                            <Button 
                                                className="w-full bg-white text-black hover:bg-zinc-200 font-bold text-xs h-9 transition-all" 
                                                onClick={() => generatePaymentLink(client.id)}
                                                disabled={isGeneratingLink}
                                            >
                                                {isGeneratingLink ? (
                                                    <><Loader2 className="w-3 h-3 mr-2 animate-spin" /> Generando...</>
                                                ) : (
                                                    <><CreditCard className="w-3 h-3 mr-2" /> Generar Link</>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* GRÁFICAS DE RESUMEN (EXISTENTES) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
                                    <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Dumbbell className="w-5 h-5 text-emerald-500" /> Rutina Actual</h3><span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">Fase Hipertrofia</span></div>
                                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">{CLIENT_ROUTINE.map((exercise) => (<div key={exercise.id} className="flex gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"><div className="w-16 h-16 bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden relative"><img src={exercise.img} className="w-full h-full object-cover opacity-70" /><div className="absolute inset-0 flex items-center justify-center"><Play className="w-6 h-6 text-white fill-white opacity-80" /></div></div><div className="flex-1"><h4 className="text-white font-bold text-sm">{exercise.title}</h4><div className="flex gap-2 text-xs text-zinc-400 mt-1"><span className="bg-black/30 px-1.5 py-0.5 rounded">{exercise.sets} Series</span><span className="bg-black/30 px-1.5 py-0.5 rounded">{exercise.reps} Reps</span></div><div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500"><History className="w-3 h-3" /> Último: {exercise.last}</div></div><div className="flex items-center"><CheckCircle2 className="w-5 h-5 text-zinc-700" /></div></div>))}</div>
                                </div>
                                <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><Flame className="w-5 h-5 text-purple-500" /> Rendimiento: Volumen</h3><p className="text-xs text-zinc-500 mb-6">Carga total movida por sesión (kg)</p>
                                    <div className="flex-1 w-full bg-zinc-900/30 rounded-xl flex items-end justify-between px-6 pb-6 pt-10 gap-4 border border-zinc-800">{[12500, 14200, 11000, 15500, 13800, 16200, 16500].map((vol, i) => (<div key={i} className="w-full bg-zinc-800 rounded-t-sm hover:bg-purple-500 transition-colors relative group h-full flex flex-col justify-end"><div className="w-full bg-zinc-700 group-hover:bg-purple-500 transition-colors rounded-t-sm" style={{ height: `${(vol / 20000) * 100}%` }} /><div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded border border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{vol.toLocaleString()} kg</div></div>))}</div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'fotos' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 lg:col-span-3">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Camera className="w-5 h-5 text-emerald-500" /> Galería de Progreso</h3>
                                    <div className="flex gap-2">{['Todos', 'Frontal', 'Espalda', 'Perfil'].map((type) => (<button key={type} onClick={() => setPhotoFilter(type as any)} className={`text-xs px-3 py-1 rounded transition-colors ${photoFilter === type ? 'bg-zinc-800 text-white border border-zinc-600' : 'bg-transparent border border-zinc-800 text-zinc-400 hover:text-white'}`}>{type}</button>))}</div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {displayedPhotos.map((photo) => (<div key={photo.id} className="space-y-2 group cursor-pointer" onClick={() => setZoomedPhoto(photo.url)}><div className="aspect-[3/4] bg-zinc-900 rounded-xl relative overflow-hidden border border-zinc-800 group-hover:border-emerald-500/50 transition-colors"><img src={photo.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" /><span className="absolute top-2 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded backdrop-blur-md">{photo.type}</span><span className="absolute bottom-2 left-2 text-[10px] text-zinc-300 bg-black/80 px-2 py-0.5 rounded backdrop-blur-md">{photo.date}</span></div><p className="text-center text-xs text-zinc-500">Peso: {photo.weight}</p></div>))}
                                    <div className="aspect-[3/4] bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/30 transition-all cursor-pointer"><Download className="w-8 h-8 mb-2" /><span className="text-xs">Solicitar Foto</span></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {(activeTab === 'metricas') && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 lg:col-span-2">
                                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-500" /> Evolución de Peso Corporal</h3>
                                <div className="h-64 flex items-end gap-2 w-full px-2">{[92.5, 91.0, 89.8, 88.5, 87.2, 86.0, 85.5, 84.0, 82.5, 81.0].map((h, i) => { const heightPercent = ((h - 80) / (95 - 80)) * 80 + 10; return (<div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer relative"><div className="w-full bg-zinc-800 rounded-t-md hover:bg-blue-500 transition-all relative group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]" style={{ height: `${heightPercent}%` }}><span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-500 text-white font-bold text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none whitespace-nowrap z-10">{h} kg</span></div><span className="text-[10px] text-zinc-600 text-center mt-3 pt-2 border-t border-zinc-800/50">S{i+1}</span></div>); })}</div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-[#111] border border-zinc-800 p-5 rounded-2xl"><div className="flex justify-between items-start mb-2"><span className="text-zinc-400 text-sm">Cintura</span><Ruler className="w-4 h-4 text-emerald-500" /></div><p className="text-3xl font-bold text-white">82 <span className="text-sm font-normal text-zinc-500">cm</span></p><div className="mt-2 flex items-center text-xs text-emerald-500 font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded">-12 cm (Total)</div></div>
                                <div className="bg-[#111] border border-zinc-800 p-5 rounded-2xl"><div className="flex justify-between items-start mb-2"><span className="text-zinc-400 text-sm">Brazo Derecho</span><Ruler className="w-4 h-4 text-blue-500" /></div><p className="text-3xl font-bold text-white">38 <span className="text-sm font-normal text-zinc-500">cm</span></p><div className="mt-2 flex items-center text-xs text-blue-500 font-bold bg-blue-500/10 w-fit px-2 py-1 rounded">+3 cm (Ganancia)</div></div>
                            </div>
                        </div>
                    )}
                    {(activeTab === 'rutina') && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
                                <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold text-white flex items-center gap-2"><Dumbbell className="w-5 h-5 text-emerald-500" /> Rutina Actual</h3><span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20">Fase Hipertrofia</span></div>
                                <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">{CLIENT_ROUTINE.map((exercise) => (<div key={exercise.id} className="flex gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"><div className="w-16 h-16 bg-zinc-800 rounded-lg flex-shrink-0 overflow-hidden relative"><img src={exercise.img} className="w-full h-full object-cover opacity-70" /><div className="absolute inset-0 flex items-center justify-center"><Play className="w-6 h-6 text-white fill-white opacity-80" /></div></div><div className="flex-1"><h4 className="text-white font-bold text-sm">{exercise.title}</h4><div className="flex gap-2 text-xs text-zinc-400 mt-1"><span className="bg-black/30 px-1.5 py-0.5 rounded">{exercise.sets} Series</span><span className="bg-black/30 px-1.5 py-0.5 rounded">{exercise.reps} Reps</span></div><div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500"><History className="w-3 h-3" /> Último: {exercise.last}</div></div><div className="flex items-center"><CheckCircle2 className="w-5 h-5 text-zinc-700" /></div></div>))}</div>
                            </div>
                        </div>
                    )}
                </div>

                {zoomedPhoto && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in" onClick={() => setZoomedPhoto(null)}><button className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 transition-colors"><X className="w-6 h-6" /></button><img src={zoomedPhoto} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl border border-zinc-800" onClick={(e) => e.stopPropagation()} /></div>
                )}
            </div>
        );
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans">
            {selectedClientId ? renderClientDetail() : renderClientList()}
        </div>
    );
};

export default Clients;