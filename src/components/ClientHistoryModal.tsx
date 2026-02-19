import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Calendar, Dumbbell, ChevronRight, Trophy } from 'lucide-react';

interface ClientHistoryModalProps {
    clientId: string;
    clientName: string;
    onClose: () => void;
}

const ClientHistoryModal = ({ clientId, clientName, onClose }: ClientHistoryModalProps) => {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<any[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // 1. Cargar lista de sesiones completadas
    useEffect(() => {
        const fetchHistory = async () => {
            const { data, error } = await supabase
                .from('routine_assignments')
                .select(`
                    id,
                    scheduled_date,
                    created_at,
                    routine:routines (name)
                `)
                .eq('client_id', clientId)
                .eq('completed', true)
                .order('scheduled_date', { ascending: false });

            if (!error && data) {
                setHistory(data);
            }
            setLoading(false);
        };
        fetchHistory();
    }, [clientId]);

    // 2. Cargar los pesos y reps de una sesión específica
    const handleSelectSession = async (assignmentId: string) => {
        if (selectedSession === assignmentId) {
            setSelectedSession(null); // Colapsar si ya estaba abierto
            return;
        }

        setSelectedSession(assignmentId);
        setLoadingDetails(true);

        const { data, error } = await supabase
            .from('workout_results')
            .select(`
                id,
                weight,
                reps,
                set_number,
                exercise:routine_exercises (exercise_name)
            `)
            .eq('assignment_id', assignmentId)
            .order('exercise_id', { ascending: true })
            .order('set_number', { ascending: true });

        if (!error && data) {
            // Agrupar por ejercicio para visualizar mejor
            const grouped = data.reduce((acc: any, curr: any) => {
                const name = curr.exercise?.exercise_name || "Ejercicio";
                if (!acc[name]) acc[name] = [];
                acc[name].push(curr);
                return acc;
            }, {});
            setSessionDetails(Object.entries(grouped));
        }
        setLoadingDetails(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#111] border border-zinc-800 w-full max-w-2xl max-h-[85vh] rounded-2xl flex flex-col shadow-2xl">
                
                {/* HEADER */}
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-emerald-500" />
                            Historial de {clientName}
                        </h2>
                        <p className="text-zinc-500 text-sm">Registro de entrenamientos completados</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-zinc-500">Cargando historial...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-10 bg-zinc-900 rounded-xl border border-zinc-800 border-dashed">
                            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400">Este atleta aún no ha completado ningún entrenamiento.</p>
                        </div>
                    ) : (
                        history.map((session) => (
                            <div key={session.id} className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden transition-all hover:border-zinc-700">
                                {/* CARD HEADER (Clickable) */}
                                <div 
                                    onClick={() => handleSelectSession(session.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                            <Calendar className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">{session.routine?.name || "Entrenamiento"}</h3>
                                            <p className="text-zinc-500 text-xs">
                                                {new Date(session.scheduled_date || session.created_at).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform ${selectedSession === session.id ? 'rotate-90' : ''}`} />
                                </div>

                                {/* CARD DETAILS (Expansible) */}
                                {selectedSession === session.id && (
                                    <div className="border-t border-zinc-800 bg-black/40 p-4 animate-in slide-in-from-top-2">
                                        {loadingDetails ? (
                                            <p className="text-zinc-500 text-xs text-center">Cargando datos...</p>
                                        ) : sessionDetails.length === 0 ? (
                                            <p className="text-zinc-500 text-xs text-center">Sin datos registrados.</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {sessionDetails.map(([exerciseName, sets]: any) => (
                                                    <div key={exerciseName}>
                                                        <h4 className="text-emerald-400 text-xs font-bold uppercase mb-2 flex items-center gap-2">
                                                            <Dumbbell className="w-3 h-3" /> {exerciseName}
                                                        </h4>
                                                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                            {sets.map((set: any) => (
                                                                <div key={set.id} className="bg-zinc-800 rounded-lg p-2 text-center border border-zinc-700">
                                                                    <div className="text-[10px] text-zinc-500 font-bold mb-1">SET {set.set_number}</div>
                                                                    <div className="text-white font-bold text-sm">{set.weight}<span className="text-[10px] text-zinc-500 font-normal">kg</span></div>
                                                                    <div className="text-zinc-400 text-xs">{set.reps} <span className="text-[9px]">reps</span></div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientHistoryModal;