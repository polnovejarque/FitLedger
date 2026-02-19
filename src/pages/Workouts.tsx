import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
    Search, Plus, Dumbbell, Calendar, 
    MoreVertical, Clock, 
    LayoutGrid, List, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Workouts = () => {
    const navigate = useNavigate();
    const [routines, setRoutines] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchRoutines();
    }, []);

    const fetchRoutines = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('routines')
            .select('*')
            .eq('coach_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error cargando rutinas:', error);
        } else {
            setRoutines(data || []);
        }
        setIsLoading(false);
    };

    // CORREGIDO: Usamos 'name' en lugar de 'title'
    // Añadimos '?' y '|| ""' para evitar el crash si el nombre viene vacío
    const filteredRoutines = routines.filter(r => 
        (r.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans relative">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
                <div><h1 className="text-3xl font-bold text-white mb-2">Biblioteca de Rutinas</h1><p className="text-zinc-400">Gestiona tus planes de entrenamiento y asígnalos.</p></div>
                <div className="flex gap-4">
                    <div className="bg-[#111] border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-3"><div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Dumbbell className="w-4 h-4" /></div><div><span className="block text-xl font-bold text-white leading-none">{routines.length}</span><span className="text-[10px] text-zinc-500 uppercase font-bold">Rutinas</span></div></div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Buscar rutina..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111] border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition-all" />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <div className="flex bg-[#111] p-1 rounded-lg border border-zinc-800">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><LayoutGrid className="w-4 h-4" /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><List className="w-4 h-4" /></button>
                    </div>
                    <Button onClick={() => navigate('/dashboard/workouts/create')} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 gap-2 rounded-xl"><Plus className="w-4 h-4" /> Nueva Rutina</Button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-center py-20 text-zinc-500 flex flex-col items-center justify-center w-full">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/> Cargando rutinas...
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredRoutines.map((routine) => (
                        <div key={routine.id} onClick={() => navigate(`/dashboard/workouts/edit/${routine.id}`)} className="bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl cursor-pointer flex flex-col relative">
                            <div className="h-40 relative overflow-hidden bg-black">
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent z-10" />
                                <img src={routine.image_url || "https://via.placeholder.com/400x200?text=Rutina"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-40" />
                                <div className="absolute top-3 right-3 z-20 pointer-events-none"><span className="text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-md border border-white/10 bg-white/10 text-white">{routine.level || 'N/A'}</span></div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                                {/* CORREGIDO: routine.name en lugar de routine.title */}
                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{routine.name}</h3>
                                <p className="text-xs text-zinc-500 line-clamp-2 mb-4">{routine.description || 'Sin descripción'}</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 mb-4">
                                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> {routine.days_per_week || '?'} Días/sem</div>
                                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-500" /> {routine.estimated_duration || '?'}</div>
                                </div>
                                <div className="mt-auto pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                                    <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div onClick={() => navigate('/dashboard/workouts/create')} className="bg-[#111] border border-zinc-800 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 group-hover:bg-emerald-500/20 flex items-center justify-center transition-colors"><Plus className="w-8 h-8 group-hover:scale-110 transition-transform" /></div>
                        <span className="font-medium text-sm">Crear Nueva Rutina</span>
                    </div>
                </div>
            ) : (
                <div>Vista de lista no implementada</div>
            )}
        </div>
    );
};

export default Workouts;