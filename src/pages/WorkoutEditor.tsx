import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
    Save, X, Plus, Trash2, Dumbbell, 
    ChevronLeft, Layout, Calendar, Clock,
    Search, Loader2, Upload, Video, Users, CheckCircle, Signal
} from 'lucide-react';
import { Button } from '../components/ui/Button';

// Catálogo Base (Demo)
const EXERCISE_CATALOG = [
    { id: 1, name: "Sentadilla con Barra", category: "Pierna", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=60" },
    { id: 2, name: "Peso Muerto Rumano", category: "Pierna", img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=60&w=400" },
    { id: 3, name: "Press Banca", category: "Pecho", img: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=60" },
    { id: 4, name: "Jalón al Pecho", category: "Espalda", img: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&q=60" },
    { id: 5, name: "Press Militar", category: "Hombro", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=60" },
    { id: 6, name: "Curl de Bíceps", category: "Brazo", img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=60" },
];

const WorkoutEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams(); 

    // Estados Generales
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState("Intermedio");
    const [daysPerWeek, setDaysPerWeek] = useState(3);
    const [duration, setDuration] = useState("60 min");
    
    // Estados Planificación
    const [exercises, setExercises] = useState<any[]>([]);
    const [activeDay, setActiveDay] = useState(1);
    
    // Estados Clientes
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClients, setSelectedClients] = useState<number[]>([]);
    const [searchClient, setSearchClient] = useState("");

    // Estados UI
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCatalog, setShowCatalog] = useState(false);
    const [uploadingId, setUploadingId] = useState<number | null>(null);

    // Estados para CREAR EJERCICIO PERSONALIZADO
    const [customExName, setCustomExName] = useState("");
    const [customExCategory, setCustomExCategory] = useState("General");

    // 1. CARGA INICIAL
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const { data: clientsData } = await supabase.from('clients').select('id, name, image_url');
            if (clientsData) setClients(clientsData);

            if (id) {
                const { data: routine } = await supabase.from('routines').select('*').eq('id', id).single();
                if (routine) {
                    setTitle(routine.title);
                    setDescription(routine.description || "");
                    setLevel(routine.level || "Intermedio");
                    setDaysPerWeek(routine.days_per_week || 3);
                    setDuration(routine.estimated_duration || "60 min");

                    const { data: exData } = await supabase.from('routine_exercises').select('*').eq('routine_id', id);
                    if (exData) {
                        const formattedExercises = exData.map(e => ({
                            localId: e.id, 
                            name: e.exercise_name,
                            img: e.image_url,
                            day: parseInt(e.day_name.split(' ')[1]),
                            sets: e.sets,
                            reps: e.reps,
                            rir: e.rir || "",
                            video: e.video_url
                        }));
                        setExercises(formattedExercises);
                    }

                    const { data: assignData } = await supabase.from('routine_assignments').select('client_id').eq('routine_id', id);
                    if (assignData) {
                        setSelectedClients(assignData.map(a => a.client_id));
                    }
                }
            }
            setIsLoading(false);
        };
        loadData();
    }, [id]);

    // --- GUARDAR ---
    const handleSave = async () => {
        if (!title) return alert("Ponle un nombre a la rutina");
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const routineData = {
            coach_id: user.id,
            title, description, level, days_per_week: daysPerWeek,
            estimated_duration: duration, image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80" 
        };

        let routineId = id;

        if (id) {
            const { error } = await supabase.from('routines').update(routineData).eq('id', id);
            if (error) { alert(error.message); setIsSaving(false); return; }
        } else {
            const { data, error } = await supabase.from('routines').insert([routineData]).select().single();
            if (error) { alert(error.message); setIsSaving(false); return; }
            routineId = data.id;
        }

        if (routineId) {
            await supabase.from('routine_exercises').delete().eq('routine_id', routineId);
            if (exercises.length > 0) {
                const exercisesToSave = exercises.map(ex => ({
                    routine_id: routineId, day_name: `Día ${ex.day}`, exercise_name: ex.name,
                    sets: ex.sets, reps: ex.reps, rir: ex.rir, image_url: ex.img, video_url: ex.video || ""
                }));
                await supabase.from('routine_exercises').insert(exercisesToSave);
            }
            await supabase.from('routine_assignments').delete().eq('routine_id', routineId);
            if (selectedClients.length > 0) {
                const assignments = selectedClients.map(clientId => ({ routine_id: routineId, client_id: clientId }));
                await supabase.from('routine_assignments').insert(assignments);
            }
        }
        setIsSaving(false);
        navigate('/dashboard/workouts'); 
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!confirm("⚠️ ¿Seguro que quieres eliminar esta rutina?")) return;
        setIsDeleting(true);
        const { error } = await supabase.from('routines').delete().eq('id', id);
        if (error) { alert("Error al borrar: " + error.message); setIsDeleting(false); } 
        else { navigate('/dashboard/workouts'); }
    };

    // --- UTILS ---
    const toggleClient = (clientId: number) => {
        if (selectedClients.includes(clientId)) setSelectedClients(selectedClients.filter(id => id !== clientId));
        else setSelectedClients([...selectedClients, clientId]);
    };

    const addExercise = (catalogItem: any) => {
        setExercises([...exercises, { ...catalogItem, localId: Date.now(), day: activeDay, sets: 3, reps: "10-12", rir: "", video: "" }]);
        setShowCatalog(false);
    };

    // --- CREAR EJERCICIO PERSONALIZADO ---
    const createCustomExercise = () => {
        if (!customExName) return alert("Escribe un nombre para el ejercicio");
        
        const newCustomExercise = {
            id: Date.now(), // ID temporal
            name: customExName,
            category: customExCategory,
            img: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=200", // Imagen genérica
        };

        addExercise(newCustomExercise);
        setCustomExName(""); // Limpiar input
        setCustomExCategory("General");
    };

    const removeExercise = (localId: number) => setExercises(exercises.filter(e => e.localId !== localId));
    const updateExercise = (localId: number, field: string, value: any) => setExercises(exercises.map(ex => ex.localId === localId ? { ...ex, [field]: value } : ex));
    
    const handleFileUpload = async (event: any, localId: number) => {
        const file = event.target.files[0]; if (!file) return; setUploadingId(localId);
        try {
            const fileName = `${Date.now()}_${Math.random()}.${file.name.split('.').pop()}`;
            const { error } = await supabase.storage.from('Videos').upload(fileName, file);
            if (error) throw error;
            const { data } = supabase.storage.from('Videos').getPublicUrl(fileName);
            updateExercise(localId, 'video', data.publicUrl); alert("Vídeo subido ✅");
        } catch (error: any) { alert("Error: " + error.message); } finally { setUploadingId(null); }
    };

    const currentDayExercises = exercises.filter(e => e.day === activeDay);
    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchClient.toLowerCase()));

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="animate-spin w-8 h-8"/></div>;

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard/workouts')}><ChevronLeft className="w-5 h-5 text-zinc-500" /></Button>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{id ? "Editar Rutina" : "Nueva Rutina"}</h1>
                        <p className="text-zinc-400 text-sm">{id ? "Modifica los detalles existentes." : "Configura los detalles y asigna atletas."}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {id && (
                        <Button variant="ghost" onClick={handleDelete} disabled={isDeleting} className="text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4"/>}
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => navigate('/dashboard/workouts')} className="border-zinc-800 text-zinc-400 hover:text-white">Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 min-w-[140px]">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />} Guardar Rutina
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* IZQUIERDA */}
                <div className="space-y-6">
                    <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-emerald-500 uppercase mb-4 flex items-center gap-2"><Layout className="w-4 h-4" /> Información General</h3>
                        <div className="space-y-4">
                            <div><label className="text-xs text-zinc-500 mb-1 block">Nombre</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" /></div>
                            <div><label className="text-xs text-zinc-500 mb-1 block">Nivel</label><select value={level} onChange={(e) => setLevel(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"><option>Principiante</option><option>Intermedio</option><option>Avanzado</option></select></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Días / Semana</label>
                                    {/* ICONO CALENDAR RESTAURADO */}
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input type="number" value={daysPerWeek} onChange={(e) => setDaysPerWeek(Number(e.target.value))} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-emerald-500 outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Duración</label>
                                    {/* ICONO CLOCK RESTAURADO */}
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                                        <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-3 py-3 text-white focus:border-emerald-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                            <div><label className="text-xs text-zinc-500 mb-1 block">Descripción</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none resize-none" /></div>
                        </div>
                    </div>
                    <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 flex flex-col max-h-[400px]">
                        <div className="flex justify-between items-center mb-4"><h3 className="text-sm font-bold text-orange-500 uppercase flex items-center gap-2"><Users className="w-4 h-4" /> Asignar Atletas</h3><span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{selectedClients.length} selec.</span></div>
                        <div className="relative mb-3"><Search className="w-3 h-3 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Buscar..." value={searchClient} onChange={(e) => setSearchClient(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:border-orange-500 outline-none" /></div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                            {filteredClients.map(c => (
                                <div key={c.id} onClick={() => toggleClient(c.id)} className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all ${selectedClients.includes(c.id) ? 'bg-orange-500/10 border-orange-500/50' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800'}`}>
                                    <img src={c.image_url || "https://i.pravatar.cc/150"} className="w-8 h-8 rounded-full object-cover" /><div className="flex-1 min-w-0"><p className={`text-sm font-medium truncate ${selectedClients.includes(c.id) ? 'text-orange-400' : 'text-white'}`}>{c.name}</p></div>{selectedClients.includes(c.id) && <CheckCircle className="w-4 h-4 text-orange-500" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* DERECHA */}
                <div className="lg:col-span-2 bg-[#111] border border-zinc-800 rounded-2xl p-6 min-h-[600px] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-bold text-purple-500 uppercase flex items-center gap-2"><Dumbbell className="w-4 h-4" /> Plan de Entrenamiento</h3>
                        <div className="bg-zinc-900 rounded-lg p-1 flex gap-1 border border-zinc-800">{Array.from({ length: daysPerWeek }).map((_, i) => (<button key={i} onClick={() => setActiveDay(i + 1)} className={`w-8 h-8 rounded text-xs font-bold transition-all ${activeDay === i + 1 ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}>{i + 1}</button>))}</div>
                    </div>
                    <div className="flex-1 space-y-3 mb-6">
                        {currentDayExercises.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-zinc-800/50 rounded-xl"><Dumbbell className="w-10 h-10 mb-2 opacity-20" /><p className="text-sm">No hay ejercicios en el Día {activeDay}</p></div> : 
                            currentDayExercises.map((ex) => (
                                <div key={ex.localId} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 flex items-center gap-4 group hover:border-zinc-700 relative">
                                    <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0"><img src={ex.img} className="w-full h-full object-cover opacity-80" /></div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-sm text-white truncate">{ex.name}</h4>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5"><span className="text-[9px] text-zinc-500 font-bold">SETS</span><input type="number" value={ex.sets} onChange={(e) => updateExercise(ex.localId, 'sets', Number(e.target.value))} className="w-6 bg-transparent text-white text-xs text-center font-bold outline-none" /></div>
                                            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-white/5"><span className="text-[9px] text-zinc-500 font-bold">REPS</span><input type="text" value={ex.reps} onChange={(e) => updateExercise(ex.localId, 'reps', e.target.value)} className="w-10 bg-transparent text-white text-xs text-center font-bold outline-none" /></div>
                                            {/* ICONO SIGNAL RESTAURADO EN RIR */}
                                            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/30">
                                                <Signal className="w-3 h-3 text-emerald-500" />
                                                <span className="text-[9px] text-zinc-500 font-bold">RIR</span>
                                                <input type="text" value={ex.rir} onChange={(e) => updateExercise(ex.localId, 'rir', e.target.value)} className="w-6 bg-transparent text-white text-xs text-center font-bold outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className={`cursor-pointer p-2 rounded-lg transition-all ${ex.video ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-600 hover:text-white bg-zinc-800'}`}>
                                            {uploadingId === ex.localId ? <Loader2 className="w-4 h-4 animate-spin"/> : ex.video ? <Video className="w-4 h-4"/> : <Upload className="w-4 h-4"/>}
                                            <input type="file" accept="video/*" className="hidden" onChange={(e) => handleFileUpload(e, ex.localId)} disabled={uploadingId === ex.localId}/>
                                        </label>
                                        <button onClick={() => removeExercise(ex.localId)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <button onClick={() => setShowCatalog(true)} className="w-full py-4 border border-zinc-800 border-dashed rounded-xl text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all text-sm font-medium flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Añadir Ejercicio</button>
                </div>
            </div>

            {/* MODAL CATÁLOGO MEJORADO */}
            {showCatalog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-lg rounded-2xl relative shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[80vh] overflow-hidden">
                        
                        {/* CABECERA MODAL */}
                        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Seleccionar Ejercicio</h2>
                            <button onClick={() => setShowCatalog(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        {/* BUSCADOR */}
                        <div className="p-4 border-b border-zinc-800">
                            <div className="relative">
                                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder="Buscar en catálogo..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none" />
                            </div>
                        </div>

                        {/* CREAR NUEVO (FORMULARIO ADICIONAL) */}
                        <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
                            <p className="text-xs text-zinc-400 mb-2 font-bold uppercase">¿No está en la lista? Crea uno nuevo:</p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Nombre (ej: Burpees)" 
                                    value={customExName}
                                    onChange={(e) => setCustomExName(e.target.value)}
                                    className="flex-1 bg-black border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                />
                                <select 
                                    value={customExCategory} 
                                    onChange={(e) => setCustomExCategory(e.target.value)}
                                    className="bg-black border border-zinc-700 rounded-lg px-2 py-2 text-sm text-white outline-none focus:border-emerald-500"
                                >
                                    <option>General</option>
                                    <option>Pierna</option>
                                    <option>Pecho</option>
                                    <option>Espalda</option>
                                    <option>Hombro</option>
                                    <option>Brazo</option>
                                    <option>Cardio</option>
                                </select>
                                <Button onClick={createCustomExercise} size="sm" className="bg-zinc-800 hover:bg-emerald-500 hover:text-black text-white">
                                    Crear
                                </Button>
                            </div>
                        </div>

                        {/* LISTA CATÁLOGO */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                            {EXERCISE_CATALOG.map((ex) => (
                                <button key={ex.id} onClick={() => addExercise(ex)} className="w-full flex items-center gap-4 p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500 hover:bg-zinc-800 transition-all text-left group">
                                    <img src={ex.img} className="w-12 h-12 rounded-lg object-cover" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{ex.name}</h4>
                                        <span className="text-xs text-zinc-500">{ex.category}</span>
                                    </div>
                                    <Plus className="w-5 h-5 text-zinc-600 group-hover:text-emerald-500" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutEditor;