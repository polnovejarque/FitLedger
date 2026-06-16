import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Home, ClipboardList, TrendingUp, User, LogOut, Flame, 
    Calendar as CalendarIcon, Trophy, Activity, Dumbbell,
    Bell, Settings, ChevronRight, Plus, Scale, X, Camera, Ruler, RefreshCw,
    ArrowLeft, Check, Clock, Play, SkipForward, Lightbulb, Upload, ExternalLink,
    CreditCard, Mail, ArrowDownRight, ArrowUpRight, Minus, Users, Layers, RefreshCcw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import type { ToastProps } from '../components/ui/Toast';

const DAILY_TIPS = [
    "El descanso es tan importante como el entrenamiento. Duerme al menos 7-8 horas. 😴",
    "Mantén una buena hidratación durante todo el día, no solo al entrenar. 💧",
    "Concéntrate en la técnica. ¡La calidad supera a la cantidad! ⚖️",
    "La constancia es la clave del éxito. No te saltes el calentamiento. 🔥",
    "Anota tus progresos. Ver tu evolución te mantendrá motivado. 📈",
    "No compares tu capítulo 1 con el capítulo 20 de otra persona. 🌱",
    "La proteína es esencial para la recuperación muscular. Asegura tu ingesta. 🍗"
];

const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/embed/')) return url;
    
    let videoId = '';
    try {
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
        } else if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            videoId = urlObj.searchParams.get('v') || '';
        } else if (url.includes('youtube.com/shorts/')) {
            videoId = url.split('youtube.com/shorts/')[1]?.split(/[?#]/)[0];
        }
    } catch (e) {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        videoId = match ? match[1] : '';
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const getVimeoEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('player.vimeo.com/video/')) return url;
    
    const match = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : null;
};

const getVideoEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytUrl = getYoutubeEmbedUrl(url);
    if (ytUrl) return ytUrl;
    const vimeoUrl = getVimeoEmbedUrl(url);
    if (vimeoUrl) return vimeoUrl;
    return null;
};

const isDirectVideo = (url: string) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase().split(/[?#]/)[0];
    return cleanUrl.endsWith('.mp4') || 
           cleanUrl.endsWith('.mov') || 
           cleanUrl.endsWith('.webm') || 
           cleanUrl.endsWith('.ogg') ||
           url.includes('supabase.co/storage/v1/object/public/');
};
const parseRestTime = (restTimeStr: string | null | undefined): number => {
    if (!restTimeStr) return 90;
    const match = restTimeStr.match(/\d+/);
    if (!match) return 90;
    const num = parseInt(match[0]);
    if (restTimeStr.toLowerCase().includes('min')) {
        return num * 60;
    }
    return num;
};

// --- COMPONENTE PRINCIPAL APP CLIENTE ---
const ClientWorkout = () => {
    const [clientId, setClientId] = useState<string | null>(null);
    const [clientName, setClientName] = useState("Atleta");
    const [clientLastName, setClientLastName] = useState("");
    const [email, setEmail] = useState("");
    const [clientPhoto, setClientPhoto] = useState<string | null>(null);
    const [paymentLink, setPaymentLink] = useState<string | null>(null);
    
    const [todayPlans, setTodayPlans] = useState<any[]>([]); 
    const [todayWorkout, setTodayWorkout] = useState<any>(null);
    const [weeklyPlan, setWeeklyPlan] = useState<any[]>([]);
    const [todayDayId, setTodayDayId] = useState<number>(1);
    
    // --- ESTADOS DE UI (Toasts y Confirms) ---
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void} | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts(prev => [...prev, { id, message, type, onClose: (tId) => setToasts(p => p.filter(t => t.id !== tId)) }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
    };
    
    // --- ESTADO NUEVO: RUTINAS COMPLETADAS HOY ---
    const [completedToday, setCompletedToday] = useState<Set<number>>(new Set());

    const [coachLogo, setCoachLogo] = useState<string>('/logo.png');
    const [coachBusinessName, setCoachBusinessName] = useState<string>('FitLeader');
    const [studioId, setStudioId] = useState<string | null>(null);
    const [groupClasses, setGroupClasses] = useState<any[]>([]);

    const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [exercises, setExercises] = useState<any[]>([]);
    const [currentDayFilter, setCurrentDayFilter] = useState("Día 1"); 
    const [viewingExercises, setViewingExercises] = useState(false);
    const [workoutLogs, setWorkoutLogs] = useState<any>({}); 

    const [timerActive, setTimerActive] = useState(false);
    const [timerTime, setTimerTime] = useState(90); 
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

    const [currentWeight, setCurrentWeight] = useState<string>("--");
    const [currentWaist, setCurrentWaist] = useState<string>("--");
    const [currentArm, setCurrentArm] = useState<string>("--");
    const [currentLeg, setCurrentLeg] = useState<string>("--"); 
    const [progressHistory, setProgressHistory] = useState<any[]>([]);
    
    const [statsDiff, setStatsDiff] = useState({ weight: 0, waist: 0, arm: 0, leg: 0 });
    const [monthlyWorkouts, setMonthlyWorkouts] = useState(0);
    const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
    const weeklyGoal = weeklyPlan.length > 0 ? new Set(weeklyPlan.map(p => p.day_of_week)).size : 4;

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

    const [activeTab, setActiveTab] = useState<'inicio' | 'reservas' | 'plan' | 'progreso' | 'perfil'>('inicio');
    const [activeProfileModal, setActiveProfileModal] = useState<'notifications' | 'settings' | null>(null);
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [_fileToUpload, setFileToUpload] = useState<File | null>(null);

    const [notifSettings, setNotifSettings] = useState(() => {
        const saved = localStorage.getItem('fit_client_notifs');
        return saved ? JSON.parse(saved) : { workouts: true, messages: true, tips: false };
    });

    useEffect(() => { localStorage.setItem('fit_client_notifs', JSON.stringify(notifSettings)); }, [notifSettings]);

    // --- FORMULARIO DE CHECK-IN AMPLIADO ---
    const [formWeight, setFormWeight] = useState("");
    const [formWaist, setFormWaist] = useState("");
    const [formArm, setFormArm] = useState("");
    const [formLeg, setFormLeg] = useState("");
    const [saving, setSaving] = useState(false);

    // const profileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingProfile] = useState(false);

    useEffect(() => {
        let interval: any;
        if (timerActive && timerTime > 0) {
            interval = setInterval(() => setTimerTime((prev) => prev - 1), 1000);
        } else if (timerTime === 0 && timerActive) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
            audio.play().catch(e => console.log("Audio play failed", e));
            setTimerActive(false); 
        }
        return () => clearInterval(interval);
    }, [timerActive, timerTime]);

    // --- CARGA DE DATOS PRINCIPAL ---
    const fetchClientData = useCallback(async (showSpinners = true) => {
        if (showSpinners) setLoading(true);
        const storedEmail = localStorage.getItem('fit_client_email');
        
        if (storedEmail) {
            try {
                const { data: clientData, error: clientError } = await supabase
                    .from('clients')
                    .select('id, name, email, image_url, stripe_link, user_id')
                    .eq('email', storedEmail) 
                    .single();
                
                if (clientError) throw clientError;
            
            if (clientData) {
                setClientId(clientData.id);
                const nameParts = clientData.name.split(' ');
                setClientName(nameParts[0]);
                setClientLastName(nameParts.length > 1 ? nameParts[1] : "");
                setEmail(clientData.email);
                setClientPhoto(clientData.image_url);
                setPaymentLink(clientData.stripe_link);

                if (clientData.user_id) { 
                    setStudioId(clientData.user_id);
                    const { data: coachProfile } = await supabase
                        .from('profiles')
                        .select('logo_url, business_name')
                        .eq('id', clientData.user_id) 
                        .single();

                    if (coachProfile) {
                        if (coachProfile.logo_url) setCoachLogo(coachProfile.logo_url);
                        if (coachProfile.business_name) setCoachBusinessName(coachProfile.business_name);
                    }
                    
                    fetchClasses(clientData.user_id, clientData.id);
                }

                const currentDayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay();
                setTodayDayId(currentDayOfWeek);

                const { data: planData } = await supabase
                    .from('client_weekly_plan')
                    .select('*')
                    .eq('client_id', clientData.id)
                    .order('id', { ascending: true });

                if (planData && planData.length > 0) {
                    const routineIds = planData.map(p => p.routine_id);
                    const { data: routinesData, error: routinesError } = await supabase
                        .from('routines')
                        .select('id, name')
                        .in('id', routineIds);
                        
                    if (routinesError) console.error("Error cargando rutinas:", routinesError);

                    const normalizedPlans = planData.map(p => {
                        const routineObj = routinesData?.find(r => r.id === p.routine_id);
                        return { 
                            ...p, 
                            routines: routineObj || { id: p.routine_id, name: "⚠️ Rutina Bloqueada (Permisos)" } 
                        };
                    });
                    
                    setWeeklyPlan(normalizedPlans);
                    
                    const currentDayPlans = normalizedPlans.filter(p => p.day_of_week === currentDayOfWeek);
                    setTodayPlans(currentDayPlans);

                    // Nueva lógica de stats pasando TODOS los IDs
                    if (normalizedPlans.length > 0) {
                        const allPlanIds = normalizedPlans.map(p => p.id);
                        fetchWorkoutStats(allPlanIds);
                    }
                } else {
                    const { data: assignment } = await supabase
                        .from('routine_assignments')
                        .select(`*, routine:routines!fk_routine (*)`) 
                        .eq('client_id', clientData.id)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    if (assignment && assignment.routine) {
                        const legacyRoutine = { ...assignment.routine, is_completed_today: false };
                        setTodayPlans([{ id: assignment.id, routines: legacyRoutine }]);
                        fetchWorkoutStats([assignment.id]);
                    } else {
                        setTodayPlans([]);
                        setWeeklyPlan([]);
                        fetchWorkoutStats([]);
                    }
                }

                fetchProgress(clientData.id);
            } // Fin if (clientData)
            } catch (error) {
                console.error("Error al cargar datos del cliente:", error);
                // Si hay un error, dejamos que la interfaz al menos cargue para no quedarse en blanco
            }
        }
        setLoading(false);
        setIsRefreshing(false);
    }, []);

    useEffect(() => {
        fetchClientData();

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setIsRefreshing(true);
                fetchClientData(false);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [fetchClientData]);

    const handleManualRefresh = () => {
        setIsRefreshing(true);
        fetchClientData(false);
    };

    const fetchClasses = async (studioId: string, clientId: string) => {
        const today = new Date().toISOString();
        const { data: events } = await supabase.from('calendar_events').select('*').eq('studio_id', studioId).eq('type', 'group').gte('date', today).order('date', { ascending: true });

        if (events && events.length > 0) {
            const staffIds = Array.from(new Set(events.map(e => e.assigned_staff_id).filter(Boolean)));
            const { data: staffProfiles } = await supabase.from('profiles').select('id, business_name').in('id', staffIds);
            const eventIds = events.map(e => e.id);
            const { data: bookings } = await supabase.from('class_bookings').select('*').in('event_id', eventIds);

            const classesWithBookingData = events.map(ev => {
                const coach = staffProfiles?.find(p => p.id === ev.assigned_staff_id);
                const evBookings = bookings?.filter(b => b.event_id === ev.id) || [];
                const isBooked = evBookings.some(b => b.client_id === clientId && b.status === 'booked');
                const isWaitlisted = evBookings.some(b => b.client_id === clientId && b.status === 'waitlist');
                const bookedCount = evBookings.filter(b => b.status === 'booked').length;
                
                return {
                    ...ev,
                    coach_name: coach?.business_name || 'Staff',
                    bookedCount,
                    spotsLeft: (ev.max_capacity || 1) - bookedCount,
                    isBooked,
                    isWaitlisted
                };
            });
            setGroupClasses(classesWithBookingData);
        } else {
            setGroupClasses([]);
        }
    };

    const handleBookClass = async (eventId: number, status: 'booked' | 'waitlist') => {
        if (!clientId || !studioId) return;
        setLoading(true);
        try {
            const { error } = await supabase.from('class_bookings').insert({ event_id: eventId, client_id: clientId, status: status });
            if (error) throw error;
            showToast(status === 'booked' ? "¡Plaza reservada! 🎉" : "Añadido a lista de espera.", 'success');
            fetchClasses(studioId, clientId);
        } catch (err: any) { showToast("Error al reservar: " + err.message, 'error'); } finally { setLoading(false); }
    };

    const handleCancelBooking = async (eventId: number) => {
        if (!clientId || !studioId) return;
        setConfirmDialog({
            isOpen: true,
            title: "Cancelar Reserva",
            message: "¿Seguro que quieres cancelar tu reserva?",
            onConfirm: async () => {
                setConfirmDialog(null);
                setLoading(true);
                try {
                    const { error } = await supabase.from('class_bookings').delete().eq('event_id', eventId).eq('client_id', clientId);
                    if (error) throw error;
                    showToast("Reserva cancelada.", 'info');
                    fetchClasses(studioId, clientId);
                } catch (err: any) { showToast("Error al cancelar: " + err.message, 'error'); } finally { setLoading(false); }
            }
        });
    };

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

    // --- NUEVA LÓGICA DE STATS Y COMPLETADOS ---
    const fetchWorkoutStats = async (planIds: number[]) => {
        if (!planIds || planIds.length === 0) {
            setMonthlyWorkouts(0); setWeeklyWorkouts(0); setCompletedToday(new Set()); return;
        }

        try {
            const now = new Date();
            const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
            const { start: startWeek, end: endWeek } = getWeekRange();

            const { data: results } = await supabase.from('workout_results')
                .select('created_at, assignment_id')
                .in('assignment_id', planIds)
                .gte('created_at', firstDayMonth)
                .lte('created_at', lastDayMonth);

            if (results && results.length > 0) {
                const weeklyResults = results.filter((r: any) => r.created_at >= startWeek && r.created_at <= endWeek);
                const uniqueMonthlyDays = new Set(results.map((r: any) => r.created_at.split('T')[0]));
                setMonthlyWorkouts(uniqueMonthlyDays.size);
                
                const uniqueWeeklyDays = new Set(weeklyResults.map((r: any) => r.created_at.split('T')[0]));
                setWeeklyWorkouts(uniqueWeeklyDays.size);

                // Comprobar cuáles se han completado hoy
                const todayStr = now.toISOString().split('T')[0];
                const completed = new Set<number>(
                    results.filter((r:any) => r.created_at.startsWith(todayStr)).map((r:any) => r.assignment_id)
                );
                setCompletedToday(completed);
            } else {
                setMonthlyWorkouts(0); setWeeklyWorkouts(0); setCompletedToday(new Set());
            }
        } catch (error) { console.error("Error estadísticas:", error); }
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

    const startWorkout = async (routine: any, planOrAssignmentId: string) => {
        if(routine?.name?.includes("Bloqueada") || routine?.name?.includes("Sincronizando")) {
            showToast("⚠️ Esta rutina está bloqueada. Consulta con tu Coach.", 'error');
            return;
        }

        setLoading(true);
        setTodayWorkout(routine);
        setCurrentAssignmentId(planOrAssignmentId);
        
        const { data: exerciseData } = await supabase
            .from('routine_exercises')
            .select('*')
            .eq('routine_id', routine.id)
            .order('id', { ascending: true }); 
        
        setExercises(exerciseData || []);
        
        const uniqueDays = Array.from(new Set((exerciseData || []).map((ex: any) => ex.day_name))).filter(Boolean);
        if (uniqueDays.length > 0) setCurrentDayFilter(uniqueDays[0] as string);

        setViewingExercises(true);
        setActiveTab('plan'); 
        setLoading(false);
    };

    const handleLogChange = (exerciseId: number, setIndex: number, field: 'weight' | 'reps', value: string) => {
        setWorkoutLogs((prev: any) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], [setIndex]: { ...prev[exerciseId]?.[setIndex], [field]: value } } }));
    };

    const toggleSetComplete = (exerciseId: number, setIndex: number, restTimeStr: string | null | undefined) => {
        setWorkoutLogs((prev: any) => {
            const currentExercise = prev[exerciseId] || {};
            const currentSet = currentExercise[setIndex] || {};
            const isNowDone = !currentSet.done;
            if (isNowDone) { 
                const seconds = parseRestTime(restTimeStr);
                setTimerTime(seconds); 
                setTimerActive(true); 
            }
            return { ...prev, [exerciseId]: { ...currentExercise, [setIndex]: { ...currentSet, done: isNowDone } } };
        });
    };

    const handleFinishWorkout = async () => {
        if (!currentAssignmentId || !clientId) return;

        const hasLogs = Object.keys(workoutLogs).length > 0;
        
        const finishAction = async () => {
            setConfirmDialog(null);
            setLoading(true);
            try {
                const resultsToSave: any[] = [];
                Object.entries(workoutLogs).forEach(([exerciseId, sets]: any) => {
                    Object.entries(sets).forEach(([setNumber, data]: any) => {
                        if (data.done || data.weight || data.reps) {
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
                    const { error: resultsErr } = await supabase.from('workout_results').insert(resultsToSave);
                    if (resultsErr) throw resultsErr;
                }

                setWorkoutLogs({});
                showToast(`¡Sesión Completada! 🎉 Sigue así.`, 'success');
                
                await fetchClientData(false);
                
                setActiveTab('inicio'); 
                setViewingExercises(false);
                setTimerActive(false);
                
            } catch (error: any) {
                showToast("Hubo un error al guardar: " + error.message, 'error');
            } finally {
                setLoading(false);
            }
        };

        if (!hasLogs) {
            setConfirmDialog({
                isOpen: true,
                title: "Sesión Vacía",
                message: "No has completado ninguna serie. ¿Seguro que quieres finalizar?",
                onConfirm: finishAction
            });
        } else {
            setConfirmDialog({
                isOpen: true,
                title: "Finalizar Entrenamiento",
                message: "¿Guardar marcas y completar sesión?",
                onConfirm: finishAction
            });
        }
    };

    // --- NUEVO: GUARDAR CHECKIN CON TODAS LAS MÉTRICAS ---
    const handleSaveCheckin = async () => { 
        if(!clientId) return;
        setSaving(true);
        try {
            const payload: any = { client_id: clientId, date: new Date().toISOString() };
            if(formWeight) payload.weight = parseFloat(formWeight);
            if(formWaist) payload.waist = parseFloat(formWaist);
            if(formArm) payload.arm = parseFloat(formArm);
            if(formLeg) payload.leg = parseFloat(formLeg);
            
            const { error } = await supabase.from('client_progress').insert([payload]);
            if(error) throw error;
            
            showToast("Progreso guardado correctamente.", 'success');
            setShowCheckinModal(false);
            
            // Limpiamos formulario
            setFormWeight(""); setFormWaist(""); setFormArm(""); setFormLeg("");
            fetchProgress(clientId);
        } catch (error: any) {
            showToast("Error al guardar el progreso. Inténtalo de nuevo.", 'error');
        } finally {
            setSaving(false);
        }
    };
    
    // Funciones en mantenimiento ocultadas (CA5)
    // const handleDeleteBefore = async () => { alert("Borrado en mantenimiento"); };
    // const handleDeleteAccount = async () => { alert("Borrar cuenta en mantenimiento"); };
    // const handleProfileFileSelect = async () => { alert("Cambio foto perfil en mantenimiento"); };
    // const handleDeleteProfilePic = async () => { alert("Borrado foto perfil en mantenimiento"); };

    const handleLogout = () => { 
        setConfirmDialog({
            isOpen: true,
            title: "Cerrar Sesión",
            message: "¿Seguro que quieres salir de la aplicación?",
            onConfirm: () => {
                localStorage.removeItem('fit_client_email'); 
                window.location.href = "/client-app";
            }
        });
    };

    if (loading && !clientId) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Activity className="w-10 h-10 animate-spin" /></div>;

    const renderWorkoutView = () => {
        if (!todayWorkout) { setViewingExercises(false); setActiveTab('plan'); return null; }
        
        let displayExercises = exercises;
        if (weeklyPlan.length === 0 && currentDayFilter) {
            displayExercises = exercises.filter(ex => ex.day_name === currentDayFilter) || exercises;
        }

        const blocks = Array.from(new Set(displayExercises.map(ex => ex.block_name || 'Bloque Principal')));

        return (
            <div className="min-h-screen bg-black pb-32 animate-in fade-in relative">
                <div className="fixed top-0 w-full max-w-md left-0 right-0 mx-auto bg-black border-b border-zinc-800 z-50 px-6 py-4 flex items-center justify-between">
                    <button onClick={() => { setViewingExercises(false); setActiveTab('plan'); }} className="flex items-center gap-2 text-zinc-400">
                        <ArrowLeft className="w-5 h-5" /> Volver al Plan
                    </button>
                    <h1 className="text-lg font-bold text-white tracking-tight truncate">{todayWorkout.name}</h1>
                </div>

                <div className="px-6 pt-24 space-y-6">
                    {displayExercises.length === 0 ? (
                        <p className="text-zinc-500 italic text-center py-10">Cargando ejercicios...</p>
                    ) : (
                        blocks.map(blockName => {
                            const blockExs = displayExercises.filter(ex => (ex.block_name || 'Bloque Principal') === blockName);
                            if (blockExs.length === 0) return null;
                            
                            return (
                                <div key={blockName} className="space-y-4">
                                    <h3 className="text-emerald-500 font-bold uppercase text-xs flex items-center gap-2 px-1">
                                        <Layers className="w-4 h-4" /> {blockName}
                                    </h3>
                                    
                                    {blockExs.map((ex, index) => (
                                        <div key={ex.id || index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4">
                                            <div className="flex gap-4 items-start">
                                                <div 
                                                    onClick={() => { if(ex.video_url) setPlayingVideoUrl(ex.video_url); else showToast("No hay vídeo disponible para este ejercicio.", 'info'); }}
                                                    className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 relative cursor-pointer"
                                                >
                                                    {ex.image_url ? (
                                                        <><img src={ex.image_url} className="w-full h-full object-cover opacity-80" alt={ex.exercise_name} /><div className="absolute inset-0 flex items-center justify-center bg-black/30"><Play className="w-5 h-5 text-white opacity-80" fill="white" /></div></>
                                                    ) : (<div className="w-full h-full flex items-center justify-center"><Dumbbell className="w-6 h-6 text-zinc-600" /></div>)}
                                                </div>
                                                <div className="flex-1 py-1">
                                                    <h3 className="text-white font-bold text-lg leading-tight mb-2">{ex.exercise_name}</h3>
                                                    
                                                    {ex.notes && (
                                                        <div className="bg-zinc-800/80 rounded-md p-2 mb-3 border-l-2 border-emerald-500">
                                                            <p className="text-[11px] text-zinc-300 italic leading-relaxed">
                                                                <span className="font-bold text-emerald-500 not-italic mr-1">Nota:</span> 
                                                                {ex.notes}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="px-2.5 py-1 bg-zinc-800 rounded-md text-[11px] font-semibold text-zinc-300 border border-zinc-700/50">
                                                            {ex.sets} {ex.sets === 1 ? 'Serie' : 'Series'}
                                                        </span>
                                                        
                                                        {ex.exercise_type === 'time' ? (
                                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                Tiempo: {ex.time_duration || '--'}
                                                            </span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-md text-[11px] font-bold border border-emerald-500/20 flex items-center gap-1">
                                                                Reps: {ex.reps || '--'}
                                                            </span>
                                                        )}

                                                        {ex.rest_time && (
                                                            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-md text-[11px] font-bold border border-blue-500/20 flex items-center gap-1">
                                                                Descanso: {ex.rest_time}
                                                            </span>
                                                        )}

                                                        {ex.rir !== null && ex.rir !== undefined && ex.rir !== "" && (
                                                            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-md text-[11px] font-bold border border-amber-500/20 flex items-center gap-1">
                                                                RIR: {ex.rir}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-10 gap-2 text-[10px] uppercase font-bold text-zinc-500 text-center">
                                                    <div className="col-span-1">#</div>
                                                    <div className="col-span-4">KG</div>
                                                    <div className="col-span-4">{ex.exercise_type === 'time' ? 'TIEMPO' : 'REPS'}</div>
                                                    <div className="col-span-1"></div>
                                                </div>
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
                                                                    className="w-full bg-black border border-zinc-800 rounded p-2.5 text-center font-bold focus:outline-none focus:border-emerald-500 text-white" 
                                                                />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-700 font-bold pointer-events-none">KG</span>
                                                            </div>
                                                            <div className="col-span-4 relative">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder={ex.exercise_type === 'time' ? (ex.time_duration || '0') : (ex.reps || '0')} 
                                                                    value={log.reps || ''} 
                                                                    onChange={(e) => handleLogChange(ex.id, setNum, 'reps', e.target.value)} 
                                                                    className="w-full bg-black border border-zinc-800 rounded p-2.5 text-center font-bold focus:outline-none focus:border-emerald-500 text-white" 
                                                                />
                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-700 font-bold pointer-events-none uppercase">
                                                                    {ex.exercise_type === 'time' ? 'TIME' : 'REPS'}
                                                                </span>
                                                            </div>
                                                            <div className="col-span-1 flex justify-center">
                                                                <button 
                                                                    onClick={() => toggleSetComplete(ex.id, setNum, ex.rest_time)} 
                                                                    className={`w-8 h-8 rounded flex items-center justify-center ${isDone ? 'bg-emerald-500 text-black shadow' : 'bg-zinc-800 text-zinc-600 hover:text-white transition-colors'}`}
                                                                >
                                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        })
                    )}
                </div>

                {timerActive && (
                    <div className="fixed bottom-20 left-4 right-4 bg-zinc-900 border border-emerald-500/30 p-4 rounded-xl shadow-2xl z-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-emerald-500" />
                            <div><p className="text-[10px] text-zinc-400 font-medium">Descanso</p><p className="text-xl font-bold text-white tabular-nums leading-none">{Math.floor(timerTime / 60)}:{String(timerTime % 60).padStart(2, '0')}</p></div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setTimerTime(t => t + 30)} className="bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded">+30s</button>
                            <button onClick={() => setTimerActive(false)} className="bg-emerald-500 text-black p-1.5 rounded"><SkipForward className="w-4 h-4 fill-black" /></button>
                        </div>
                    </div>
                )}
                {playingVideoUrl && (() => {
                    const embedUrl = getVideoEmbedUrl(playingVideoUrl);
                    const isDirect = isDirectVideo(playingVideoUrl);
                    
                    return (
                        <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4" onClick={() => setPlayingVideoUrl(null)}>
                            <button onClick={() => setPlayingVideoUrl(null)} className="absolute top-6 right-6 text-white z-50 hover:text-emerald-400 transition-colors">
                                <X className="w-8 h-8" />
                            </button>
                            
                            <div className="w-full max-w-4xl rounded-xl overflow-hidden aspect-video bg-zinc-950 flex items-center justify-center border border-zinc-800" onClick={(e) => e.stopPropagation()}>
                                {embedUrl ? (
                                    <iframe 
                                        src={embedUrl} 
                                        title="Video del ejercicio" 
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen 
                                        className="w-full h-full"
                                    />
                                ) : isDirect ? (
                                    <video src={playingVideoUrl} controls autoPlay playsInline className="w-full h-full" />
                                ) : (
                                    <div className="text-center p-8 max-w-md">
                                        <p className="text-zinc-300 text-sm mb-6 leading-relaxed">
                                            Este enlace de video no se puede reproducir directamente en la aplicación. Puedes abrirlo en tu navegador.
                                        </p>
                                        <a 
                                            href={playingVideoUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-5 py-2.5 rounded-lg transition-colors text-sm shadow-lg shadow-emerald-500/20"
                                        >
                                            Abrir enlace de video <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}
                <div className="fixed bottom-0 left-0 w-full bg-black/80 pt-6 pb-6 px-6 z-40 border-t border-zinc-800">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg py-5 rounded-lg shadow uppercase" onClick={handleFinishWorkout}>
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
                <div className="flex justify-between items-center mb-2"><div><h1 className="text-3xl font-bold text-white">Hola, {clientName} 👋</h1><p className="text-zinc-400 text-xs mt-1">Vamos a por el objetivo de hoy.</p></div><button className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full hover:bg-zinc-800"><Flame className="w-4 h-4 text-orange-500" /><span className="text-white font-bold text-sm">{monthlyWorkouts}</span></button></div>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 relative overflow-hidden"><div className="flex justify-between items-start mb-4 relative z-10"><div><h3 className="text-emerald-400 font-bold text-xs mb-1 uppercase tracking-wider">Objetivo Semanal</h3><div className="flex items-baseline gap-1"><span className="text-3xl font-bold text-white">{weeklyWorkouts}</span><span className="text-zinc-400 text-sm">/ {weeklyGoal} sesiones</span></div></div><Trophy className="w-6 h-6 text-emerald-600" /></div><div className="h-1.5 w-full bg-zinc-800 rounded-full mb-1 relative z-10"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} /></div><p className="text-right text-[10px] text-emerald-500 font-medium relative z-10">{weeklyWorkouts >= weeklyGoal ? "¡Objetivo cumplido! 🔥" : "¡Casi lo tienes!"}</p></div>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-4 items-start"><div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0"><Lightbulb className="w-5 h-5 text-yellow-500" /></div><div><h3 className="text-white font-bold text-sm mb-1">Tip del Día</h3><p className="text-zinc-400 text-xs leading-relaxed">{DAILY_TIPS[todayDayId % 7]}</p></div></div>
                
                <div>
                    <h3 className="text-white font-bold text-lg mb-3">Tu plan de hoy:</h3>
                    {todayPlans.length > 0 ? (
                        <div className="space-y-3">
                            {todayPlans.map(plan => {
                                const routine = plan.routines;
                                const isError = routine?.name?.includes('Bloqueada');
                                const isDone = completedToday.has(plan.id);

                                return (
                                    <div key={plan.id} onClick={() => !isError && !isDone && startWorkout(routine, plan.id.toString())} className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between transition-colors ${isError ? 'border-orange-500/30 opacity-70 cursor-not-allowed' : isDone ? 'border-emerald-500/50 opacity-80 cursor-default' : 'cursor-pointer hover:border-emerald-500/30 group'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isError ? 'text-orange-500 bg-zinc-800' : isDone ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-emerald-500 group-hover:bg-emerald-500/10'}`}>
                                                {isDone ? <Check className="w-6 h-6" /> : <ClipboardList className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-base transition-colors ${isDone ? 'text-emerald-500' : 'text-white group-hover:text-emerald-400'}`}>{routine?.name}</h3>
                                                <p className={`text-xs flex items-center gap-1 ${isDone ? 'text-emerald-500/70' : 'text-zinc-500'}`}>
                                                    {isError ? <><Clock className="w-3 h-3"/> Consulta con tu Coach</> : isDone ? <><Check className="w-3 h-3"/> Completado</> : <><Clock className="w-3 h-3"/> Toca empezar</>}
                                                </p>
                                            </div>
                                        </div>
                                        {!isDone && (
                                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black"><ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-black" /></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2"><ClipboardList className="w-6 h-6 text-zinc-500" /></div>
                            <p className="text-zinc-400 text-sm mb-2">Día de descanso en tu planificación.</p>
                            <button onClick={() => setActiveTab('plan')} className="text-emerald-500 text-xs font-bold hover:underline">Ver semana completa</button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderPlanSemanal = () => {
        const DAYS = [
            { id: 1, name: 'Lunes' }, { id: 2, name: 'Martes' }, { id: 3, name: 'Miércoles' },
            { id: 4, name: 'Jueves' }, { id: 5, name: 'Viernes' }, { id: 6, name: 'Sábado' }, { id: 7, name: 'Domingo' }
        ];

        return (
            <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-white">Tu Semana</h2>
                    <p className="text-zinc-400 text-xs mt-1">Sigue la planificación de tu coach.</p>
                </div>

                <div className="space-y-4">
                    {weeklyPlan.length > 0 ? DAYS.map(day => {
                        const isToday = day.id === todayDayId;
                        const dayPlans = weeklyPlan.filter(p => p.day_of_week === day.id);

                        return (
                            <div key={day.id} className={`bg-zinc-900 border ${isToday ? 'border-emerald-500' : 'border-zinc-800'} rounded-xl p-4`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`font-bold text-sm uppercase tracking-wider ${isToday ? 'text-emerald-500' : 'text-zinc-400'}`}>
                                        {day.name} {isToday && '(Hoy)'}
                                    </h3>
                                </div>

                                {dayPlans.length > 0 ? (
                                    <div className="space-y-2 mt-2">
                                        {dayPlans.map(plan => {
                                            const isError = plan.routines?.name?.includes("Bloqueada");
                                            const isDone = completedToday.has(plan.id);
                                            
                                            return (
                                                <button 
                                                    key={plan.id} 
                                                    onClick={() => !isError && !isDone && startWorkout(plan.routines, plan.id.toString())} 
                                                    className={`w-full flex items-center justify-between border p-3 rounded-lg text-left transition-all ${isError ? 'opacity-60 border-orange-500/30 bg-zinc-800 cursor-not-allowed' : isDone ? 'border-emerald-500/50 bg-zinc-900/50 cursor-default' : 'bg-zinc-800 border-zinc-700 hover:border-emerald-500 group'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded ${isError ? 'bg-zinc-700' : isDone ? 'bg-emerald-500/20' : 'bg-zinc-700 group-hover:bg-emerald-500/10'}`}>
                                                            {isDone ? <Check className="w-4 h-4 text-emerald-500" /> : <Dumbbell className={`w-4 h-4 ${isError ? 'text-orange-500' : 'text-emerald-500'}`} />}
                                                        </div>
                                                        <div>
                                                            <span className={`font-bold text-sm block leading-tight transition-colors ${isError ? 'text-orange-400' : isDone ? 'text-emerald-500' : 'text-white'}`}>{plan.routines?.name}</span>
                                                            <span className="text-[10px] text-zinc-400 font-medium">{isError ? 'Consulta con tu Coach' : isDone ? 'Completado' : 'Haz clic para empezar'}</span>
                                                        </div>
                                                    </div>
                                                    {!isDone && <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-zinc-800/50 rounded-lg p-3 border border-dashed border-zinc-700 text-center">
                                        <p className="text-xs text-zinc-500 italic">Descanso Activo</p>
                                    </div>
                                )}
                            </div>
                        )
                    }) : (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                            <CalendarIcon className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400 text-sm mb-4">No tienes una planificación semanal asignada.</p>
                            {todayPlans.length > 0 && (
                                <button onClick={() => startWorkout(todayPlans[0].routines, todayPlans[0].id.toString())} className="bg-emerald-500 text-black font-bold text-sm px-6 py-2 rounded-lg">
                                    Ver Mi Rutina Base
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderReservas = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white">Clases Disponibles</h2>
                    <p className="text-zinc-400 text-xs mt-1">Reserva tu plaza en el estudio.</p>
                </div>
            </div>

            <div className="space-y-4">
                {groupClasses.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                        <CalendarIcon className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm">No hay clases programadas próximamente.</p>
                    </div>
                ) : (
                    groupClasses.map((cls) => {
                        const classDate = new Date(cls.date);
                        const isFull = cls.spotsLeft <= 0;
                        const isBooked = cls.isBooked;
                        const isWaitlisted = cls.isWaitlisted;
                        
                        return (
                            <div key={cls.id} className={`bg-zinc-900 border ${isBooked ? 'border-emerald-500/50' : 'border-zinc-800'} rounded-xl p-5 relative overflow-hidden`}>
                                {isBooked && <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl shadow">RESERVADO</div>}
                                {isWaitlisted && <div className="absolute top-0 right-0 bg-orange-500 text-black text-[10px] font-bold px-3 py-1 rounded-bl shadow">EN ESPERA</div>}
                                
                                <div className="flex gap-4 items-start">
                                    <div className="w-14 h-14 bg-zinc-800 rounded border border-zinc-700 flex flex-col items-center justify-center flex-shrink-0">
                                        <span className="text-xs text-zinc-400 font-bold uppercase">{classDate.toLocaleDateString('es-ES', { weekday: 'short' })}</span>
                                        <span className="text-lg font-black text-white leading-none mt-0.5">{classDate.getDate()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold text-lg leading-tight mb-1">{cls.title}</h3>
                                        <p className="text-zinc-400 text-xs mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> {cls.coach_name}</p>
                                        
                                        <div className="flex items-center gap-2 text-xs font-medium">
                                            <span className="flex items-center gap-1 text-zinc-300 bg-zinc-800 px-2 py-1 rounded-md border border-zinc-700">
                                                <Clock className="w-3.5 h-3.5 text-zinc-400"/> 
                                                {classDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} ({cls.duration}h)
                                            </span>
                                            <span className={`flex items-center gap-1 px-2 py-1 rounded-md border ${isFull ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                                <Users className="w-3.5 h-3.5"/> {isFull ? 'Completa' : `${cls.spotsLeft} libres`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-5 pt-4 border-t border-zinc-800">
                                    {(isBooked || isWaitlisted) ? (
                                        <Button onClick={() => handleCancelBooking(cls.id)} className="w-full bg-zinc-800 text-red-400 border border-red-500/20 hover:bg-red-500/10 font-bold h-11 rounded-lg">
                                            Cancelar Reserva
                                        </Button>
                                    ) : (
                                        <Button 
                                            onClick={() => handleBookClass(cls.id, isFull ? 'waitlist' : 'booked')} 
                                            className={`w-full font-bold h-11 rounded-lg ${isFull ? 'bg-orange-500 text-black hover:bg-orange-400' : 'bg-emerald-500 text-black hover:bg-emerald-400'}`}
                                        >
                                            {isFull ? 'Unirse a Lista de Espera' : 'Reservar Plaza'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );

    const renderProgreso = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
            <div className="flex justify-between items-center mb-2"><h2 className="text-2xl font-bold text-white flex items-center gap-2">Tu Evolución 📈</h2><button onClick={() => setShowCheckinModal(true)} className="bg-zinc-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-700 flex items-center gap-1">+ Registrar</button></div>
            <div className="bg-zinc-900 p-1 rounded grid grid-cols-3 gap-1 mb-4"><button onClick={() => setViewAngle('front')} className={`text-xs font-bold py-1.5 rounded ${viewAngle === 'front' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Frontal</button><button onClick={() => setViewAngle('back')} className={`text-xs font-bold py-1.5 rounded ${viewAngle === 'back' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Espalda</button><button onClick={() => setViewAngle('side')} className={`text-xs font-bold py-1.5 rounded ${viewAngle === 'side' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Perfil</button></div>
            <div className="grid grid-cols-2 gap-3">
                <div className="relative aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group">
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded border border-white/10">ANTES</div>
                    {photos[viewAngle].before ? (<img src={photos[viewAngle].before!} alt="Antes" className="w-full h-full object-cover opacity-80" />) : (<div onClick={() => { setFileToUpload(null); setPreviewUrl(null); setShowPhotoModal(true); }} className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2 cursor-pointer hover:bg-zinc-800"><User className="w-8 h-8 opacity-20" /><span className="text-[10px] text-center px-2">Sin foto inicial</span></div>)}
                </div>
                {photos[viewAngle].now ? (<div className="relative aspect-[3/4] bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden group"><div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">AHORA</div><img src={photos[viewAngle].now!} alt="Ahora" className="w-full h-full object-cover" /><button onClick={() => { setFileToUpload(null); setPreviewUrl(null); setShowPhotoModal(true); }} className="absolute bottom-2 right-2 p-2 bg-emerald-500 rounded-full shadow-lg text-black hover:scale-105 transition-transform"><RefreshCw className="w-4 h-4" /></button></div>) : (<button onClick={() => { setFileToUpload(null); setPreviewUrl(null); setShowPhotoModal(true); }} className="aspect-[3/4] bg-zinc-900 rounded-xl border border-emerald-500/30 border-dashed flex flex-col items-center justify-center gap-3 hover:bg-emerald-500/5 group relative"><div className="absolute top-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">AHORA</div><div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform"><Plus className="w-5 h-5 text-emerald-500" /></div><span className="text-xs font-bold text-emerald-500">Subir {viewAngle === 'front' ? 'Frontal' : viewAngle === 'back' ? 'Espalda' : 'Perfil'}</span></button>)}
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
            <div><h3 className="text-sm font-bold text-zinc-400 mb-3 mt-6">Historial Reciente</h3><div className="space-y-2">{progressHistory.map((item) => (<div key={item.id} className="flex justify-between items-center p-3 bg-zinc-900 rounded-xl border border-zinc-800"><span className="text-zinc-500 text-xs">{new Date(item.date).toLocaleDateString()}</span><div className="flex gap-3 text-sm items-center">{item.weight && <span className="text-white font-bold">{item.weight}kg</span>}{item.arm && <span className="text-zinc-400 text-xs flex items-center gap-1"><Dumbbell className="w-3 h-3"/> {item.arm}</span>}{(item.front_photo || item.back_photo || item.side_photo) && <Camera className="w-4 h-4 text-emerald-500" />}</div></div>))}</div></div>
        </div>
    );

    const renderPerfil = () => (
        <div className="p-6 space-y-6 pb-24 pt-20 animate-in fade-in">
             <div className="flex flex-col items-center justify-center mb-6">
                 <div 
                    className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-emerald-500 p-1 mb-3 relative group overflow-hidden"
                 >
                     
                     {uploadingProfile ? (
                         <div className="w-full h-full flex items-center justify-center bg-black/50"><Activity className="w-6 h-6 animate-spin text-emerald-500"/></div>
                     ) : clientPhoto ? (
                         <>
                            <img src={clientPhoto} alt="Profile" className="w-full h-full object-cover rounded-full" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                            </div>
                         </>
                     ) : (
                         <div className="w-full h-full bg-zinc-700 rounded-full flex items-center justify-center text-3xl font-bold text-zinc-500 group-hover:bg-zinc-600 transition-colors relative">
                             {clientName.charAt(0)}
                             <div className="absolute bottom-0 right-0 bg-emerald-500 rounded-full p-1 border-2 border-black">
                                 <Plus className="w-3 h-3 text-black" />
                             </div>
                         </div>
                     )}
                 </div>

                  {/* Botón de borrar foto ocultado (CA5) */}

                 <h2 className="text-2xl font-bold text-white">{clientName} {clientLastName}</h2>
                 <p className="text-zinc-500 text-sm">{email}</p>
             </div>

             {paymentLink && (
                 <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mb-6">
                     <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2 text-emerald-500 font-bold"><CreditCard className="w-5 h-5"/> Suscripción</div>
                     </div>
                     <Button onClick={() => window.open(paymentLink, '_blank')} className="w-full bg-emerald-500 text-black font-bold h-11 hover:bg-emerald-400 rounded-lg">Gestionar Pagos</Button>
                 </div>
             )}

            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all" onClick={() => window.location.href = "mailto:entrenador@fitleader.com"}>
                    <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-blue-400" /><span className="text-white font-bold">Contactar Centro</span></div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                </button>
                <button onClick={() => setActiveProfileModal('notifications')} className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"><div className="flex items-center gap-3"><Bell className="w-5 h-5 text-yellow-500" /><span className="text-white font-bold">Notificaciones</span></div><ChevronRight className="w-5 h-5 text-zinc-500" /></button>
                <button onClick={() => setActiveProfileModal('settings')} className="w-full flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 transition-all"><div className="flex items-center gap-3"><Settings className="w-5 h-5 text-purple-500" /><span className="text-white font-bold">Configuración</span></div><ChevronRight className="w-5 h-5 text-zinc-500" /></button>
            </div>
            
            <div className="pt-8 text-center">
                <p className="text-zinc-600 text-xs mb-4">FitLeader App</p>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-400 hover:bg-red-500/10 rounded-lg border border-red-500/20"><LogOut className="w-5 h-5" /> Cerrar Sesión</button>
            </div>

            {/* Modales de Perfil */}
            {activeProfileModal && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="p-4 flex items-center border-b border-zinc-800 bg-zinc-900">
                        <button onClick={() => setActiveProfileModal(null)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors"><ChevronRight className="w-6 h-6 text-white rotate-180" /></button>
                        <h2 className="text-lg font-bold text-white ml-2">{activeProfileModal === 'notifications' ? 'Notificaciones' : 'Configuración'}</h2>
                    </div>
                    
                    <div className="p-4">
                        {activeProfileModal === 'notifications' && (
                            <div className="space-y-3">
                                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-emerald-500"/><span className="text-white font-medium">Recordatorios</span></div>
                                    <div onClick={() => setNotifSettings((prev: any) => ({...prev, workouts: !prev.workouts}))} className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${notifSettings.workouts ? 'bg-emerald-500' : 'bg-zinc-700'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notifSettings.workouts ? 'translate-x-5' : 'translate-x-0'}`}/></div>
                                </div>
                            </div>
                        )}
                        {activeProfileModal === 'settings' && (
                            <div className="space-y-6">
                                <div className="pt-4">
                                {/* Botón de borrar cuenta ocultado (CA5) */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-safe selection:bg-emerald-500 selection:text-black tracking-tight">
            {!viewingExercises && (
                <div className="fixed top-0 w-full max-w-md left-0 right-0 mx-auto bg-black/95 backdrop-blur-sm border-b border-zinc-800 z-50 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 w-full">
                        <img src={coachLogo} alt={coachBusinessName} className="h-9 w-auto object-contain rounded bg-transparent" />
                        <span className="font-bold text-base text-white tracking-tight italic truncate">
                            {coachBusinessName}
                        </span>
                    </div>
                    {/* --- BOTÓN DE RECARGA MANUAL --- */}
                    <button 
                        onClick={handleManualRefresh}
                        className={`p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`}
                        title="Sincronizar cambios"
                    >
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="w-full max-w-md mx-auto min-h-screen bg-black relative overflow-hidden">
                {activeTab === 'inicio' && !viewingExercises && renderInicio()}
                {activeTab === 'reservas' && !viewingExercises && renderReservas()}
                {activeTab === 'plan' && (viewingExercises ? renderWorkoutView() : renderPlanSemanal())} 
                {activeTab === 'progreso' && !viewingExercises && renderProgreso()}
                {activeTab === 'perfil' && !viewingExercises && renderPerfil()}

                {/* MODAL DE CHECKIN COMPLETADO */}
                {showCheckinModal && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                         <div className="bg-zinc-900 w-full max-w-sm rounded-xl border border-zinc-800 overflow-hidden relative max-h-[90vh] overflow-y-auto p-6">
                             <button onClick={() => setShowCheckinModal(false)} className="absolute top-4 right-4 text-zinc-500"><X className="w-6 h-6"/></button>
                             <h3 className="text-xl font-bold text-white mb-4">Actualizar Datos</h3>
                             
                             <div className="space-y-4 mb-6">
                                 <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Peso (kg)</label>
                                    <input type="number" value={formWeight} onChange={e=>setFormWeight(e.target.value)} placeholder="0.0" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-emerald-500"/>
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Cintura (cm)</label>
                                        <input type="number" value={formWaist} onChange={e=>setFormWaist(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-emerald-500"/>
                                     </div>
                                     <div>
                                        <label className="text-xs text-zinc-500 mb-1 block">Brazo (cm)</label>
                                        <input type="number" value={formArm} onChange={e=>setFormArm(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-emerald-500"/>
                                     </div>
                                 </div>
                                 <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Muslo (cm)</label>
                                    <input type="number" value={formLeg} onChange={e=>setFormLeg(e.target.value)} placeholder="0" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white font-bold focus:outline-none focus:border-emerald-500"/>
                                 </div>
                             </div>

                             <Button onClick={handleSaveCheckin} disabled={saving} className="w-full bg-emerald-500 text-black font-bold h-12 rounded-lg">
                                {saving ? <Activity className="w-5 h-5 animate-spin mx-auto"/> : "Guardar Progreso"}
                             </Button>
                         </div>
                    </div>
                )}
                
                {/* MODAL DE SUBIDA DE FOTOS */}
                {showPhotoModal && (
                    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                         <div className="bg-zinc-900 w-full max-w-sm rounded-xl border border-zinc-800 overflow-hidden relative p-6">
                             <button onClick={() => setShowPhotoModal(false)} className="absolute top-4 right-4 text-zinc-500"><X className="w-6 h-6"/></button>
                             <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Camera className="w-5 h-5 text-emerald-500"/> Subir Foto</h3>
                             <p className="text-xs text-zinc-400 mb-4">Sube tu progreso actual para este ángulo.</p>
                             
                             <div className="w-full aspect-[3/4] bg-black border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center mb-4 overflow-hidden relative group">
                                 {previewUrl ? (
                                     <img src={previewUrl} className="w-full h-full object-cover" alt="Preview"/>
                                 ) : (
                                     <>
                                         <Upload className="w-7 h-7 text-zinc-700 mb-2 group-hover:text-emerald-500"/>
                                         <span className="text-xs text-zinc-600 group-hover:text-emerald-500">Haz clic o arrastra</span>
                                     </>
                                 )}
                                 <input type="file" accept="image/*" onChange={(e) => {
                                     if(e.target.files?.[0]){
                                         setFileToUpload(e.target.files[0]);
                                         setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                                     }
                                 }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                             </div>
                             
                             <Button disabled={true} className="w-full bg-emerald-500 text-black font-bold h-12 rounded-lg disabled:opacity-50">
                                Próximamente
                             </Button>
                         </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar con diseño clásico */}
            {!viewingExercises && (
                <div className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-sm border-t border-zinc-800 z-50 safe-area-bottom">
                    <div className="max-w-md mx-auto flex justify-around items-center p-2 pb-3 md:pb-2">
                        {['inicio', 'reservas', 'plan', 'progreso', 'perfil'].map((tab) => (
                            <button 
                                key={tab} 
                                onClick={() => { setActiveTab(tab as any); if(tab === 'plan') setViewingExercises(false); }} 
                                className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 transition-colors ${activeTab === tab ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-300'}`}
                            >
                                {tab === 'inicio' ? <Home className="w-5 h-5 stroke-[2.5]" /> : tab === 'reservas' ? <CalendarIcon className="w-5 h-5 stroke-[2.5]" /> : tab === 'plan' ? <ClipboardList className="w-5 h-5 stroke-[2.5]" /> : tab === 'progreso' ? <TrendingUp className="w-5 h-5 stroke-[2.5]" /> : <User className="w-5 h-5 stroke-[2.5]" />}
                                <span className="text-[9px] font-bold capitalize tracking-tight">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* --- COMPONENTES DE UI GLOBALES --- */}
            <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

            {/* Modal de Confirmación Custom */}
            {confirmDialog && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm p-6 relative shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-2">{confirmDialog.title}</h3>
                        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{confirmDialog.message}</p>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => setConfirmDialog(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-11">
                                Cancelar
                            </Button>
                            <Button onClick={confirmDialog.onConfirm} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-11">
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientWorkout;