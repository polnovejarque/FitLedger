import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// ✅ CORREGIDO: He quitado Calendar, Ruler, ChevronDown y ChevronUp
import { 
    ArrowLeft, Mail, MapPin, TrendingUp, AlertCircle, 
    Lock, Copy, Check, Loader2, CreditCard, 
    Scale, Camera, ImageIcon
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import PaymentLinkModal from '../components/PaymentLinkModal';
import EditClientModal from '../components/EditClientModal';
import ToastContainer from '../components/ui/ToastContainer';
import type { ToastProps } from '../components/ui/Toast';

const ClientProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // ID del cliente
    
    // --- ESTADOS PRINCIPALES ---
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // --- ESTADOS DE PROGRESO ---
    const [progressHistory, setProgressHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({
        startWeight: 0,
        currentWeight: 0,
        weightDiff: 0,
        startWaist: 0,
        currentWaist: 0,
        waistDiff: 0
    });
    const [photos, setPhotos] = useState<any[]>([]); 
    
    // --- UI STATES ---
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [copied, setCopied] = useState(false); 
    const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

    // --- CARGAR DATOS ---
    useEffect(() => {
        const fetchRealData = async () => {
            if (!id) return;
            setLoading(true);

            // 1. Datos del Cliente
            const { data: clientData, error } = await supabase
                .from('clients')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error al cargar cliente:", error);
                navigate('/dashboard/clients'); 
                return;
            }

            setClient({
                ...clientData,
                goals: clientData.goals || [], 
                limitations: clientData.limitations || []
            });

            // 2. Datos de Progreso
            const { data: progressData } = await supabase
                .from('client_progress')
                .select('*')
                .eq('client_id', id)
                .order('date', { ascending: false });

            if (progressData && progressData.length > 0) {
                setProgressHistory(progressData);

                const latest = progressData[0];
                const first = progressData[progressData.length - 1];

                setStats({
                    startWeight: first.weight || 0,
                    currentWeight: latest.weight || 0,
                    weightDiff: (latest.weight || 0) - (first.weight || 0),
                    startWaist: first.waist || 0,
                    currentWaist: latest.waist || 0,
                    waistDiff: (latest.waist || 0) - (first.waist || 0)
                });

                const extractedPhotos: any[] = [];
                progressData.forEach((entry: any) => {
                    if (entry.front_photo) extractedPhotos.push({ url: entry.front_photo, date: entry.date, type: 'Frontal' });
                    if (entry.back_photo) extractedPhotos.push({ url: entry.back_photo, date: entry.date, type: 'Espalda' });
                    if (entry.side_photo) extractedPhotos.push({ url: entry.side_photo, date: entry.date, type: 'Perfil' });
                });
                setPhotos(extractedPhotos);
            }

            setLoading(false);
        };
        fetchRealData();
    }, [id, navigate]);

    // --- FUNCIONES AUXILIARES ---
    const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const idToast = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id: idToast, message, type, onClose: (id) => setToasts(p => p.filter(t => t.id !== id)) }]);
    };

    const handleUpdateClient = async (updatedData: any) => {
        const { error } = await supabase.from('clients').update(updatedData).eq('id', id);
        if (!error) {
            setClient((prev: any) => ({ ...prev, ...updatedData }));
            setEditModalOpen(false);
            addToast('Perfil actualizado', 'success');
        } else {
            addToast('Error al actualizar', 'error');
        }
    };

    const copyCredentials = () => {
        const text = `Usuario: ${client.email}\nCódigo: ${client.access_code || '1234'}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addToast('Credenciales copiadas', 'success');
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="h-10 w-10 animate-spin text-emerald-500"/></div>;
    if (!client) return <div className="p-8 text-white">Cliente no encontrado</div>;

    const clientStats = {
        location: client.location || 'Ubicación no definida',
        joinDate: new Date(client.created_at).toLocaleDateString(),
    };

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/clients')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-white">{client.name}</h1>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {clientStats.location}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                    <Button variant="outline" onClick={() => setEditModalOpen(true)}>Editar Perfil</Button>
                    <Button variant="outline" className="gap-2" onClick={() => setPaymentModalOpen(true)}>
                        <CreditCard className="w-4 h-4" /> Link de Pago
                    </Button>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="border-b border-zinc-800">
                <div className="flex gap-6 overflow-x-auto">
                    {['overview', 'workouts', 'progress', 'finance'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={cn("pb-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap capitalize", activeTab === tab ? "border-emerald-500 text-emerald-500" : "border-transparent text-zinc-400 hover:text-white")}>
                            {tab === 'overview' ? 'Vista General' : tab === 'workouts' ? 'Rutinas' : tab === 'finance' ? 'Finanzas' : 'Progreso'}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- CONTENIDO --- */}
            <div className="mt-6">
                
                {/* --- VISTA GENERAL --- */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            {/* Credenciales */}
                            <Card className="border-blue-500/30 bg-blue-500/5 relative overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2 text-blue-400">
                                        <Lock className="w-4 h-4" /> Acceso App Atleta
                                    </CardTitle>
                                    <CardDescription className="text-blue-200/50">Credenciales para entrar en la App móvil.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 relative z-10">
                                    <div className="bg-[#000]/40 border border-blue-500/20 p-3 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-400">Usuario:</span>
                                            <span className="font-mono font-medium text-white select-all">{client.email}</span>
                                        </div>
                                        <div className="h-[1px] bg-blue-500/10" />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-400">Código Acceso:</span>
                                            <span className="font-mono font-bold text-lg tracking-widest text-blue-400 select-all">{client.access_code || '1234'}</span>
                                        </div>
                                    </div>
                                    <Button onClick={copyCredentials} variant="ghost" className="w-full gap-2 border border-blue-500/30 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300">
                                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "¡Copiado!" : "Copiar Credenciales"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Info Cliente */}
                            <Card className="bg-[#111] border-zinc-800">
                                <CardHeader><CardTitle className="text-white">Información Cliente</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><p className="text-zinc-500">Teléfono</p><p className="font-medium text-white">{client.phone || '-'}</p></div>
                                        <div><p className="text-zinc-500">Miembro desde</p><p className="font-medium text-white">{new Date(client.created_at).toLocaleDateString()}</p></div>
                                        <div><p className="text-zinc-500">Plan Actual</p><p className="font-medium text-white">{client.plan || 'Básico'}</p></div>
                                        <div><p className="text-zinc-500">Estado</p><span className="text-emerald-500 font-medium">Activo</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-6">
                            <Card className="bg-[#111] border-zinc-800">
                                <CardHeader><CardTitle className="text-white">Objetivos y Limitaciones</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-zinc-300"><TrendingUp className="w-4 h-4 text-emerald-500" /> Objetivos</h4>
                                        {client.goals && client.goals.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">{client.goals.map((g:string, i:number) => <li key={i}>{g}</li>)}</ul>
                                        ) : <p className="text-sm text-zinc-600 italic">Sin objetivos definidos.</p>}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-zinc-300"><AlertCircle className="w-4 h-4 text-red-500" /> Limitaciones</h4>
                                        {client.limitations && client.limitations.length > 0 ? (
                                            <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">{client.limitations.map((l:string, i:number) => <li key={i}>{l}</li>)}</ul>
                                        ) : <p className="text-sm text-zinc-600 italic">Sin limitaciones registradas.</p>}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* --- PROGRESO (Dashboard Coach) --- */}
                {activeTab === 'progress' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        
                        {/* Resumen Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-[#111] border-zinc-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Peso Inicio</p>
                                    <p className="text-2xl font-bold text-white">{stats.startWeight} kg</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#111] border-zinc-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Peso Actual</p>
                                    <p className="text-2xl font-bold text-white">{stats.currentWeight} kg</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#111] border-zinc-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Cambio Peso</p>
                                    <p className={cn("text-2xl font-bold", stats.weightDiff < 0 ? "text-emerald-500" : stats.weightDiff > 0 ? "text-red-500" : "text-white")}>
                                        {stats.weightDiff > 0 ? '+' : ''}{stats.weightDiff.toFixed(1)} kg
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#111] border-zinc-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Cintura</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-bold text-white">{stats.currentWaist} cm</p>
                                        <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", stats.waistDiff < 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400")}>
                                            {stats.waistDiff > 0 ? '+' : ''}{stats.waistDiff}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Galería Fotos */}
                        <Card className="bg-[#111] border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Camera className="w-5 h-5 text-emerald-500" /> Galería de Transformación
                                </CardTitle>
                                <CardDescription>Fotos subidas por el cliente desde la App.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {photos.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {photos.map((photo, index) => (
                                            <div key={index} className="group relative aspect-[3/4] bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer" onClick={() => setExpandedPhoto(photo.url)}>
                                                <img src={photo.url} alt="Progreso" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                                    <p className="text-white text-xs font-bold">{photo.type}</p>
                                                    <p className="text-zinc-400 text-[10px]">{new Date(photo.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                                        <p>No hay fotos subidas todavía.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tabla Historial */}
                        <Card className="bg-[#111] border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-blue-500" /> Historial de Registros
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {progressHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 border-b border-zinc-800">
                                                <tr>
                                                    <th className="px-4 py-3">Fecha</th>
                                                    <th className="px-4 py-3">Peso</th>
                                                    <th className="px-4 py-3">Cintura</th>
                                                    <th className="px-4 py-3">Fotos</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-800">
                                                {progressHistory.map((entry) => (
                                                    <tr key={entry.id} className="hover:bg-zinc-900/30 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-white">
                                                            {new Date(entry.date).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-zinc-300">
                                                            {entry.weight ? `${entry.weight} kg` : '-'}
                                                        </td>
                                                        <td className="px-4 py-3 text-zinc-300">
                                                            {entry.waist ? `${entry.waist} cm` : '-'}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex gap-2">
                                                                {entry.front_photo && <div className="w-2 h-2 rounded-full bg-emerald-500" title="Frontal"></div>}
                                                                {entry.back_photo && <div className="w-2 h-2 rounded-full bg-blue-500" title="Espalda"></div>}
                                                                {entry.side_photo && <div className="w-2 h-2 rounded-full bg-purple-500" title="Perfil"></div>}
                                                                {!entry.front_photo && !entry.back_photo && !entry.side_photo && <span className="text-zinc-600 text-xs">-</span>}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-zinc-500">Sin registros de peso.</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* --- OTROS TABS --- */}
                {activeTab !== 'overview' && activeTab !== 'progress' && (
                    <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        <p>Gestión de {activeTab} disponible próximamente.</p>
                    </div>
                )}
            </div>

            {/* --- ZOOM FOTO --- */}
            {expandedPhoto && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setExpandedPhoto(null)}>
                    <img src={expandedPhoto} alt="Zoom" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                    <button className="absolute top-4 right-4 text-white hover:text-zinc-300">
                        <span className="sr-only">Cerrar</span>
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            )}

            {/* MODALES */}
            <PaymentLinkModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} clientName={client.name} defaultAmount={150} />
            <EditClientModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} client={client} onUpdate={handleUpdateClient} />
            <ToastContainer toasts={toasts} onClose={() => {}} />
        </div>
    );
};

export default ClientProfile;