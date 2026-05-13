import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Calendar, Dumbbell, ChevronRight, Trophy } from 'lucide-react';

interface ClientHistoryModalProps {
    clientId: string;
    clientName: string;
    onClose: () => void;
}

const ClientHistoryModal = ({ clientId, clientName, onClose }: ClientHistoryModalProps) => {
    const [historyGroups, setHistoryGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 1. Cargar y agrupar TODOS los resultados del atleta
    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            
            // Traemos TODOS los registros de este atleta, ordenados de más reciente a más antiguo
            const { data, error } = await supabase
                .from('workout_results')
                .select(`
                    id,
                    weight,
                    reps,
                    set_number,
                    created_at,
                    exercise:routine_exercises (exercise_name)
                `)
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                // Agrupamos los registros por DÍA para crear el concepto de "Sesión"
                const groupedByDate = data.reduce((acc: any, curr: any) => {
                    const dateStr = curr.created_at.split('T')[0]; // Ejemplo: "2026-05-13"
                    
                    if (!acc[dateStr]) {
                        acc[dateStr] = {
                            date: dateStr,
                            exercises: {}
                        };
                    }

                    // Dentro de cada día, agrupamos por ejercicio
                    const exerciseName = curr.exercise?.exercise_name || "Ejercicio Borrado";
                    if (!acc[dateStr].exercises[exerciseName]) {
                        acc[dateStr].exercises[exerciseName] = [];
                    }
                    
                    acc[dateStr].exercises[exerciseName].push(curr);
                    return acc;
                }, {});

                // Convertimos el objeto a un array y ordenamos internamente las series
                const finalGroups = Object.values(groupedByDate).map((group: any) => {
                    // Ordenar las series dentro de cada ejercicio
                    Object.keys(group.exercises).forEach(exName => {
                        group.exercises[exName].sort((a: any, b: any) => a.set_number - b.set_number);
                    });
                    return group;
                });

                // Ordenamos las fechas de más reciente a más antigua
                finalGroups.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
                
                setHistoryGroups(finalGroups);
            }
            setLoading(false);
        };
        fetchHistory();
    }, [clientId]);

    const handleSelectDate = (date: string) => {
        if (selectedDate === date) {
            setSelectedDate(null);
        } else {
            setSelectedDate(date);
        }
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
                        <p className="text-zinc-500 text-sm">Registro de marcas de entrenamientos</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loading ? (
                        <div className="text-center py-10 text-zinc-500">Cargando historial...</div>
                    ) : historyGroups.length === 0 ? (
                        <div className="text-center py-10 bg-zinc-900 rounded-xl border border-zinc-800 border-dashed">
                            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                            <p className="text-zinc-400">Este atleta aún no ha completado ningún entrenamiento.</p>
                        </div>
                    ) : (
                        historyGroups.map((sessionGroup) => (
                            <div key={sessionGroup.date} className="border border-zinc-800 rounded-xl bg-zinc-900/30 overflow-hidden transition-all hover:border-zinc-700">
                                {/* CARD HEADER (Clickable) */}
                                <div 
                                    onClick={() => handleSelectDate(sessionGroup.date)}
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                            <Calendar className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold">
                                                Sesión del {new Date(sessionGroup.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                                            </h3>
                                            <p className="text-zinc-500 text-xs">
                                                {Object.keys(sessionGroup.exercises).length} ejercicios registrados
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-zinc-500 transition-transform ${selectedDate === sessionGroup.date ? 'rotate-90' : ''}`} />
                                </div>

                                {/* CARD DETAILS (Expansible) */}
                                {selectedDate === sessionGroup.date && (
                                    <div className="border-t border-zinc-800 bg-black/40 p-4 animate-in slide-in-from-top-2">
                                        <div className="space-y-4">
                                            {Object.entries(sessionGroup.exercises).map(([exerciseName, sets]: any) => (
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