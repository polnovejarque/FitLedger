import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Home, ClipboardList, TrendingUp, User, LogOut, Flame, 
    Calendar as CalendarIcon, Trophy, Activity, Dumbbell,
    Bell, Settings, ChevronRight, Plus, Scale, X, Camera, Ruler, Trash2, Upload, RefreshCw,
    ArrowDownRight, ArrowUpRight, Minus, ArrowLeft, Check, Clock, Play
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- COMPONENTE PRINCIPAL APP CLIENTE ---
const ClientWorkout = () => {
    // --- ESTADOS DE DATOS ---
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState("Atleta");
    const [email, setEmail] = useState("");
    const [todayWorkout, setTodayWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // --- NUEVO: ESTADOS PARA LOS EJERCICIOS Y LOGS ---
    const [exercises, setExercises] = useState<any[]>([]);
    const [viewingExercises, setViewingExercises] = useState(false);
    const [loadingExercises, setLoadingExercises] = useState(false);
    const [currentDayFilter, ] = useState("Día 1"); // Filtro por defecto
    
    // Estado complejo para guardar los inputs de cada serie
    const [workoutLogs, setWorkoutLogs] = useState<any>({}); 

    // Estado del Progreso (Datos)
    const [currentWeight, setCurrentWeight] = useState<string>("--");
    const [currentWaist, setCurrentWaist] = useState<string>("--");
    const [currentArm, setCurrentArm] = useState<string>("--");
    const [progressHistory, setProgressHistory] = useState<any[]>([]);
    
    // ESTADOS PARA EL RESUMEN DE TRANSFORMACIÓN
    const [statsDiff, setStatsDiff] = useState({
        weight: 0,
        waist: 0,
        arm: 0
    });

    // CONTADOR MENSUAL
    const [monthlyWorkouts, setMonthlyWorkouts] = useState(0);
    
    // ESTADO DE COMPARACIÓN (FOTOS)
    const [viewAngle, setViewAngle] = useState<'front' | 'back' | 'side'>('front');
    const [photos, setPhotos] = useState<{
        front: { before: string | null; now: string | null; beforeId: string | null };
        back: { before: string | null; now: string | null; beforeId: string | null };
        side: { before: string | null; now: string | null; beforeId: string | null };
    }>({
        front: { before: null, now: null, beforeId: null },
        back: { before: null, now: null, beforeId: null },
        side: { before: null, now: null, beforeId: null }
    });

    // --- ESTADOS DE UI ---
    const [activeTab, setActiveTab] = useState<'inicio' | 'rutina' | 'racha' | 'progreso' | 'perfil'>('inicio');
    const [activeProfileModal, setActiveProfileModal] = useState<'notifications' | 'settings' | null>(null);
    const [showCheckinModal, setShowCheckinModal] = useState(false); // Modal Registro Datos
    const [showPhotoModal, setShowPhotoModal] = useState(false); // Modal Subida Fotos

    // Formulario Check-in
    const [formWeight, setFormWeight] = useState("");
    const [formWaist, setFormWaist] = useState("");
    const [formArm, setFormArm] = useState("");
    const [saving, setSaving] = useState(false);

    // --- ESTADOS SUBIDA DE FOTO ---
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- CARGAR DATOS ---
    useEffect(() => {
        const fetchClientData = async () => {
            setLoading(true);

            // 1. RECUPERAR SESIÓN DEL ATLETA
            const storedEmail = localStorage.getItem('fit_client_email');
            const emailToSearch = storedEmail;

            if (emailToSearch) {
                const { data: clientData } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('email', emailToSearch) 
                    .single();
                
                if (clientData) {
                    setClientId(clientData.id);
                    setClientName(clientData.name.split(' ')[0]);
                    setEmail(clientData.email);

                    // CARGAR RUTINA HOY
                    const localDate = new Date();
                    const today = localDate.toISOString().split('T')[0];
                    
                    // Usamos '!fk_routine' para decirle a Supabase EXACTAMENTE qué relación usar
                    const { data: assignment } = await supabase
                        .from('routine_assignments')
                        .select(`*, routine:routines!fk_routine (id, name, description)`) 
                        .eq('client_id', clientData.id)
                        .eq('scheduled_date', today)
                        .maybeSingle();

                    if (assignment && assignment.routine) {
                        setTodayWorkout(assignment.routine);
                    }

                    // CARGAR PROGRESO & RACHA
                    fetchProgress(clientData.id);
                    fetchMonthlyWorkouts(clientData.id);
                }
            }
            setLoading(false);
        };
        fetchClientData();
    }, []);

    // --- FUNCION PARA EMPEZAR ENTRENAMIENTO (CARGAR EJERCICIOS) ---
    const handleStartWorkout = async () => {
        if (!todayWorkout) return;
        setLoadingExercises(true);
        
        // Consultamos la tabla 'routine_exercises'
        const { data, error } = await supabase
            .from('routine_exercises')
            .select('*')
            .eq('routine_id', todayWorkout.id)
            .order('id', { ascending: true });

        if (error) {
            alert("Error cargando ejercicios: " + error.message);
        } else {
            setExercises(data || []);
            setViewingExercises(true); // Entrar al modo "Batalla"
            setActiveTab('rutina');
        }
        setLoadingExercises(false);
    };

    // --- MANEJO DE LOGS (INPUTS) ---
    const handleLogChange = (exerciseId: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        setWorkoutLogs((prev: any) => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                [setIndex]: {
                    ...prev[exerciseId]?.[setIndex],
                    [field]: value
                }
            }
        }));
    };

    const toggleSetComplete = (exerciseId: number, setIndex: number) => {
        setWorkoutLogs((prev: any) => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                [setIndex]: {
                    ...prev[exerciseId]?.[setIndex],
                    done: !prev[exerciseId]?.[setIndex]?.done
                }
            }
        }));
    };

    // --- FUNCION PARA CONTAR ENTRENOS DEL MES ---
    const fetchMonthlyWorkouts = async (id: string) => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const { count } = await supabase
            .from('routine_assignments')
            .select('*', { count: 'exact', head: true })
            .eq('client_id', id)
            .eq('completed', true)
            .gte('scheduled_date', firstDay)
            .lte('scheduled_date', lastDay);

        setMonthlyWorkouts(count || 0);
    };

    // --- LOGICA INTELIGENTE DE DATOS ---
    const fetchProgress = async (id: string) => {
        const { data: history } = await supabase
            .from('client_progress')
            .select('*')
            .eq('client_id', id)
            .order('date', { ascending: true }); 

        if (history && history.length > 0) {
            setProgressHistory([...history].reverse());
            
            const first = history[0];
            const latest = history[history.length - 1];
            
            setCurrentWeight(latest.weight || "--");
            setCurrentWaist(latest.waist || "--");
            setCurrentArm(latest.arm || "--");

            setStatsDiff({
                weight: latest.weight && first.weight ? (latest.weight - first.weight) : 0,
                waist: latest.waist && first.waist ? (latest.waist - first.waist) : 0,
                arm: latest.arm && first.arm ? (latest.arm - first.arm) : 0
            });

            const findPhotos = (angleKey: 'front_photo' | 'back_photo' | 'side_photo') => {
                const validPhotos = history.filter(h => h[angleKey] !== null);
                if (validPhotos.length === 0) return { before: null, now: null, beforeId: null };
                
                return {
                    before: validPhotos[0][angleKey], 
                    beforeId: validPhotos[0].id, 
                    now: validPhotos.length > 1 ? validPhotos[validPhotos.length - 1][angleKey] : null 
                };
            };

            setPhotos({
                front: findPhotos('front_photo'),
                back: findPhotos('back_photo'),
                side: findPhotos('side_photo')
            });
        }
    };

    // --- GUARDAR DATOS ---
    const handleSaveCheckin = async () => {
        if (!clientId) {
            alert("⚠️ Error: No se ha cargado tu ID de usuario.");
            return;
        }
        if (!formWeight && !formWaist && !formArm) {
            alert("⚠️ Por favor, introduce al menos un dato.");
            return;
        }
        
        setSaving(true);

        try {
            const today = new Date().toISOString().split('T')[0];
            const weightVal = formWeight ? parseFloat(formWeight) : null;
            const waistVal = formWaist ? parseFloat(formWaist) : null;
            const armVal = formArm ? parseFloat(formArm) : null;

            const { data: existingEntry, error: fetchError } = await supabase
                .from('client_progress')
                .select('id')
                .eq('client_id', clientId)
                .eq('date', today)
                .maybeSingle();

            if (fetchError) throw fetchError;

            let error = null;

            if (existingEntry) {
                const updatePayload: any = {};
                if (weightVal !== null) updatePayload.weight = weightVal;
                if (waistVal !== null) updatePayload.waist = waistVal;
                if (armVal !== null) updatePayload.arm = armVal;

                const { error: updateError } = await supabase
                    .from('client_progress')
                    .update(updatePayload)
                    .eq('id', existingEntry.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('client_progress')
                    .insert({
                        client_id: clientId,
                        date: today,
                        weight: weightVal,
                        waist: waistVal,
                        arm: armVal
                    });
                error = insertError;
            }

            if (error) throw error;

            alert("✅ ¡Datos registrados correctamente!");
            setShowCheckinModal(false);
            setFormWeight("");
            setFormWaist("");
            setFormArm("");
            fetchProgress(clientId);

        } catch (err: any) {
            alert("❌ Error al guardar: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    // --- SUBIR FOTO ---
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileToUpload(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleUploadPhoto = async () => {
        if (!fileToUpload || !clientId) return;
        setUploading(true);

        try {
            const fileExt = fileToUpload.name.split('.').pop();
            const fileName = `${clientId}/${Date.now()}_${viewAngle}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage.from('progress').upload(fileName, fileToUpload);
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from('progress').getPublicUrl(fileName);
            const today = new Date().toISOString().split('T')[0];
            const { data: existingToday } = await supabase.from('client_progress').select('id').eq('client_id', clientId).eq('date', today).maybeSingle();

            const photoColumn = viewAngle === 'front' ? 'front_photo' : viewAngle === 'back' ? 'back_photo' : 'side_photo';
            const updateData = { [photoColumn]: publicUrl };

            if (existingToday) {
                await supabase.from('client_progress').update(updateData).eq('id', existingToday.id);
            } else {
                await supabase.from('client_progress').insert({ client_id: clientId, date: today, ...updateData });
            }

            alert("¡Foto guardada! 📸");
            setShowPhotoModal(false);
            setFileToUpload(null);
            setPreviewUrl(null);
            fetchProgress(clientId);

        } catch (error: any) {
            alert("Error: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteBefore = async () => {
        const currentData = photos[viewAngle];
        if (!currentData.beforeId) return;
        if (!confirm("¿Borrar esta foto antigua?")) return;
        const photoColumn = viewAngle === 'front' ? 'front_photo' : viewAngle === 'back' ? 'back_photo' : 'side_photo';
        await supabase.from('client_progress').update({ [photoColumn]: null }).eq('id', currentData.beforeId);
        fetchProgress(clientId!);
    };

    const handleLogout = () => {
        if(confirm("¿Cerrar sesión?")) {
            localStorage.removeItem('fit_client_email');
            window.location.href = "/client-login";
        }
    };

    // --- RENDERIZADO DEL MODO ENTRENAMIENTO (BATALLA) ---
    const renderWorkoutView = () => {
        // Filtramos ejercicios por día si es necesario (asumiendo que tu tabla tiene 'day_name')
        const dailyExercises = exercises.filter(ex => ex.day_name === currentDayFilter);
        const displayExercises = dailyExercises.length > 0 ? dailyExercises : exercises;

        return (
            <div className="min-h-screen bg-black pb-32 animate-in fade-in">
                {/* HEADER CON IMAGEN DE FONDO */}
                <div className="relative h-64 w-full">
                    <img 
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
                        className="w-full h-full object-cover opacity-60"
                        alt="Header"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black"></div>
                    
                    <div className="absolute top-6 left-4 z-20">
                        <button onClick={() => setViewingExercises(false)} className="bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/10 text-white hover:bg-black/70 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{currentDayFilter}</span>
                            <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-white/10">SEMANA 1</span>
                        </div>
                        <h1 className="text-3xl font-black text-white leading-tight mb-2">{todayWorkout.name}</h1>
                        <div className="flex items-center gap-4 text-xs font-medium text-emerald-400">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> 60 min</span>
                            <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5"/> 450 kcal</span>
                        </div>
                    </div>
                </div>

                {/* LISTA DE EJERCICIOS */}
                <div className="px-4 -mt-4 relative z-30 space-y-4">
                    {displayExercises.map((ex, index) => (
                        <div key={ex.id || index} className="bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                            {/* CABECERA DEL EJERCICIO */}
                            <div className="p-4 flex gap-4 border-b border-zinc-800/50">
                                <div className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 relative group">
                                    {ex.image_url ? (
                                        <>
                                            <img src={ex.image_url} className="w-full h-full object-cover opacity-80" alt={ex.exercise_name} />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Play className="w-6 h-6 text-white opacity-80" fill="white" /></div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Dumbbell className="w-8 h-8 text-zinc-600" /></div>
                                    )}
                                </div>
                                <div className="flex-1 py-1">
                                    <h3 className="text-white font-bold text-lg leading-tight mb-2">{ex.exercise_name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400 border border-zinc-700">{ex.sets} Series</span>
                                        <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400 border border-zinc-700">{ex.reps} Reps</span>
                                    </div>
                                </div>
                                <div>
                                    <button className="text-zinc-600 hover:text-white"><Check className="w-6 h-6 rounded-full border border-zinc-600 p-1" /></button>
                                </div>
                            </div>

                            {/* GRILLA DE SERIES (INPUTS) */}
                            <div className="p-4 bg-zinc-900/30 space-y-2">
                                {/* Encabezados */}
                                <div className="grid grid-cols-10 gap-2 text-[10px] uppercase font-bold text-zinc-500 text-center mb-1">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-4">KG</div>
                                    <div className="col-span-4">REPS</div>
                                    <div className="col-span-1"></div>
                                </div>

                                {/* Filas Dinámicas según número de series */}
                                {Array.from({ length: ex.sets || 3 }).map((_, i) => {
                                    const setNum = i + 1;
                                    const log = workoutLogs[ex.id]?.[setNum] || {};
                                    const isDone = log.done;

                                    return (
                                        <div key={i} className={`grid grid-cols-10 gap-2 items-center transition-all ${isDone ? 'opacity-50' : 'opacity-100'}`}>
                                            <div className="col-span-1 text-center text-zinc-500 font-bold text-sm">{setNum}</div>
                                            
                                            <div className="col-span-4 relative">
                                                <input 
                                                    type="number" 
                                                    placeholder="0"
                                                    value={log.weight || ''}
                                                    onChange={(e) => handleLogChange(ex.id, setNum, 'weight', e.target.value)}
                                                    className={`w-full bg-black border ${isDone ? 'border-emerald-900 text-emerald-500' : 'border-zinc-800 text-white'} rounded-lg py-2.5 text-center font-bold focus:outline-none focus:border-emerald-500 transition-colors`}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold pointer-events-none">KG</span>
                                            </div>

                                            <div className="col-span-4 relative">
                                                <input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    value={log.reps || ''}
                                                    onChange={(e) => handleLogChange(ex.id, setNum, 'reps', e.target.value)}
                                                    className={`w-full bg-black border ${isDone ? 'border-emerald-900 text-emerald-500' : 'border-zinc-800 text-white'} rounded-lg py-2.5 text-center font-bold focus:outline-none focus:border-emerald-500 transition-colors`}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold pointer-events-none">REPS</span>
                                            </div>

                                            <div className="col-span-1 flex justify-center">
                                                <button 
                                                    onClick={() => toggleSetComplete(ex.id, setNum)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}
                                                >
                                                    <Check className="w-5 h-5 stroke-[3]" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* BOTON COMPLETAR FLOTANTE */}
                <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-10 pb-8 px-6 z-40">
                    <Button 
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg py-6 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] tracking-wide uppercase transform transition-transform active:scale-[0.98]"
                        onClick={() => {
                            if(confirm("¿Finalizar entrenamiento? (Los datos son visuales en esta versión)")) {
                                setViewingExercises(false);
                                alert("¡Entrenamiento completado! 🎉");
                            }
                        }}
                    >
                        Completar Entrenamiento
                    </Button>
                </div>
            </div>
        );
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Activity className="w-10 h-10 animate-spin" /></div>;

    // --- RENDER CONDICIONAL PRINCIPAL ---
    // Si estamos viendo ejercicios, mostramos la vista de batalla. Si no, el dashboard normal.
    if (viewingExercises && todayWorkout) {
        return renderWorkoutView();
    }

    // --- RENDER INICIO (Dashboard) ---
    const renderInicio = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
             <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-white">Hola, {clientName} 👋</h1><p className="text-zinc-400 text-xs mt-1">¿Listo para darlo todo hoy?</p></div>
                <button onClick={() => setActiveTab('racha')} className="flex items-center gap-2 bg-zinc-800 border border-white/5 pl-2 pr-3 py-1 rounded-full hover:bg-zinc-700 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center"><Flame className="w-3.5 h-3.5 text-orange-500" /></div>
                    <div className="flex flex-col items-start leading-none"><span className="text-white text-sm font-bold">{monthlyWorkouts}</span><span className="text-[9px] text-zinc-500 font-bold tracking-wider">ESTE MES</span></div>
                </button>
            </div>
            {todayWorkout ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl relative overflow-hidden animate-in zoom-in-95 group">
                   <div className="absolute top-0 right-0 p-32 bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-all"/>
                   <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-wide mb-1 flex items-center gap-2"><CalendarIcon className="w-3 h-3"/> ENTRENAMIENTO DE HOY</h3>
                   <h2 className="text-2xl font-black text-white mb-6 leading-tight">{todayWorkout.name}</h2>
                   
                   <button 
                        onClick={handleStartWorkout} 
                        disabled={loadingExercises}
                        className="bg-emerald-500 text-black px-4 py-3.5 rounded-xl font-bold text-sm w-full hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                    >
                        {loadingExercises ? <Activity className="w-4 h-4 animate-spin"/> : <Play className="w-4 h-4 fill-black" />}
                        Empezar Rutina
                   </button>
                </div>
            ) : (
                <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-3">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2"><CalendarIcon className="w-8 h-8 text-zinc-500" /></div>
                    <div><h3 className="text-white font-bold">Día de Descanso 😴</h3><p className="text-zinc-500 text-xs mt-1">Hoy no tienes entrenamientos asignados.</p></div>
                </div>
            )}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-zinc-900 rounded-xl border border-white/5"><Trophy className="w-6 h-6 text-yellow-500 mb-2" /><p className="text-zinc-400 text-xs">Objetivos</p><p className="text-white font-bold text-sm">Sin definir</p></div>
                <div onClick={() => setActiveTab('progreso')} className="p-4 bg-zinc-900 rounded-xl border border-white/5 cursor-pointer hover:bg-zinc-800 transition-colors"><Scale className="w-6 h-6 text-blue-500 mb-2" /><p className="text-zinc-400 text-xs">Peso Actual</p><p className="text-white font-bold text-sm">{currentWeight} kg</p></div>
            </div>
        </div>
    );

    const renderRacha = () => (
        <div className="p-6 h-full flex flex-col items-center justify-center text-center pb-24 pt-20 animate-in fade-in">
            <div className="relative mb-6">
                <Flame className="w-32 h-32 text-zinc-700" />
                <div className="absolute -bottom-2 -right-2 bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center border-4 border-black"><span className="text-white font-bold text-lg">{monthlyWorkouts}</span></div>
            </div>
            <h2 className="text-3xl font-black italic text-white mb-2">ESTE MES</h2>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto mb-8">Has completado {monthlyWorkouts} entrenamientos.</p>
            <Button className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold" onClick={() => setActiveTab('inicio')}>Ver Entrenamientos</Button>
        </div>
    );

    const renderProgreso = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">Tu Evolución 📈</h2>
                <button onClick={() => setShowCheckinModal(true)} className="bg-zinc-800 text-white px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-700 flex items-center gap-1">+ Registrar</button>
            </div>
            <div className="bg-zinc-900 p-1 rounded-xl grid grid-cols-3 gap-1 mb-4">
                <button onClick={() => setViewAngle('front')} className={`text-xs font-bold py-2 rounded-lg transition-all ${viewAngle === 'front' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Frontal</button>
                <button onClick={() => setViewAngle('back')} className={`text-xs font-bold py-2 rounded-lg transition-all ${viewAngle === 'back' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Espalda</button>
                <button onClick={() => setViewAngle('side')} className={`text-xs font-bold py-2 rounded-lg transition-all ${viewAngle === 'side' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Perfil</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group">
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 border border-white/10">ANTES</div>
                    {photos[viewAngle].before ? (
                        <>
                            <img src={photos[viewAngle].before!} alt="Antes" className="w-full h-full object-cover opacity-80" />
                            <button onClick={handleDeleteBefore} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2"><User className="w-8 h-8 opacity-20" /><span className="text-[10px] text-center px-2">Sin foto inicial</span></div>
                    )}
                </div>
                {photos[viewAngle].now ? (
                    <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group">
                        <div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md z-10">AHORA</div>
                        <img src={photos[viewAngle].now!} alt="Ahora" className="w-full h-full object-cover" />
                        <button onClick={() => setShowPhotoModal(true)} className="absolute bottom-2 right-2 p-2 bg-emerald-500 rounded-full shadow-lg text-black hover:scale-105 transition-transform"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                ) : (
                    <button onClick={() => setShowPhotoModal(true)} className="aspect-[3/4] bg-zinc-900 rounded-xl border border-emerald-500/30 border-dashed flex flex-col items-center justify-center gap-3 hover:bg-emerald-500/5 transition-all group relative">
                        <div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">AHORA</div>
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform"><Plus className="w-5 h-5 text-emerald-500" /></div>
                        <span className="text-xs font-bold text-emerald-500">Subir {viewAngle === 'front' ? 'Frontal' : viewAngle === 'back' ? 'Espalda' : 'Perfil'}</span>
                    </button>
                )}
            </div>
            <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2 mt-4"><Ruler className="w-4 h-4"/> Datos Actuales</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 mb-1"><Scale className="w-3 h-3 text-blue-500" /><p className="text-zinc-500 text-xs">Peso Actual</p></div>
                    <p className="text-2xl font-bold text-white">{currentWeight} <span className="text-sm text-zinc-600 font-normal">kg</span></p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                     <div className="flex items-center gap-2 mb-1"><Ruler className="w-3 h-3 text-purple-500" /><p className="text-zinc-500 text-xs">Cintura</p></div>
                    <p className="text-2xl font-bold text-white">{currentWaist} <span className="text-sm text-zinc-600 font-normal">cm</span></p>
                </div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                     <div className="flex items-center gap-2 mb-1"><Dumbbell className="w-3 h-3 text-orange-500" /><p className="text-zinc-500 text-xs">Brazo</p></div>
                    <p className="text-2xl font-bold text-white">{currentArm} <span className="text-sm text-zinc-600 font-normal">cm</span></p>
                </div>
            </div>
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mt-6 mb-3"><Activity className="w-4 h-4 text-emerald-500" /> Transformación Total</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 grid grid-cols-3 gap-4 divide-x divide-zinc-800">
                <div className="text-center px-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Peso</p>
                    <div className={`flex items-center justify-center gap-0.5 font-bold ${statsDiff.weight < 0 ? 'text-emerald-500' : statsDiff.weight > 0 ? 'text-orange-500' : 'text-zinc-400'}`}>{statsDiff.weight !== 0 ? (statsDiff.weight > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>) : <Minus className="w-3 h-3"/>}<span className="text-sm">{Math.abs(statsDiff.weight).toFixed(1)}</span></div>
                </div>
                <div className="text-center px-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Cintura</p>
                    <div className={`flex items-center justify-center gap-0.5 font-bold ${statsDiff.waist < 0 ? 'text-emerald-500' : statsDiff.waist > 0 ? 'text-orange-500' : 'text-zinc-400'}`}>{statsDiff.waist !== 0 ? (statsDiff.waist > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>) : <Minus className="w-3 h-3"/>}<span className="text-sm">{Math.abs(statsDiff.waist)}</span></div>
                </div>
                <div className="text-center px-1">
                    <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Brazo</p>
                    <div className={`flex items-center justify-center gap-0.5 font-bold ${statsDiff.arm > 0 ? 'text-emerald-500' : statsDiff.arm < 0 ? 'text-orange-500' : 'text-zinc-400'}`}>{statsDiff.arm !== 0 ? (statsDiff.arm > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>) : <Minus className="w-3 h-3"/>}<span className="text-sm">{Math.abs(statsDiff.arm)}</span></div>
                </div>
            </div>
            <div>
                 <h3 className="text-sm font-bold text-zinc-400 mb-3 mt-6">Historial Reciente</h3>
                 <div className="space-y-2">
                    {progressHistory.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                            <span className="text-zinc-500 text-xs">{new Date(item.date).toLocaleDateString()}</span>
                            <div className="flex gap-3 text-sm items-center">
                                {item.weight && <span className="text-white font-bold">{item.weight}kg</span>}
                                {item.arm && <span className="text-zinc-400 text-xs flex items-center gap-1"><Dumbbell className="w-3 h-3"/> {item.arm}</span>}
                                {(item.front_photo || item.back_photo || item.side_photo) && <Camera className="w-4 h-4 text-emerald-500" />}
                            </div>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );

    const renderPerfil = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
             <h2 className="text-2xl font-bold text-white">Mi Perfil</h2>
             <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-2xl border border-white/5"><div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-xl border border-zinc-700">{clientName.charAt(0)}</div><div><h2 className="text-lg font-bold text-white">{clientName}</h2><p className="text-zinc-500 text-xs">{email}</p></div></div>
            <div className="space-y-3">
                <button onClick={() => setActiveProfileModal('notifications')} className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all"><div className="flex items-center gap-3"><Bell className="w-5 h-5 text-yellow-500" /><span className="text-white font-bold">Notificaciones</span></div><ChevronRight className="w-5 h-5 text-zinc-500" /></button>
                <button onClick={() => setActiveProfileModal('settings')} className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all"><div className="flex items-center gap-3"><Settings className="w-5 h-5 text-blue-500" /><span className="text-white font-bold">Configuración</span></div><ChevronRight className="w-5 h-5 text-zinc-500" /></button>
            </div>
            <div className="pt-8"><button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl border border-red-500/20"><LogOut className="w-5 h-5" /> Cerrar Sesión</button></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-safe selection:bg-emerald-500 selection:text-black">
            {/* Top Bar solo visible si NO estamos entrenando */}
            {!viewingExercises && (
                <div className="fixed top-0 w-full max-w-md left-0 right-0 mx-auto bg-black/90 backdrop-blur-md border-b border-white/10 z-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-xl italic transform -skew-x-6">F</div><span className="font-bold text-lg text-white tracking-tight italic">FitLeader</span></div>
                </div>
            )}

            <div className="w-full max-w-md mx-auto min-h-screen bg-black relative shadow-2xl overflow-hidden">
                {/* RENDERIZADO CONDICIONAL DE PESTAÑAS */}
                {activeTab === 'inicio' && renderInicio()}
                {activeTab === 'rutina' && (viewingExercises ? renderWorkoutView() : renderInicio())} {/* Hack para redireccionar */}
                {activeTab === 'racha' && renderRacha()}
                {activeTab === 'progreso' && renderProgreso()}
                {activeTab === 'perfil' && renderPerfil()}

                {/* MODALES */}
                {showCheckinModal && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                         <div className="bg-[#111] w-full max-w-sm rounded-3xl border border-zinc-800 overflow-hidden relative max-h-[90vh] overflow-y-auto">
                             <div className="p-5 border-b border-zinc-800 flex justify-between items-center">
                                 <h3 className="text-xl font-bold text-white">Nuevo Registro</h3>
                                 <button onClick={() => setShowCheckinModal(false)} className="p-1 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors">
                                     <X className="w-6 h-6"/>
                                 </button>
                             </div>
                             
                             <div className="p-6 space-y-4">
                                 <div className="space-y-1">
                                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Scale className="w-4 h-4 text-blue-500" /> Peso Corporal</label>
                                     <div className="relative group">
                                         <input type="number" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} placeholder="0.0" className="w-full bg-black border border-zinc-800 rounded-xl p-3 pl-4 pr-12 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800"/>
                                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">kg</span>
                                     </div>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Ruler className="w-4 h-4 text-purple-500" /> Cintura</label>
                                     <div className="relative group">
                                         <input type="number" value={formWaist} onChange={(e) => setFormWaist(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-xl p-3 pl-4 pr-12 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800"/>
                                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">cm</span>
                                     </div>
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-sm font-medium text-zinc-400 flex items-center gap-2"><Dumbbell className="w-4 h-4 text-orange-500" /> Brazo</label>
                                     <div className="relative group">
                                         <input type="number" value={formArm} onChange={(e) => setFormArm(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-xl p-3 pl-4 pr-12 text-2xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-zinc-800"/>
                                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">cm</span>
                                     </div>
                                 </div>
                                 <Button onClick={handleSaveCheckin} disabled={saving} className="w-full mt-4 bg-emerald-500 text-black font-bold h-12 text-lg rounded-xl hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                     {saving ? "Guardando..." : "Guardar Progreso"}
                                 </Button>
                             </div>
                        </div>
                    </div>
                )}
                
                {showPhotoModal && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-4">
                        <div className="bg-[#111] w-full max-w-sm rounded-3xl border border-zinc-800 overflow-hidden relative">
                            <div className="p-5 flex justify-between items-start">
                                <div><h3 className="text-xl font-bold text-white">Nueva Foto: {viewAngle === 'front' ? 'Frontal' : viewAngle === 'back' ? 'Espalda' : 'Perfil'}</h3></div>
                                <button onClick={() => {setShowPhotoModal(false); setPreviewUrl(null); setFileToUpload(null);}} className="text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="px-5 pb-5">
                                <div onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] bg-zinc-900/50 border-2 border-dashed border-zinc-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors relative overflow-hidden">
                                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" /> : <><Upload className="w-8 h-8 text-zinc-600 mb-3" /><span className="text-zinc-500 text-sm">Toca para subir imagen</span></>}
                                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                                </div>
                                <Button className="w-full mt-5 bg-emerald-500 text-black font-bold h-12 text-base rounded-xl hover:bg-emerald-400" onClick={handleUploadPhoto} disabled={uploading || !fileToUpload}>
                                    {uploading ? <span className="flex items-center gap-2"><Activity className="w-4 h-4 animate-spin"/> Subiendo...</span> : "Guardar Foto"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                 {activeProfileModal && (
                    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-4 flex items-center border-b border-white/10 bg-zinc-900"><button onClick={() => setActiveProfileModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-6 h-6 text-white rotate-180" /></button><h2 className="text-lg font-bold text-white ml-2">{activeProfileModal === 'notifications' ? 'Notificaciones' : 'Configuración'}</h2></div>
                        <div className="p-6"><p className="text-zinc-500 text-center mt-10">Opciones en desarrollo...</p></div>
                    </div>
                )}
            </div>

            {/* Bottom Bar oculta si estamos entrenando */}
            {!viewingExercises && (
                <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 safe-area-bottom">
                    <div className="max-w-md mx-auto flex justify-around items-center p-2 pb-4 md:pb-2">
                        {['inicio', 'rutina', 'racha', 'progreso', 'perfil'].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 flex flex-col items-center gap-1 py-2 ${activeTab === tab ? (tab==='racha'?'text-orange-500': tab==='progreso'?'text-emerald-500':'text-emerald-500') : 'text-zinc-500'}`}>
                                {tab === 'inicio' ? <Home className="w-6 h-6" /> : tab === 'rutina' ? <ClipboardList className="w-6 h-6" /> : tab === 'racha' ? <Flame className="w-6 h-6" /> : tab === 'progreso' ? <TrendingUp className="w-6 h-6" /> : <User className="w-6 h-6" />}
                                <span className="text-[9px] font-bold capitalize">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientWorkout;