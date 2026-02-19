import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Home, ClipboardList, TrendingUp, User, LogOut, Flame, 
    Calendar as CalendarIcon, Trophy, Activity, Dumbbell,
    Bell, Settings, ChevronRight, Plus, Scale, X, Camera, Ruler, Trash2, Upload, RefreshCw,
    ArrowLeft, Check, Clock, Play, Lightbulb, SkipForward,
    CreditCard, Mail, Globe, Shield, FileText, Moon, Lock,
    ArrowDownRight, ArrowUpRight, Minus
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// --- COMPONENTE PRINCIPAL APP CLIENTE ---
const ClientWorkout = () => {
    // --- ESTADOS DE DATOS ---
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState("Atleta");
    const [clientLastName, setClientLastName] = useState("");
    const [email, setEmail] = useState("");
    const [clientPhoto, setClientPhoto] = useState<string | null>(null);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    const [todayWorkout, setTodayWorkout] = useState<any>(null);
    
    // Guardamos el ID de la asignación para poder marcarla como completada
    const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);
    
    const [loading, setLoading] = useState(true);

    // --- ESTADOS PARA LOS EJERCICIOS ---
    const [exercises, setExercises] = useState<any[]>([]);
    const [currentDayFilter] = useState("Día 1"); 
    const [viewingExercises, setViewingExercises] = useState(false);
    
    // Estado para guardar los inputs de cada serie
    const [workoutLogs, setWorkoutLogs] = useState<any>({}); 

    // --- ESTADOS DEL TEMPORIZADOR DE DESCANSO ⏱️ ---
    const [timerActive, setTimerActive] = useState(false);
    const [timerTime, setTimerTime] = useState(90); 
    
    // --- ESTADO PARA REPRODUCTOR DE VÍDEO 🎥 ---
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

    // Estado del Progreso
    const [currentWeight, setCurrentWeight] = useState<string>("--");
    const [currentWaist, setCurrentWaist] = useState<string>("--");
    const [currentArm, setCurrentArm] = useState<string>("--");
    const [currentLeg, setCurrentLeg] = useState<string>("--"); 
    const [progressHistory, setProgressHistory] = useState<any[]>([]);
    
    // Stats (Contadores y Metas)
    const [statsDiff, setStatsDiff] = useState({ weight: 0, waist: 0, arm: 0, leg: 0 });
    const [monthlyWorkouts, setMonthlyWorkouts] = useState(0);
    const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
    const [weeklyGoal, setWeeklyGoal] = useState(4); // Meta por defecto

    // Fotos
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

    // UI State
    const [activeTab, setActiveTab] = useState<'inicio' | 'rutina' | 'racha' | 'progreso' | 'perfil'>('inicio');
    const [activeProfileModal, setActiveProfileModal] = useState<'notifications' | 'settings' | null>(null);
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    // --- CONFIGURACIÓN PERSISTENTE ---
    const [notifSettings, setNotifSettings] = useState(() => {
        const saved = localStorage.getItem('fit_client_notifs');
        return saved ? JSON.parse(saved) : { workouts: true, messages: true, tips: false };
    });

    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('fit_client_config');
        return saved ? JSON.parse(saved) : {
            units: 'metric',
            language: 'es', 
            theme: 'dark'
        };
    });

    useEffect(() => { localStorage.setItem('fit_client_notifs', JSON.stringify(notifSettings)); }, [notifSettings]);
    useEffect(() => { localStorage.setItem('fit_client_config', JSON.stringify(config)); }, [config]);

    // Formulario Check-in
    const [formWeight, setFormWeight] = useState("");
    const [formWaist, setFormWaist] = useState("");
    const [formArm, setFormArm] = useState("");
    const [formLeg, setFormLeg] = useState(""); 
    const [saving, setSaving] = useState(false);

    // Upload Foto Progreso
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- NUEVO: ESTADOS PARA FOTO DE PERFIL ---
    const profileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingProfile, setUploadingProfile] = useState(false);

    // --- LOGICA DEL TEMPORIZADOR ---
    useEffect(() => {
        let interval: any;
        if (timerActive && timerTime > 0) {
            interval = setInterval(() => {
                setTimerTime((prev) => prev - 1);
            }, 1000);
        } else if (timerTime === 0 && timerActive) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
            audio.play().catch(e => console.log("Audio play failed", e));
            setTimerActive(false); 
        }
        return () => clearInterval(interval);
    }, [timerActive, timerTime]);

    // --- CARGAR DATOS ---
    useEffect(() => {
        const fetchClientData = async () => {
            setLoading(true);
            const storedEmail = localStorage.getItem('fit_client_email');
            
            if (storedEmail) {
                const { data: clientData } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('email', storedEmail) 
                    .single();
                
                if (clientData) {
                    setClientId(clientData.id);
                    const nameParts = clientData.name.split(' ');
                    setClientName(nameParts[0]);
                    setClientLastName(nameParts.length > 1 ? nameParts[1] : "");
                    setEmail(clientData.email);
                    setClientPhoto(clientData.image_url);
                    setPaymentLink(clientData.stripe_link);

                    // Traemos la última asignación
                    const { data: assignment } = await supabase
                        .from('routine_assignments')
                        .select(`*, routine:routines!fk_routine (id, name, description, days_per_week)`) 
                        .eq('client_id', clientData.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (assignment && assignment.routine) {
                        setTodayWorkout({
                            ...assignment.routine,
                            is_completed_today: assignment.completed 
                        });
                        setCurrentAssignmentId(assignment.id);
                        
                        if (assignment.routine.days_per_week) {
                            setWeeklyGoal(assignment.routine.days_per_week);
                        }

                        const { data: exerciseData } = await supabase
                            .from('routine_exercises')
                            .select('*')
                            .eq('routine_id', assignment.routine.id)
                            .order('id', { ascending: true });
                        
                        setExercises(exerciseData || []);
                    } else {
                        setTodayWorkout(null);
                    }

                    fetchProgress(clientData.id);
                    fetchMonthlyWorkouts(clientData.id);
                    fetchWeeklyWorkouts(clientData.id);
                }
            }
            setLoading(false);
        };
        fetchClientData();
    }, []);

    // --- NUEVO: GESTIÓN DE FOTO DE PERFIL ---
    const handleProfileFileSelect = async (e: any) => {
        if (!e.target.files || e.target.files.length === 0 || !clientId) return;
        
        const file = e.target.files[0];
        setUploadingProfile(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `avatars/${clientId}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('progress') 
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('progress')
                .getPublicUrl(fileName);

            const { error: dbError } = await supabase
                .from('clients')
                .update({ image_url: publicUrl })
                .eq('id', clientId);

            if (dbError) throw dbError;

            setClientPhoto(publicUrl);
            alert("¡Foto de perfil actualizada!");

        } catch (error: any) {
            console.error("Error subiendo perfil:", error);
            alert("Error al subir la foto. Inténtalo de nuevo.");
        } finally {
            setUploadingProfile(false);
        }
    };

    const handleDeleteProfilePic = async () => {
        if (!clientId) return;
        if (confirm("¿Quieres eliminar tu foto de perfil actual?")) {
            setUploadingProfile(true);
            try {
                const { error } = await supabase
                    .from('clients')
                    .update({ image_url: null })
                    .eq('id', clientId);
                
                if (error) throw error;
                setClientPhoto(null);
            } catch (err) {
                alert("Error al eliminar.");
            } finally {
                setUploadingProfile(false);
            }
        }
    };

    // --- MANEJO DE LOGS ---
    const handleLogChange = (exerciseId: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        setWorkoutLogs((prev: any) => ({
            ...prev,
            [exerciseId]: {
                ...prev[exerciseId],
                [setIndex]: { ...prev[exerciseId]?.[setIndex], [field]: value }
            }
        }));
    };

    const toggleSetComplete = (exerciseId: number, setIndex: number) => {
        setWorkoutLogs((prev: any) => {
            const currentExercise = prev[exerciseId] || {};
            const currentSet = currentExercise[setIndex] || {};
            const isNowDone = !currentSet.done;

            if (isNowDone) {
                setTimerTime(90); 
                setTimerActive(true);
            }

            return {
                ...prev,
                [exerciseId]: {
                    ...currentExercise,
                    [setIndex]: { ...currentSet, done: isNowDone }
                }
            };
        });
    };

    // --- COMPLETAR ENTRENAMIENTO ---
    const handleFinishWorkout = async () => {
        if (!currentAssignmentId || !clientId) return;

        if (confirm("¿Finalizar entrenamiento? Esto guardará tus marcas y actualizará tu progreso.")) {
            setLoading(true);
            try {
                const resultsToSave: any[] = [];
                Object.entries(workoutLogs).forEach(([exerciseId, sets]: any) => {
                    Object.entries(sets).forEach(([setNumber, data]: any) => {
                        if (data.done || (data.weight && data.reps)) {
                            resultsToSave.push({
                                assignment_id: parseInt(currentAssignmentId),
                                exercise_id: parseInt(exerciseId),
                                set_number: parseInt(setNumber),
                                weight: data.weight ? parseFloat(data.weight) : 0,
                                reps: data.reps ? parseFloat(data.reps) : 0,
                                is_completed: data.done || false
                            });
                        }
                    });
                });

                if (resultsToSave.length > 0) {
                    await supabase.from('workout_results').insert(resultsToSave);
                }

                const { error } = await supabase
                    .from('routine_assignments')
                    .update({ 
                        completed: true,
                        scheduled_date: new Date().toISOString() 
                    })
                    .eq('id', currentAssignmentId);

                if (error) throw error;

                if (todayWorkout) {
                    setTodayWorkout({ ...todayWorkout, is_completed_today: true });
                }

                await fetchMonthlyWorkouts(clientId);
                await fetchWeeklyWorkouts(clientId);

                alert("¡Entrenamiento completado! 🎉 Has sumado +1 a tu racha.");
                setActiveTab('inicio');
                setViewingExercises(false);
                setTimerActive(false);
                
            } catch (error: any) {
                console.error("Error al completar:", error);
                alert("Hubo un error al guardar: " + error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // --- FUNCIONES AUXILIARES ---
    const getWeekRange = () => {
        const now = new Date();
        const currentDay = now.getDay(); 
        const diffToMonday = currentDay === 0 ? 6 : currentDay - 1; 
        const monday = new Date(now);
        monday.setDate(now.getDate() - diffToMonday);
        monday.setHours(0, 0, 0, 0); 
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999); 
        return { start: monday.toISOString(), end: sunday.toISOString() };
    };

    const fetchMonthlyWorkouts = async (id: string) => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
        const { count } = await supabase.from('routine_assignments').select('*', { count: 'exact', head: true }).eq('client_id', id).eq('completed', true).gte('scheduled_date', firstDay).lte('scheduled_date', lastDay);
        setMonthlyWorkouts(count || 0);
    };

    const fetchWeeklyWorkouts = async (id: string) => {
        const { start, end } = getWeekRange();
        const { count } = await supabase.from('routine_assignments').select('*', { count: 'exact', head: true }).eq('client_id', id).eq('completed', true).gte('scheduled_date', start).lte('scheduled_date', end);
        setWeeklyWorkouts(count || 0);
    };

    const fetchProgress = async (id: string) => {
        const { data: history } = await supabase.from('client_progress').select('*').eq('client_id', id).order('date', { ascending: true }); 
        if (history && history.length > 0) {
            setProgressHistory([...history].reverse());
            const latest = history[history.length - 1];
            setCurrentWeight(latest.weight || "--"); setCurrentWaist(latest.waist || "--"); setCurrentArm(latest.arm || "--"); setCurrentLeg(latest.leg || "--");
            const first = history[0];
            setStatsDiff({ 
                weight: latest.weight && first.weight ? (latest.weight - first.weight) : 0, 
                waist: latest.waist && first.waist ? (latest.waist - first.waist) : 0, 
                arm: latest.arm && first.arm ? (latest.arm - first.arm) : 0,
                leg: latest.leg && first.leg ? (latest.leg - first.leg) : 0 
            });
            const findPhotos = (angleKey: any) => { const valid = history.filter(h => h[angleKey]); if (!valid.length) return { before: null, now: null, beforeId: null }; return { before: valid[0][angleKey], beforeId: valid[0].id, now: valid.length > 1 ? valid[valid.length - 1][angleKey] : null }; };
            setPhotos({ front: findPhotos('front_photo'), back: findPhotos('back_photo'), side: findPhotos('side_photo') });
        }
    };

    const handleSaveCheckin = async () => {
        if (!clientId) return; setSaving(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const payload: any = { client_id: clientId, date: today };
            if (formWeight) payload.weight = parseFloat(formWeight); if (formWaist) payload.waist = parseFloat(formWaist); if (formArm) payload.arm = parseFloat(formArm); if (formLeg) payload.leg = parseFloat(formLeg);
            const { data: existing } = await supabase.from('client_progress').select('id').eq('client_id', clientId).eq('date', today).maybeSingle();
            if (existing) await supabase.from('client_progress').update(payload).eq('id', existing.id); else await supabase.from('client_progress').insert(payload);
            alert("✅ Guardado"); setShowCheckinModal(false); setFormWeight(""); setFormWaist(""); setFormArm(""); setFormLeg(""); fetchProgress(clientId);
        } catch (e: any) { alert("Error: " + e.message); } finally { setSaving(false); }
    };

    const handleFileSelect = (e: any) => { if (e.target.files?.[0]) { setFileToUpload(e.target.files[0]); setPreviewUrl(URL.createObjectURL(e.target.files[0])); } };
    const handleUploadPhoto = async () => { if (!fileToUpload || !clientId) return; setUploading(true); try { const fileExt = fileToUpload.name.split('.').pop(); const fileName = `${clientId}/${Date.now()}_${viewAngle}.${fileExt}`; await supabase.storage.from('progress').upload(fileName, fileToUpload); const { data: { publicUrl } } = supabase.storage.from('progress').getPublicUrl(fileName); const today = new Date().toISOString().split('T')[0]; const { data: existing } = await supabase.from('client_progress').select('id').eq('client_id', clientId).eq('date', today).maybeSingle(); const updateData = { [viewAngle === 'front' ? 'front_photo' : viewAngle === 'back' ? 'back_photo' : 'side_photo']: publicUrl }; if (existing) await supabase.from('client_progress').update(updateData).eq('id', existing.id); else await supabase.from('client_progress').insert({ client_id: clientId, date: today, ...updateData }); alert("¡Foto guardada!"); setShowPhotoModal(false); setFileToUpload(null); setPreviewUrl(null); fetchProgress(clientId); } catch (e: any) { alert("Error: " + e.message); } finally { setUploading(false); } };
    const handleDeleteBefore = async () => { const current = photos[viewAngle]; if (current.beforeId && confirm("¿Borrar?")) { await supabase.from('client_progress').update({ [viewAngle === 'front' ? 'front_photo' : viewAngle === 'back' ? 'back_photo' : 'side_photo']: null }).eq('id', current.beforeId); fetchProgress(clientId!); } };
    
    // --- ACCIONES DE CUENTA ---
    const handleLogout = () => { if(confirm("¿Salir?")) { localStorage.removeItem('fit_client_email'); window.location.href = "/client-login"; } };
    
    const handlePasswordReset = async () => {
        if (!email) return;
        if (confirm(`¿Enviar correo de restablecimiento a ${email}?`)) {
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/update-password' });
            if (error) alert("Error: " + error.message);
            else alert("✅ Correo enviado. Revisa tu bandeja de entrada.");
        }
    };

    const handleDeleteAccount = async () => {
        if (!clientId) return;
        if (confirm("⚠️ ¿ESTÁS SEGURO?\n\nEsta acción eliminará tu cuenta y todos tus datos permanentemente. No se puede deshacer.")) {
            if (confirm("Última advertencia: Se borrará todo.")) {
                const { error } = await supabase.from('clients').delete().eq('id', clientId);
                if (error) {
                    alert("Error al eliminar (puede que tengas datos vinculados): " + error.message);
                } else {
                    alert("Cuenta eliminada. Hasta pronto.");
                    handleLogout();
                }
            }
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Activity className="w-10 h-10 animate-spin" /></div>;

    // --- RENDERIZADO ---
    const renderWorkoutView = () => {
        if (!todayWorkout) { setViewingExercises(false); setActiveTab('inicio'); return null; }
        const dailyExercises = exercises.filter(ex => ex.day_name === currentDayFilter);
        const displayExercises = dailyExercises.length > 0 ? dailyExercises : exercises;

        return (
            <div className="min-h-screen bg-black pb-32 animate-in fade-in relative">
                <div className="relative h-64 w-full">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" className="w-full h-full object-cover opacity-60" alt="Header" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black"></div>
                    <div className="absolute top-6 left-4 z-20">
                        <button onClick={() => { setViewingExercises(false); setActiveTab('inicio'); }} className="bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/10 text-white hover:bg-black/70">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 z-20">
                        <div className="flex items-center gap-2 mb-2"><span className="bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{currentDayFilter}</span></div>
                        <h1 className="text-3xl font-black text-white leading-tight mb-2">{todayWorkout.name}</h1>
                        <div className="flex items-center gap-4 text-xs font-medium text-emerald-400"><span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> 60 min</span><span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5"/> 450 kcal</span></div>
                    </div>
                </div>

                <div className="px-4 -mt-4 relative z-30 space-y-4">
                    {displayExercises.length === 0 ? (
                        <div className="p-10 text-center text-zinc-500 bg-zinc-900 rounded-2xl border border-zinc-800">Cargando ejercicios...</div>
                    ) : (
                        displayExercises.map((ex, index) => (
                            <div key={ex.id || index} className="bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                                <div className="p-4 flex gap-4 border-b border-zinc-800/50">
                                    <div 
                                        onClick={() => { if(ex.video_url) setPlayingVideoUrl(ex.video_url); else alert("No hay vídeo disponible para este ejercicio."); }}
                                        className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0 relative group cursor-pointer hover:border-emerald-500 border border-transparent transition-all"
                                    >
                                        {ex.image_url ? (
                                            <><img src={ex.image_url} className="w-full h-full object-cover opacity-80" alt={ex.exercise_name} /><div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-all"><Play className="w-6 h-6 text-white opacity-80 group-hover:scale-110 transition-transform" fill="white" /></div></>
                                        ) : (<div className="w-full h-full flex items-center justify-center"><Dumbbell className="w-8 h-8 text-zinc-600" /></div>)}
                                    </div>
                                    <div className="flex-1 py-1">
                                        <h3 className="text-white font-bold text-lg leading-tight mb-2">{ex.exercise_name}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400 border border-zinc-700">{ex.sets} Series</span>
                                            <span className="px-2 py-1 bg-zinc-800 rounded-md text-xs text-zinc-400 border border-zinc-700">{ex.reps} Reps</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-zinc-900/30 space-y-2">
                                    <div className="grid grid-cols-10 gap-2 text-[10px] uppercase font-bold text-zinc-500 text-center mb-1"><div className="col-span-1">#</div><div className="col-span-4">KG</div><div className="col-span-4">REPS</div><div className="col-span-1"></div></div>
                                    {Array.from({ length: ex.sets || 3 }).map((_, i) => {
                                        const setNum = i + 1; const log = workoutLogs[ex.id]?.[setNum] || {}; const isDone = log.done;
                                        return (
                                            <div key={i} className={`grid grid-cols-10 gap-2 items-center transition-all ${isDone ? 'opacity-50' : 'opacity-100'}`}>
                                                <div className="col-span-1 text-center text-zinc-500 font-bold text-sm">{setNum}</div>
                                                <div className="col-span-4 relative"><input type="number" placeholder="0" value={log.weight || ''} onChange={(e) => handleLogChange(ex.id, setNum, 'weight', e.target.value)} className={`w-full bg-black border ${isDone ? 'border-emerald-900 text-emerald-500' : 'border-zinc-800 text-white'} rounded-lg py-2.5 text-center font-bold focus:outline-none focus:border-emerald-500 transition-colors`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold pointer-events-none">KG</span></div>
                                                <div className="col-span-4 relative"><input type="number" placeholder="0" value={log.reps || ''} onChange={(e) => handleLogChange(ex.id, setNum, 'reps', e.target.value)} className={`w-full bg-black border ${isDone ? 'border-emerald-900 text-emerald-500' : 'border-zinc-800 text-white'} rounded-lg py-2.5 text-center font-bold focus:outline-none focus:border-emerald-500 transition-colors`} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold pointer-events-none">REPS</span></div>
                                                <div className="col-span-1 flex justify-center"><button onClick={() => toggleSetComplete(ex.id, setNum)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}><Check className="w-5 h-5 stroke-[3]" /></button></div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {timerActive && (
                    <div className="fixed bottom-20 left-4 right-4 bg-zinc-900 border border-emerald-500/30 p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between animate-in slide-in-from-bottom-10 fade-in">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center animate-pulse"><Clock className="w-5 h-5 text-emerald-500" /></div>
                            <div><p className="text-xs text-zinc-400 font-medium">Descanso</p><p className="text-2xl font-black text-white tabular-nums leading-none">{Math.floor(timerTime / 60)}:{String(timerTime % 60).padStart(2, '0')}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setTimerTime(t => t + 30)} className="bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors">+30s</button>
                            <button onClick={() => setTimerActive(false)} className="bg-emerald-500 text-black p-2 rounded-lg hover:bg-emerald-400 transition-colors"><SkipForward className="w-5 h-5 fill-black" /></button>
                        </div>
                    </div>
                )}

                {playingVideoUrl && (
                    <div onClick={() => setPlayingVideoUrl(null)} className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer">
                        <button onClick={() => setPlayingVideoUrl(null)} className="absolute top-6 right-6 text-white hover:text-zinc-300 z-50 p-2 bg-black/50 rounded-full"><X className="w-8 h-8 drop-shadow-md" /></button>
                        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 relative">
                            <video src={playingVideoUrl} controls autoPlay playsInline className="w-full h-full object-contain" />
                        </div>
                    </div>
                )}

                <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-10 pb-8 px-6 z-40">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg py-6 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)] tracking-wide uppercase transform transition-transform active:scale-[0.98]" onClick={handleFinishWorkout}>
                        Completar Entrenamiento
                    </Button>
                </div>
            </div>
        );
    };

    const renderInicio = () => {
        const progressPercent = Math.min((weeklyWorkouts / weeklyGoal) * 100, 100);
        return (
            <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
                <div className="flex justify-between items-center mb-2"><div><h1 className="text-3xl font-bold text-white">Hola, {clientName} 👋</h1><p className="text-zinc-400 text-xs mt-1">Vamos a por el objetivo de hoy.</p></div><button onClick={() => setActiveTab('racha')} className="flex items-center gap-2 bg-[#111] border border-zinc-800 px-3 py-1.5 rounded-full hover:bg-zinc-800 transition-colors"><Flame className="w-4 h-4 text-orange-500" /><span className="text-white font-bold text-sm">{monthlyWorkouts}</span></button></div>
                <div className="bg-[#051F1A] border border-emerald-900/50 rounded-2xl p-5 relative overflow-hidden"><div className="flex justify-between items-start mb-4 relative z-10"><div><h3 className="text-emerald-400 font-bold text-sm mb-1">Objetivo Semanal</h3><div className="flex items-baseline gap-1"><span className="text-3xl font-bold text-white">{weeklyWorkouts}</span><span className="text-zinc-400 text-sm">/ {weeklyGoal} sesiones</span></div></div><Trophy className="w-6 h-6 text-emerald-600" /></div><div className="h-2 w-full bg-emerald-900/30 rounded-full mb-2 relative z-10"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} /></div><p className="text-right text-xs text-emerald-500 font-medium relative z-10">{weeklyWorkouts >= weeklyGoal ? "¡Objetivo cumplido! 🔥" : "¡Casi lo tienes!"}</p><div className="absolute top-0 right-0 p-20 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none"/></div>
                <div className="bg-[#111] border border-zinc-800 rounded-2xl p-4 flex gap-4 items-start"><div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center flex-shrink-0"><Lightbulb className="w-5 h-5 text-yellow-500" /></div><div><h3 className="text-white font-bold text-sm mb-1">Tip del Día</h3><p className="text-zinc-400 text-xs leading-relaxed">La hidratación es clave para el rendimiento. Intenta beber 500ml de agua 30 minutos antes de tu sesión hoy. 💧</p></div></div>
                <div><h3 className="text-white font-bold text-lg mb-3">Próxima sesión:</h3>{todayWorkout ? (<div onClick={() => { setViewingExercises(true); setActiveTab('rutina'); }} className={`bg-[#111] border ${todayWorkout.is_completed_today ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-zinc-800'} rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-emerald-500/30 transition-all group`}><div className="flex items-center gap-4"><div className={`w-12 h-12 ${todayWorkout.is_completed_today ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-emerald-500'} rounded-xl flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors`}>{todayWorkout.is_completed_today ? <Check className="w-6 h-6 stroke-[3]" /> : <ClipboardList className="w-6 h-6" />}</div><div><h3 className="text-white font-bold text-base group-hover:text-emerald-400 transition-colors">{todayWorkout.name}</h3><p className={`text-xs flex items-center gap-1 ${todayWorkout.is_completed_today ? 'text-emerald-500 font-bold' : 'text-zinc-500'}`}>{todayWorkout.is_completed_today ? "¡Completado hoy! ✅" : <><Clock className="w-3 h-3"/> Hoy, cuando tú quieras</>}</p></div></div><div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all"><ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-black" /></div></div>) : (<div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 text-center"><div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-2"><CalendarIcon className="w-6 h-6 text-zinc-500" /></div><p className="text-zinc-400 text-sm">No tienes sesiones pendientes.</p></div>)}</div>
            </div>
        );
    };

    const renderRacha = () => (
        <div className="p-6 h-full flex flex-col items-center justify-center text-center pb-24 pt-20 animate-in fade-in">
            <div className="relative mb-6">
                {/* Llama con efecto */}
                <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse"></div>
                <Flame 
                    className={`w-32 h-32 transition-all duration-500 ${
                        monthlyWorkouts > 0 
                            ? "text-orange-500 fill-orange-500/10 animate-pulse drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]" 
                            : "text-zinc-800"
                    }`} 
                />
                <div className="absolute -bottom-2 -right-2 bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center border-4 border-black">
                    <span className="text-white font-bold text-lg">{monthlyWorkouts}</span>
                </div>
            </div>
            <h2 className="text-3xl font-black italic text-white mb-2">ESTE MES</h2>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto mb-8">Has completado {monthlyWorkouts} entrenamientos.</p>
            <Button className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-600 text-black font-bold" onClick={() => setActiveTab('inicio')}>Ver Entrenamientos</Button>
        </div>
    );

    const renderProgreso = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
            <div className="flex justify-between items-center mb-2"><h2 className="text-2xl font-bold text-white flex items-center gap-2">Tu Evolución 📈</h2><button onClick={() => setShowCheckinModal(true)} className="bg-zinc-800 text-white px-3 py-1.5 rounded-full text-xs font-bold border border-zinc-700 flex items-center gap-1">+ Registrar</button></div>
            <div className="bg-zinc-900 p-1 rounded-xl grid grid-cols-3 gap-1 mb-4"><button onClick={() => setViewAngle('front')} className={`text-xs font-bold py-2 rounded-lg transition-all ${viewAngle === 'front' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Frontal</button><button onClick={() => setViewAngle('back')} className={`text-xs font-bold py-2 rounded-lg transition-all ${viewAngle === 'back' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Espalda</button><button onClick={() => setViewAngle('side')} className={`text-xs font-bold py-2 rounded-lg transition-all ${viewAngle === 'side' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Perfil</button></div>
            <div className="grid grid-cols-2 gap-3">
                <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group">
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 border border-white/10">ANTES</div>
                    {photos[viewAngle].before ? (<><img src={photos[viewAngle].before!} alt="Antes" className="w-full h-full object-cover opacity-80" /><button onClick={handleDeleteBefore} className="absolute top-2 right-2 p-1.5 bg-red-500/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button></>) : (<div onClick={() => { setFileToUpload(null); setPreviewUrl(null); setShowPhotoModal(true); }} className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2 cursor-pointer hover:bg-zinc-800/50 transition-colors"><User className="w-8 h-8 opacity-20" /><span className="text-[10px] text-center px-2">Sin foto inicial</span></div>)}
                </div>
                {photos[viewAngle].now ? (<div className="relative aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group"><div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md z-10">AHORA</div><img src={photos[viewAngle].now!} alt="Ahora" className="w-full h-full object-cover" /><button onClick={() => { setFileToUpload(null); setPreviewUrl(null); setShowPhotoModal(true); }} className="absolute bottom-2 right-2 p-2 bg-emerald-500 rounded-full shadow-lg text-black hover:scale-105 transition-transform"><RefreshCw className="w-4 h-4" /></button></div>) : (<button onClick={() => { setFileToUpload(null); setPreviewUrl(null); setShowPhotoModal(true); }} className="aspect-[3/4] bg-zinc-900 rounded-xl border border-emerald-500/30 border-dashed flex flex-col items-center justify-center gap-3 hover:bg-emerald-500/5 transition-all group relative"><div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-md">AHORA</div><div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform"><Plus className="w-5 h-5 text-emerald-500" /></div><span className="text-xs font-bold text-emerald-500">Subir {viewAngle === 'front' ? 'Frontal' : viewAngle === 'back' ? 'Espalda' : 'Perfil'}</span></button>)}
            </div>
            <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2 mt-4"><Ruler className="w-4 h-4"/> Datos Actuales</h3>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 col-span-2 sm:col-span-1"><div className="flex items-center gap-2 mb-1"><Scale className="w-3 h-3 text-blue-500" /><p className="text-zinc-500 text-xs">Peso Actual</p></div><p className="text-2xl font-bold text-white">{currentWeight} <span className="text-sm text-zinc-600 font-normal">kg</span></p></div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><div className="flex items-center gap-2 mb-1"><Ruler className="w-3 h-3 text-purple-500" /><p className="text-zinc-500 text-xs">Cintura</p></div><p className="text-2xl font-bold text-white">{currentWaist} <span className="text-sm text-zinc-600 font-normal">cm</span></p></div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><div className="flex items-center gap-2 mb-1"><Dumbbell className="w-3 h-3 text-orange-500" /><p className="text-zinc-500 text-xs">Brazo</p></div><p className="text-2xl font-bold text-white">{currentArm} <span className="text-sm text-zinc-600 font-normal">cm</span></p></div>
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800"><div className="flex items-center gap-2 mb-1"><Activity className="w-3 h-3 text-rose-500" /><p className="text-zinc-500 text-xs">Muslo</p></div><p className="text-2xl font-bold text-white">{currentLeg} <span className="text-sm text-zinc-600 font-normal">cm</span></p></div>
            </div>
            <h3 className="text-sm font-bold text-zinc-400 flex items-center gap-2 mt-6 mb-3"><Activity className="w-4 h-4 text-emerald-500" /> Transformación Total</h3>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 grid grid-cols-4 gap-4 divide-x divide-zinc-800">
                <div className="text-center px-1"><p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Peso</p><div className={`flex items-center justify-center gap-0.5 font-bold ${statsDiff.weight < 0 ? 'text-emerald-500' : statsDiff.weight > 0 ? 'text-orange-500' : 'text-zinc-400'}`}>{statsDiff.weight !== 0 ? (statsDiff.weight > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>) : <Minus className="w-3 h-3"/>}<span className="text-sm">{Math.abs(statsDiff.weight).toFixed(1)}</span></div></div>
                <div className="text-center px-1"><p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Cintura</p><div className={`flex items-center justify-center gap-0.5 font-bold ${statsDiff.waist < 0 ? 'text-emerald-500' : statsDiff.waist > 0 ? 'text-orange-500' : 'text-zinc-400'}`}>{statsDiff.waist !== 0 ? (statsDiff.waist > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>) : <Minus className="w-3 h-3"/>}<span className="text-sm">{Math.abs(statsDiff.waist)}</span></div></div>
                <div className="text-center px-1"><p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Brazo</p><div className={`flex items-center justify-center gap-0.5 font-bold ${statsDiff.arm > 0 ? 'text-emerald-500' : statsDiff.arm < 0 ? 'text-orange-500' : 'text-zinc-400'}`}>{statsDiff.arm !== 0 ? (statsDiff.arm > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>) : <Minus className="w-3 h-3"/>}<span className="text-sm">{Math.abs(statsDiff.arm)}</span></div></div>
                <div className="text-center px-1"><p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Muslo</p><div className={`flex items-center justify-center gap-0.5 font-bold ${statsDiff.leg > 0 ? 'text-emerald-500' : statsDiff.leg < 0 ? 'text-orange-500' : 'text-zinc-400'}`}>{statsDiff.leg !== 0 ? (statsDiff.leg > 0 ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>) : <Minus className="w-3 h-3"/>}<span className="text-sm">{Math.abs(statsDiff.leg)}</span></div></div>
            </div>
            <div><h3 className="text-sm font-bold text-zinc-400 mb-3 mt-6">Historial Reciente</h3><div className="space-y-2">{progressHistory.map((item) => (<div key={item.id} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/50"><span className="text-zinc-500 text-xs">{new Date(item.date).toLocaleDateString()}</span><div className="flex gap-3 text-sm items-center">{item.weight && <span className="text-white font-bold">{item.weight}kg</span>}{item.arm && <span className="text-zinc-400 text-xs flex items-center gap-1"><Dumbbell className="w-3 h-3"/> {item.arm}</span>}{(item.front_photo || item.back_photo || item.side_photo) && <Camera className="w-4 h-4 text-emerald-500" />}</div></div>))}</div></div>
        </div>
    );

    // --- NUEVO: RENDER PERFIL CON FOTO ACTUALIZABLE ---
    const renderPerfil = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
             <div className="flex flex-col items-center justify-center mb-6">
                 
                 {/* FOTO DE PERFIL (INTERACTIVA) */}
                 <div 
                    className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-emerald-500 p-1 mb-3 relative group overflow-hidden cursor-pointer"
                    onClick={() => { if(!uploadingProfile) profileInputRef.current?.click(); }}
                 >
                     {/* INPUT OCULTO PARA SUBIR FOTO */}
                     <input 
                        type="file" 
                        ref={profileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleProfileFileSelect} 
                     />
                     
                     {uploadingProfile ? (
                         <div className="w-full h-full flex items-center justify-center bg-black/50"><Activity className="w-6 h-6 animate-spin text-emerald-500"/></div>
                     ) : clientPhoto ? (
                         <>
                            <img src={clientPhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            {/* Overlay de editar al pasar el ratón o tocar */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                         </>
                     ) : (
                         <div className="w-full h-full bg-zinc-700 rounded-full flex items-center justify-center text-3xl font-bold text-zinc-500 group-hover:bg-zinc-600 transition-colors relative">
                             {clientName.charAt(0)}
                             <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1 border-2 border-[#111]">
                                 <Plus className="w-3 h-3 text-black" />
                             </div>
                         </div>
                     )}
                 </div>

                 {/* Botón de borrar foto (solo si hay foto) */}
                 {clientPhoto && (
                     <button onClick={handleDeleteProfilePic} className="text-xs text-red-500 hover:text-red-400 mb-2 flex items-center gap-1">
                         <Trash2 className="w-3 h-3" /> Borrar foto
                     </button>
                 )}

                 <h2 className="text-2xl font-bold text-white">{clientName} {clientLastName}</h2>
                 <p className="text-zinc-500 text-sm">{email}</p>
                 <div className="flex gap-2 mt-2">
                     <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20">ACTIVO</span>
                     <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded border border-zinc-700">PLAN MENSUAL</span>
                 </div>
             </div>

             {/* SECCIÓN PAGO (Solo si hay link) */}
             {paymentLink && (
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl mb-6">
                     <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2 text-emerald-500 font-bold"><CreditCard className="w-5 h-5"/> Suscripción</div>
                     </div>
                     <Button onClick={() => window.open(paymentLink, '_blank')} className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400">Gestionar Pagos</Button>
                 </div>
             )}

            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all" onClick={() => window.location.href = "mailto:entrenador@fitleader.com"}>
                    <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-400" /><span className="text-white font-bold">Contactar Entrenador</span></div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                </button>
                <button onClick={() => setActiveProfileModal('notifications')} className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all"><div className="flex items-center gap-3"><Bell className="w-5 h-5 text-yellow-500" /><span className="text-white font-bold">Notificaciones</span></div><ChevronRight className="w-5 h-5 text-zinc-500" /></button>
                <button onClick={() => setActiveProfileModal('settings')} className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-white/5 rounded-xl hover:bg-zinc-800 transition-all"><div className="flex items-center gap-3"><Settings className="w-5 h-5 text-purple-500" /><span className="text-white font-bold">Configuración</span></div><ChevronRight className="w-5 h-5 text-zinc-500" /></button>
            </div>
            
            <div className="pt-8 text-center">
                <p className="text-zinc-600 text-xs mb-4">FitLeader v1.0.2</p>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-xl border border-red-500/20"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-safe selection:bg-emerald-500 selection:text-black">
            {!viewingExercises && (
                <div className="fixed top-0 w-full max-w-md left-0 right-0 mx-auto bg-black/90 backdrop-blur-md border-b border-white/10 z-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* AQUI ESTA TU LOGO NUEVO: logo.png desde la carpeta public */}
                        <img src="/logo.png" alt="FitLeader Logo" className="h-10 w-auto object-contain" />
                        <span className="font-bold text-lg text-white tracking-tight italic">FitLeader</span>
                    </div>
                </div>
            )}

            <div className="w-full max-w-md mx-auto min-h-screen bg-black relative shadow-2xl overflow-hidden">
                {activeTab === 'inicio' && renderInicio()}
                {activeTab === 'rutina' && (viewingExercises || todayWorkout ? (viewingExercises ? renderWorkoutView() : renderInicio()) : renderInicio())} 
                {activeTab === 'racha' && renderRacha()}
                {activeTab === 'progreso' && renderProgreso()}
                {activeTab === 'perfil' && renderPerfil()}

                {showCheckinModal && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                         <div className="bg-[#111] w-full max-w-sm rounded-3xl border border-zinc-800 overflow-hidden relative max-h-[90vh] overflow-y-auto p-6">
                             <button onClick={() => setShowCheckinModal(false)} className="absolute top-4 right-4 text-zinc-500"><X className="w-6 h-6"/></button>
                             <h3 className="text-xl font-bold text-white mb-4">Actualizar Datos</h3>
                             
                             <label className="text-xs text-zinc-500 mb-1 block">Peso (kg)</label>
                             <input type="number" value={formWeight} onChange={e=>setFormWeight(e.target.value)} placeholder="0.0" className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white font-bold text-xl mb-4"/>
                             
                             <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div>
                                     <label className="text-xs text-zinc-500 mb-1 block">Cintura (cm)</label>
                                     <input type="number" value={formWaist} onChange={e=>setFormWaist(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold text-lg"/>
                                 </div>
                                 <div>
                                     <label className="text-xs text-zinc-500 mb-1 block">Brazo (cm)</label>
                                     <input type="number" value={formArm} onChange={e=>setFormArm(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold text-lg"/>
                                 </div>
                             </div>

                             <div className="mb-6">
                                <label className="text-xs text-zinc-500 mb-1 block">Muslo (cm)</label>
                                <input type="number" value={formLeg} onChange={e=>setFormLeg(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-bold text-lg"/>
                             </div>

                             <Button onClick={handleSaveCheckin} disabled={saving} className="w-full bg-emerald-500 text-black font-bold h-12 rounded-xl">
                                {saving ? <Activity className="w-5 h-5 animate-spin mx-auto"/> : "Guardar Progreso"}
                             </Button>
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
                        <div className="p-4 flex items-center border-b border-white/10 bg-zinc-900">
                            <button onClick={() => setActiveProfileModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronRight className="w-6 h-6 text-white rotate-180" /></button>
                            <h2 className="text-lg font-bold text-white ml-2">{activeProfileModal === 'notifications' ? 'Notificaciones' : 'Configuración'}</h2>
                        </div>
                        
                        <div className="p-4">
                            {activeProfileModal === 'notifications' && (
                                <div className="space-y-3">
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-emerald-500"/><span className="text-white font-medium">Recordatorios de entreno</span></div>
                                        <div onClick={() => setNotifSettings((prev: any) => ({...prev, workouts: !prev.workouts}))} className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notifSettings.workouts ? 'bg-emerald-500' : 'bg-zinc-700'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifSettings.workouts ? 'translate-x-5' : 'translate-x-0'}`}/></div>
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-500"/><span className="text-white font-medium">Mensajes del coach</span></div>
                                        <div onClick={() => setNotifSettings((prev: any) => ({...prev, messages: !prev.messages}))} className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notifSettings.messages ? 'bg-emerald-500' : 'bg-zinc-700'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifSettings.messages ? 'translate-x-5' : 'translate-x-0'}`}/></div>
                                    </div>
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3"><Lightbulb className="w-5 h-5 text-yellow-500"/><span className="text-white font-medium">Novedades y Tips</span></div>
                                        <div onClick={() => setNotifSettings((prev: any) => ({...prev, tips: !prev.tips}))} className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notifSettings.tips ? 'bg-emerald-500' : 'bg-zinc-700'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifSettings.tips ? 'translate-x-5' : 'translate-x-0'}`}/></div>
                                    </div>
                                </div>
                            )}

                            {activeProfileModal === 'settings' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase ml-1">General</h3>
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                                            <button onClick={() => setConfig((prev: any) => ({ ...prev, units: prev.units === 'metric' ? 'imperial' : 'metric' }))} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800">
                                                <div className="flex items-center gap-3"><Ruler className="w-5 h-5 text-zinc-400"/><span className="text-white">Unidades</span></div>
                                                <span className="text-zinc-500 text-sm flex items-center gap-1">{config.units === 'metric' ? 'Métrico (kg/cm)' : 'Imperial (lb/in)'} <ChevronRight className="w-4 h-4"/></span>
                                            </button>
                                            <button onClick={() => setConfig((prev: any) => ({ ...prev, language: prev.language === 'es' ? 'en' : 'es' }))} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800">
                                                <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-zinc-400"/><span className="text-white">Idioma</span></div>
                                                <span className="text-zinc-500 text-sm flex items-center gap-1">{config.language === 'es' ? 'Español' : 'English'} <ChevronRight className="w-4 h-4"/></span>
                                            </button>
                                            <button onClick={() => setConfig((prev: any) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                                                <div className="flex items-center gap-3"><Moon className="w-5 h-5 text-zinc-400"/><span className="text-white">Tema</span></div>
                                                <span className="text-zinc-500 text-sm flex items-center gap-1">{config.theme === 'dark' ? 'Oscuro' : 'Claro'} <ChevronRight className="w-4 h-4"/></span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-xs font-bold text-zinc-500 uppercase ml-1">Cuenta y Seguridad</h3>
                                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                                            <button onClick={handlePasswordReset} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800">
                                                <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-zinc-400"/><span className="text-white">Cambiar Contraseña</span></div>
                                                <ChevronRight className="w-4 h-4 text-zinc-500"/>
                                            </button>
                                            <button onClick={() => window.open('https://mesquite-taleggio-73b.notion.site/TyC-306cf91ba729803dae90d6be26dd6984?pvs=73', '_blank')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800">
                                                <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-zinc-400"/><span className="text-white">Términos y Condiciones</span></div>
                                                <ChevronRight className="w-4 h-4 text-zinc-500"/>
                                            </button>
                                            <button onClick={() => window.open('https://mesquite-taleggio-73b.notion.site/POL-TICA-DE-PRIVACIDAD-FITLEADER-306cf91ba72980a095bdc4087ff7f82f?pvs=74', '_blank')} className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                                                <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-zinc-400"/><span className="text-white">Política de Privacidad</span></div>
                                                <ChevronRight className="w-4 h-4 text-zinc-500"/>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button onClick={handleDeleteAccount} className="w-full py-4 text-red-500 font-bold bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors">
                                            <Trash2 className="w-5 h-5" /> Eliminar Cuenta
                                        </button>
                                        <p className="text-[10px] text-zinc-600 text-center mt-3">Esta acción es irreversible y borrará todos tus datos.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar oculta si estamos en rutina */}
            {activeTab !== 'rutina' && !viewingExercises && (
                <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 safe-area-bottom">
                    <div className="max-w-md mx-auto flex justify-around items-center p-2 pb-4 md:pb-2">
                        {['inicio', 'rutina', 'racha', 'progreso', 'perfil'].map((tab) => (
                            <button key={tab} onClick={() => { setActiveTab(tab as any); if(tab === 'rutina') setViewingExercises(true); }} className={`flex-1 flex flex-col items-center gap-1 py-2 ${activeTab === tab ? 'text-emerald-500' : 'text-zinc-500'}`}>
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