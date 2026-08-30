import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronDown, ChevronUp, Calendar, Dumbbell, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';

// Definimos los tipos claramente
interface WorkoutSet {
    id: number;
    setNumber: number;
    actualReps: number;
    actualWeight: number;
}

interface Exercise {
    name: string;
    sets: WorkoutSet[];
}

interface WorkoutSession {
    id: string;
    date: string;
    time: string;
    routineName: string;
    duration: string;
    totalVolume: number;
    exercises: Exercise[];
}

const ClientProgress = () => {
    const [sessions, setSessions] = useState<WorkoutSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedSessions, setExpandedSessions] = useState<string[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            
            // 1. Obtener usuario actual
            const storedEmail = localStorage.getItem('fit_client_email');
            if (!storedEmail) { setLoading(false); return; }

            const { data: clientData } = await supabase.from('clients').select('id').eq('email', storedEmail).single();
            if (!clientData) { setLoading(false); return; }

            // 2. Obtener resultados de entrenamiento directamente por client_id
            const { data: results, error: resErr } = await supabase
                .from('workout_results')
                .select(`
                    id,
                    assignment_id,
                    set_number,
                    weight,
                    reps,
                    created_at,
                    exercise_name,
                    exercise:routine_exercises (exercise_name)
                `)
                .eq('client_id', clientData.id)
                .order('created_at', { ascending: false });

            let allResults = (!resErr && results) ? results : [];

            // Si no hay por client_id, intentar fallback por assignment_id
            if (allResults.length === 0) {
                const { data: weeklyPlans } = await supabase.from('client_weekly_plan').select('id').eq('client_id', clientData.id);
                const { data: legacyAssignments } = await supabase.from('routine_assignments').select('id').eq('client_id', clientData.id);
                const assigIds = [
                    ...(weeklyPlans?.map(p => p.id) || []),
                    ...(legacyAssignments?.map(a => a.id) || [])
                ];

                if (assigIds.length > 0) {
                    const { data: fallbackResults } = await supabase
                        .from('workout_results')
                        .select(`
                            id,
                            assignment_id,
                            set_number,
                            weight,
                            reps,
                            created_at,
                            exercise_name,
                            exercise:routine_exercises (exercise_name)
                        `)
                        .in('assignment_id', assigIds)
                        .order('created_at', { ascending: false });
                    if (fallbackResults) allResults = fallbackResults;
                }
            }

            if (allResults.length === 0) {
                setSessions([]);
                setLoading(false);
                return;
            }

            // 3. Agrupar por fecha de sesión (created_at)
            const groupedByDate: Record<string, any> = {};

            allResults.forEach((curr: any) => {
                const dateStr = curr.created_at.split('T')[0];
                if (!groupedByDate[dateStr]) {
                    groupedByDate[dateStr] = {
                        id: curr.id?.toString() || dateStr,
                        date: curr.created_at,
                        exercisesMap: new Map<string, WorkoutSet[]>(),
                        totalVolume: 0
                    };
                }

                const directName = curr.exercise_name as string | null;
                const joinedName = Array.isArray(curr.exercise) ? curr.exercise[0]?.exercise_name : curr.exercise?.exercise_name;
                const exerciseName = directName || joinedName || "Ejercicio";

                const setInfo: WorkoutSet = {
                    id: curr.id || Math.random(),
                    setNumber: curr.set_number || 1,
                    actualReps: curr.reps || 0,
                    actualWeight: curr.weight || 0
                };

                groupedByDate[dateStr].totalVolume += (curr.weight || 0) * (curr.reps || 0);

                if (!groupedByDate[dateStr].exercisesMap.has(exerciseName)) {
                    groupedByDate[dateStr].exercisesMap.set(exerciseName, []);
                }
                groupedByDate[dateStr].exercisesMap.get(exerciseName)?.push(setInfo);
            });

            // Convertir a lista ordenada de sesiones
            const processedSessions: WorkoutSession[] = Object.values(groupedByDate).map((group: any) => {
                const dateObj = new Date(group.date);
                const exercisesList: Exercise[] = Array.from(group.exercisesMap.entries()).map(([name, sets]: any) => {
                    sets.sort((a: WorkoutSet, b: WorkoutSet) => a.setNumber - b.setNumber);
                    return { name, sets };
                });

                return {
                    id: group.id,
                    date: group.date,
                    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    routineName: "Entrenamiento Completado",
                    duration: "Sesión Finalizada",
                    totalVolume: Math.round(group.totalVolume),
                    exercises: exercisesList
                };
            });

            // Ordenar de más reciente a más antiguo
            processedSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setSessions(processedSessions);
            setLoading(false);
        };

        fetchHistory();
    }, []);

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev => prev.includes(sessionId) ? prev.filter(id => id !== sessionId) : [...prev, sessionId]);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

    return (
        <div className="p-4 space-y-6 pb-24">
            <div>
                <h1 className="text-2xl font-bold mb-2 text-white">Mi Progreso</h1>
                <p className="text-zinc-400 text-sm">Historial de entrenamientos y pesos registrados</p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-semibold text-white">Historial de Sesiones</h2>
                </div>

                {sessions.length === 0 ? (
                    <div className="text-center py-10 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                        <AlertCircle className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400">Aún no hay entrenamientos completados.</p>
                    </div>
                ) : (
                    sessions.map((session) => {
                        const isExpanded = expandedSessions.includes(session.id);
                        return (
                            <Card key={session.id} className="overflow-hidden border-zinc-800 bg-[#111]">
                                <button onClick={() => toggleSession(session.id)} className="w-full p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex-1 text-left space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg text-white">{session.routineName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                                            <span>{formatDate(session.date)}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 text-zinc-400"><Dumbbell className="w-3 h-3" /> {session.totalVolume > 0 ? `${session.totalVolume.toLocaleString()} kg total` : 'Sin carga'}</span>
                                        </div>
                                    </div>
                                    {isExpanded ? <ChevronUp className="w-5 h-5 text-zinc-500" /> : <ChevronDown className="w-5 h-5 text-zinc-500" />}
                                </button>

                                {isExpanded && (
                                    <div className="border-t border-zinc-800 bg-zinc-900/20 p-4 space-y-6 animate-in slide-in-from-top-2">
                                        {session.exercises.length === 0 ? (
                                            <p className="text-zinc-500 text-xs text-center">No se registraron datos.</p>
                                        ) : (
                                            session.exercises.map((exercise, exIndex) => (
                                                <div key={exIndex} className="space-y-2">
                                                    <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-2 uppercase tracking-wide">
                                                        <Dumbbell className="w-3 h-3" /> {exercise.name}
                                                    </h3>
                                                    <div className="overflow-hidden rounded-lg border border-zinc-800">
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="bg-zinc-900 border-b border-zinc-800">
                                                                    <th className="text-left py-2 px-3 text-zinc-500 font-bold">SERIE</th>
                                                                    <th className="text-center py-2 px-3 text-zinc-500 font-bold">PESO (KG)</th>
                                                                    <th className="text-center py-2 px-3 text-zinc-500 font-bold">REPS</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-zinc-800">
                                                                {exercise.sets.map((set) => (
                                                                    <tr key={set.id} className="bg-black/40">
                                                                        <td className="py-2 px-3 font-medium text-zinc-400">#{set.setNumber}</td>
                                                                        <td className="text-center py-2 px-3 font-bold text-white">{set.actualWeight > 0 ? set.actualWeight : '-'}</td>
                                                                        <td className="text-center py-2 px-3 text-zinc-300">{set.actualReps > 0 ? set.actualReps : '-'}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default ClientProgress;