import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ClientHistoryModal from '../components/ClientHistoryModal';

import { 
    ArrowLeft, Mail, MapPin, AlertCircle, 
    Lock, Copy, Check, Loader2, CreditCard, 
    Scale, Camera, ImageIcon, Trophy, User, 
    CalendarDays, Dumbbell, Plus, Trash2, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import PaymentLinkModal from '../components/PaymentLinkModal';
import EditClientModal from '../components/EditClientModal';
import ToastContainer from '../components/ui/ToastContainer';
import type { ToastProps } from '../components/ui/Toast';

const DAYS_OF_WEEK = [
    { id: 1, name: 'Lunes' },
    { id: 2, name: 'Martes' },
    { id: 3, name: 'Miércoles' },
    { id: 4, name: 'Jueves' },
    { id: 5, name: 'Viernes' },
    { id: 6, name: 'Sábado' },
    { id: 7, name: 'Domingo' }
];

const ClientProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // --- ESTADOS ---
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    
    // Stats y Progreso
    const [progressHistory, setProgressHistory] = useState<any[]>([]);
    const [stats, setStats] = useState({
        startWeight: 0, currentWeight: 0, weightDiff: 0,
        startWaist: 0, currentWaist: 0, waistDiff: 0
    });
    const [photos, setPhotos] = useState<any[]>([]); 
    
    // --- NUEVOS ESTADOS: PLANIFICACIÓN SEMANAL ---
    const [coachRoutines, setCoachRoutines] = useState<any[]>([]);
    const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
    const [assigningDay, setAssigningDay] = useState<number | null>(null); // Controla el modal de asignar rutina

    // UI
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [copied, setCopied] = useState(false); 
    const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);
    const [showPremiumTooltip, setShowPremiumTooltip] = useState(false);

    // --- CARGA DE DATOS ---
    useEffect(() => {
        const fetchRealData = async () => {
            if (!id) return;
            setLoading(true);

            try {
                const { data: { user } } = await supabase.auth.getUser();

                // 1. Cliente
                const { data: clientData, error } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('id', id)
                    .maybeSingle();

                if (error || !clientData) {
                    navigate('/dashboard/clients'); 
                    return;
                }

                // Normalización de datos
                const safeGoals = Array.isArray(clientData.goals) 
                    ? clientData.goals 
                    : (clientData.goals ? [clientData.goals] : (clientData.objective ? [clientData.objective] : []));

                const safeLimitations = Array.isArray(clientData.limitations) 
                    ? clientData.limitations 
                    : (clientData.limitations ? [clientData.limitations] : []);

                setClient({
                    ...clientData,
                    goals: safeGoals,
                    limitations: safeLimitations
                });

                // 2. Progreso
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
                        weightDiff: (latest.weight && first.weight) ? (latest.weight - first.weight) : 0,
                        startWaist: first.waist || 0,
                        currentWaist: latest.waist || 0,
                        waistDiff: (latest.waist && first.waist) ? (latest.waist - first.waist) : 0
                    });

                    const extractedPhotos: any[] = [];
                    progressData.forEach((entry: any) => {
                        if (entry.front_photo) extractedPhotos.push({ url: entry.front_photo, date: entry.date, type: 'Frontal' });
                        if (entry.back_photo) extractedPhotos.push({ url: entry.back_photo, date: entry.date, type: 'Espalda' });
                        if (entry.side_photo) extractedPhotos.push({ url: entry.side_photo, date: entry.date, type: 'Perfil' });
                    });
                    setPhotos(extractedPhotos);
                } else {
                    setProgressHistory([]);
                    setPhotos([]);
                }

                // 3. Cargar las rutinas del Coach (Para el selector)
                if (user) {
                    const { data: routinesData } = await supabase
                        .from('routines')
                        .select('id, name, level')
                        .eq('coach_id', user.id);
                    if (routinesData) setCoachRoutines(routinesData);
                }

                // 4. Cargar la Planificación Semanal actual del cliente
                const { data: planData } = await supabase
                    .from('client_weekly_plan')
                    .select('id, day_of_week, routine_id, routines(name)')
                    .eq('client_id', id);
                if (planData) setWeeklyPlan(planData);

            } catch (err) {
                console.error("Excepción:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRealData();
    }, [id, navigate]);

    // --- FUNCIONES PLANIFICACIÓN SEMANAL ---
    const handleAssignRoutine = async (routineId: number) => {
        if (!assigningDay || !id) return;
        
        // Asignamos la rutina al día seleccionado en Supabase
        const { data, error } = await supabase.from('client_weekly_plan').insert({
            client_id: id,
            routine_id: routineId,
            day_of_week: assigningDay
        }).select('id, day_of_week, routine_id, routines(name)').single();

        if (error) {
            addToast('Error al asignar rutina', 'error');
            console.error(error);
        } else if (data) {
            setWeeklyPlan([...weeklyPlan, data]);
            setAssigningDay(null); // Cerramos el modal
            addToast('Rutina asignada al plan', 'success');
        }
    };

    const handleRemoveRoutineFromPlan = async (planId: number) => {
        const { error } = await supabase.from('client_weekly_plan').delete().eq('id', planId);
        if (!error) {
            setWeeklyPlan(weeklyPlan.filter(p => p.id !== planId));
            addToast('Rutina eliminada del día', 'info');
        }
    };

    // --- FUNCIONES AUXILIARES ---
    const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const idToast = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id: idToast, message, type, onClose: (id: string) => setToasts(p => p.filter(t => t.id !== id)) }]);
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

    const handleConvertToClient = async () => {
        const { error } = await supabase.from('clients').update({ status: 'active' }).eq('id', id);
        if (!error) {
            setClient((prev: any) => ({ ...prev, status: 'active' }));
            addToast('Cliente convertido exitosamente', 'success');
        } else {
            addToast('Error al convertir cliente', 'error');
        }
    };

    const copyCredentials = () => {
        if (!client) return;
        const text = `Usuario: ${client.email}\nCódigo: ${client.access_code || '1234'}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addToast('Credenciales copiadas', 'success');
    };

    const handlePremiumClick = () => {
        setShowPremiumTooltip(true);
        setTimeout(() => setShowPremiumTooltip(false), 3000);
    };

    const formatDateSafe = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        try { return new Date(dateString).toLocaleDateString(); } catch { return 'N/A'; }
    };

    if (loading) return <div className="flex h-screen items-center justify-center bg-black text-white"><Loader2 className="h-10 w-10 animate-spin text-emerald-500"/></div>;
    if (!client) return null;

    const displayImage = client.image_url; 

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500">
            
            {/* --- HEADER --- */}
            <div className="space-y-4">
                <button onClick={() => navigate('/dashboard/clients')} className="flex items-center gap-2 text-zinc-500 hover:text-white text-sm transition-colors mb-2">
                    <ArrowLeft className="w-4 h-4" /> Volver a la lista
                </button>

                <div className="bg-[#111] border border-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-40 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex flex-col md:flex-row gap-6 w-full">
                            <div className="relative flex-shrink-0 mx-auto md:mx-0">
                                <div className="w-24 h-24 rounded-full border-4 border-zinc-900 shadow-xl overflow-hidden bg-zinc-800 flex items-center justify-center">
                                    {displayImage ? (
                                        <img src={displayImage} alt={client.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-zinc-500" />
                                    )}
                                </div>
                                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-[#111] rounded-full" title="Activo"></div>
                            </div>

                            <div className="text-center md:text-left space-y-2 flex-1">
                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                    <h1 className="text-3xl font-bold text-white">{client.name}</h1>
                                    {client.status === 'lead' && (
                                        <span className="px-3 py-1 text-sm font-bold bg-blue-500 text-white rounded-full">
                                            Invitado
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm text-zinc-400">
                                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {client.location || 'Remoto'}</span>
                                    <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {client.email}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span>Miembro desde {formatDateSafe(client.created_at)}</span>
                                </div>

                                <div className="pt-2 flex justify-center md:justify-start">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg text-sm">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-zinc-400 font-medium">Objetivo:</span>
                                        <span className="text-white font-bold">{client.goals?.[0] || client.objective || "Sin definir"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center md:justify-end w-full md:w-auto flex-shrink-0">
                            <div className="relative">
                                <Button 
                                    variant="outline" 
                                    className="h-9 border-zinc-700 bg-zinc-800/50 text-zinc-500 gap-2 cursor-not-allowed hover:bg-zinc-800 transition-colors" 
                                    onClick={handlePremiumClick}
                                >
                                    <Lock className="w-4 h-4" /> Chat
                                </Button>
                                
                                {showPremiumTooltip && (
                                    <div className="absolute top-full right-0 mt-2 w-max px-3 py-2 bg-black border border-zinc-700 rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-1">
                                        <p className="text-xs font-bold text-white flex items-center gap-1">
                                            💎 Disponible con el plan Premium
                                        </p>
                                        <div className="absolute -top-1 right-6 w-2 h-2 bg-black border-t border-l border-zinc-700 rotate-45"></div>
                                    </div>
                                )}
                            </div>
                            {client.status === 'lead' && (
                                <Button 
                                    className="h-9 bg-blue-500 text-white hover:bg-blue-600 font-bold gap-2" 
                                    onClick={handleConvertToClient}
                                >
                                    Convertir a Cliente
                                </Button>
                            )}
                            <Button className="h-9 bg-emerald-500 text-black hover:bg-emerald-400 font-bold gap-2" onClick={() => setEditModalOpen(true)}>
                                Editar Perfil
                            </Button>
                        </div>
                    </div>

                    {/* TABS */}
                    <div className="mt-10 pt-1 border-t border-zinc-800/50 flex flex-wrap gap-2 justify-center md:justify-start">
                        {['overview', 'workouts', 'progress', 'finance'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    activeTab === tab 
                                        ? "bg-zinc-800 text-white shadow-sm" 
                                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
                                )}
                            >
                                {tab === 'overview' ? 'Resumen' : tab === 'workouts' ? 'Plan Semanal' : tab === 'finance' ? 'Finanzas' : 'Fotos y Métricas'}
                            </button>
                        ))}
                        
                        <div className="ml-auto flex gap-2 hidden md:flex">
                            <button onClick={() => setHistoryModalOpen(true)} className="px-3 py-2 text-xs font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors">
                                <Trophy className="w-3.5 h-3.5" /> Ver Historial
                            </button>
                            <button onClick={() => setPaymentModalOpen(true)} className="px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors">
                                <CreditCard className="w-3.5 h-3.5" /> Link Pago
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENIDO --- */}
            <div className="mt-6">
                
                {/* PESTAÑA 1: RESUMEN */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <Card className="border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex items-center gap-2 text-blue-400">
                                        <Lock className="w-4 h-4" /> Acceso App Atleta
                                    </CardTitle>
                                    <CardDescription className="text-blue-200/40">Credenciales para entrar en la App móvil.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 relative z-10">
                                    <div className="bg-[#050505] border border-blue-500/20 p-3 rounded-lg space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500">Usuario:</span>
                                            <span className="font-mono font-medium text-white select-all">{client.email}</span>
                                        </div>
                                        <div className="h-[1px] bg-blue-500/10" />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-zinc-500">Código:</span>
                                            <span className="font-mono font-bold text-lg tracking-widest text-blue-400 select-all">{client.access_code || '1234'}</span>
                                        </div>
                                    </div>
                                    <Button onClick={copyCredentials} variant="ghost" className="w-full gap-2 border border-blue-500/20 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 h-9 text-xs">
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? "¡Copiado!" : "Copiar Credenciales"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-6">
                            <Card className="bg-[#111] border-zinc-800">
                                <CardHeader><CardTitle className="text-white text-base">Detalles del Plan</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Limitaciones / Lesiones</h4>
                                        {client.limitations && client.limitations.length > 0 && client.limitations[0] !== "Ninguna" ? (
                                            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                                <ul className="text-sm text-red-200 space-y-1">
                                                    {client.limitations.map((l: string, i: number) => <li key={i}>{l}</li>)}
                                                </ul>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-zinc-600 italic flex items-center gap-2"><Check className="w-4 h-4" /> Sin limitaciones registradas.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* PESTAÑA 2: PLANIFICACIÓN SEMANAL (NUEVO) */}
                {activeTab === 'workouts' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <CalendarDays className="w-6 h-6 text-emerald-500" /> Planificación Semanal
                                </h2>
                                <p className="text-zinc-400 text-sm mt-1">Organiza qué rutinas debe hacer el atleta cada día.</p>
                            </div>
                        </div>

                        {/* CALENDARIO SEMANAL */}
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {DAYS_OF_WEEK.map((day) => {
                                const routinesForDay = weeklyPlan.filter(plan => plan.day_of_week === day.id);
                                
                                return (
                                    <Card key={day.id} className="bg-[#111] border-zinc-800 flex flex-col h-full min-h-[200px]">
                                        <CardHeader className="p-3 bg-zinc-900/50 border-b border-zinc-800">
                                            <CardTitle className="text-sm text-center text-zinc-300 font-bold uppercase tracking-wider">{day.name}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-3 flex-1 flex flex-col gap-2 relative">
                                            
                                            {/* Rutinas Asignadas */}
                                            {routinesForDay.map(plan => (
                                                <div key={plan.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-2 flex justify-between items-center group transition-colors hover:border-emerald-500/50">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <Dumbbell className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                                        <span className="text-xs text-white font-medium truncate">{plan.routines?.name}</span>
                                                    </div>
                                                    <button onClick={() => handleRemoveRoutineFromPlan(plan.id)} className="text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}

                                            {routinesForDay.length === 0 && (
                                                <div className="flex-1 flex items-center justify-center">
                                                    <p className="text-[10px] text-zinc-600 font-medium italic">Día de descanso</p>
                                                </div>
                                            )}

                                            {/* Botón Añadir */}
                                            <button 
                                                onClick={() => setAssigningDay(day.id)}
                                                className="mt-auto w-full py-2 border border-dashed border-zinc-700 rounded-lg text-xs font-bold text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/5 hover:border-emerald-500/30 transition-all flex items-center justify-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Asignar
                                            </button>

                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PESTAÑA 3: PROGRESO */}
                {activeTab === 'progress' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="bg-[#111] border-zinc-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Peso Inicio</p>
                                    <p className="text-2xl font-bold text-white">{stats.startWeight > 0 ? `${stats.startWeight} kg` : '-'}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-[#111] border-zinc-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                    <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Peso Actual</p>
                                    <p className="text-2xl font-bold text-white">{stats.currentWeight > 0 ? `${stats.currentWeight} kg` : '-'}</p>
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
                                        <p className="text-xl font-bold text-white">{stats.currentWaist > 0 ? `${stats.currentWaist} cm` : '-'}</p>
                                        <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded", stats.waistDiff < 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-400")}>
                                            {stats.waistDiff > 0 ? '+' : ''}{stats.waistDiff}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

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
                                                    <p className="text-zinc-400 text-[10px]">{formatDateSafe(photo.date)}</p>
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
                                                        <td className="px-4 py-3 font-medium text-white">{formatDateSafe(entry.date)}</td>
                                                        <td className="px-4 py-3 text-zinc-300">{entry.weight ? `${entry.weight} kg` : '-'}</td>
                                                        <td className="px-4 py-3 text-zinc-300">{entry.waist ? `${entry.waist} cm` : '-'}</td>
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

                {activeTab === 'finance' && (
                    <div className="text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        <p>Gestión de Finanzas disponible próximamente.</p>
                    </div>
                )}
            </div>

            {/* --- MODAL PARA ASIGNAR RUTINAS AL DÍA --- */}
            {assigningDay && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-sm rounded-2xl relative shadow-2xl animate-in zoom-in-95 overflow-hidden">
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                            <div>
                                <h3 className="text-lg font-bold text-white">Asignar Rutina</h3>
                                <p className="text-xs text-emerald-500">Para el {DAYS_OF_WEEK.find(d => d.id === assigningDay)?.name}</p>
                            </div>
                            <button onClick={() => setAssigningDay(null)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {coachRoutines.length > 0 ? (
                                coachRoutines.map(routine => (
                                    <button 
                                        key={routine.id} 
                                        onClick={() => handleAssignRoutine(routine.id)}
                                        className="w-full text-left p-3 hover:bg-zinc-800 rounded-lg flex items-center justify-between group transition-colors"
                                    >
                                        <div>
                                            <p className="text-sm font-bold text-white">{routine.name}</p>
                                            <p className="text-[10px] text-zinc-500">{routine.level}</p>
                                        </div>
                                        <Plus className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))
                            ) : (
                                <div className="p-6 text-center text-sm text-zinc-500">
                                    <Dumbbell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    No tienes rutinas creadas en tu catálogo. Ve a la pestaña de Entrenamientos para crear la primera.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ZOOM FOTO */}
            {expandedPhoto && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setExpandedPhoto(null)}>
                    <img src={expandedPhoto} alt="Zoom" className="max-w-full max-h-[90vh] rounded-lg shadow-2xl" />
                    <button className="absolute top-4 right-4 text-white hover:text-zinc-300">
                        <span className="sr-only">Cerrar</span>
                        <X className="w-8 h-8" />
                    </button>
                </div>
            )}

            {/* MODALES EXTRAS */}
            {historyModalOpen && (
                <ClientHistoryModal clientId={id || ''} clientName={client.name} onClose={() => setHistoryModalOpen(false)} />
            )}
            <PaymentLinkModal isOpen={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} clientName={client.name} defaultAmount={150} />
            <EditClientModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} client={client} onUpdate={handleUpdateClient} />
            <ToastContainer toasts={toasts} onClose={() => {}} />
        </div>
    );
};

export default ClientProfile;