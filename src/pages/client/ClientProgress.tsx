import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, Dumbbell, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';

interface WorkoutSet {
    setNumber: number;
    targetReps: number;
    targetWeight: number;
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

// Mock data - This would come from database
const mockSessions: WorkoutSession[] = [
    {
        id: '1',
        date: '2026-01-13',
        time: '18:30',
        routineName: 'Rutina de Fuerza A',
        duration: '45 min',
        totalVolume: 3200,
        exercises: [
            {
                name: 'Sentadilla',
                sets: [
                    { setNumber: 1, targetReps: 10, targetWeight: 80, actualReps: 10, actualWeight: 80 },
                    { setNumber: 2, targetReps: 10, targetWeight: 80, actualReps: 10, actualWeight: 82.5 },
                    { setNumber: 3, targetReps: 10, targetWeight: 80, actualReps: 9, actualWeight: 80 },
                    { setNumber: 4, targetReps: 10, targetWeight: 80, actualReps: 10, actualWeight: 80 },
                ]
            },
            {
                name: 'Press Banca',
                sets: [
                    { setNumber: 1, targetReps: 10, targetWeight: 60, actualReps: 10, actualWeight: 60 },
                    { setNumber: 2, targetReps: 10, targetWeight: 60, actualReps: 10, actualWeight: 62.5 },
                    { setNumber: 3, targetReps: 10, targetWeight: 60, actualReps: 8, actualWeight: 60 },
                ]
            }
        ]
    },
    {
        id: '2',
        date: '2026-01-11',
        time: '10:00',
        routineName: 'Rutina de Fuerza A',
        duration: '42 min',
        totalVolume: 2980,
        exercises: [
            {
                name: 'Sentadilla',
                sets: [
                    { setNumber: 1, targetReps: 10, targetWeight: 75, actualReps: 10, actualWeight: 75 },
                    { setNumber: 2, targetReps: 10, targetWeight: 75, actualReps: 10, actualWeight: 75 },
                    { setNumber: 3, targetReps: 10, targetWeight: 75, actualReps: 10, actualWeight: 77.5 },
                    { setNumber: 4, targetReps: 10, targetWeight: 75, actualReps: 9, actualWeight: 75 },
                ]
            },
            {
                name: 'Press Banca',
                sets: [
                    { setNumber: 1, targetReps: 10, targetWeight: 57.5, actualReps: 10, actualWeight: 57.5 },
                    { setNumber: 2, targetReps: 10, targetWeight: 57.5, actualReps: 10, actualWeight: 57.5 },
                    { setNumber: 3, targetReps: 10, targetWeight: 57.5, actualReps: 9, actualWeight: 57.5 },
                ]
            }
        ]
    }
];

const ClientProgress = () => {
    const [expandedSessions, setExpandedSessions] = useState<string[]>([]);

    const toggleSession = (sessionId: string) => {
        setExpandedSessions(prev =>
            prev.includes(sessionId)
                ? prev.filter(id => id !== sessionId)
                : [...prev, sessionId]
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Mi Progreso</h1>
                <p className="text-muted-foreground">Historial de entrenamientos y pesos registrados</p>
            </div>

            {/* Workout History Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    <h2 className="text-xl font-semibold">Historial de Sesiones</h2>
                </div>

                {mockSessions.map((session) => {
                    const isExpanded = expandedSessions.includes(session.id);

                    return (
                        <Card key={session.id} className="overflow-hidden">
                            {/* Session Header - Clickable */}
                            <button
                                onClick={() => toggleSession(session.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                            >
                                <div className="flex-1 text-left space-y-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-lg">{session.routineName}</span>
                                        <span className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full">
                                            {session.duration}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span>{formatDate(session.date)}</span>
                                        <span>•</span>
                                        <span>{session.time}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Dumbbell className="w-3 h-3" />
                                            {session.totalVolume.toLocaleString()} kg totales
                                        </span>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                )}
                            </button>

                            {/* Session Details - Expandable */}
                            {isExpanded && (
                                <div className="border-t border-border bg-secondary/20 p-4 space-y-4">
                                    {session.exercises.map((exercise, exIndex) => (
                                        <div key={exIndex} className="space-y-3">
                                            <h3 className="font-semibold text-base flex items-center gap-2">
                                                <Dumbbell className="w-4 h-4 text-accent" />
                                                {exercise.name}
                                            </h3>

                                            {/* Sets Table */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-border">
                                                            <th className="text-left py-2 px-3 text-muted-foreground font-medium">Serie</th>
                                                            <th className="text-center py-2 px-3 text-muted-foreground font-medium">Objetivo</th>
                                                            <th className="text-center py-2 px-3 text-muted-foreground font-medium">Peso Real</th>
                                                            <th className="text-center py-2 px-3 text-muted-foreground font-medium">Reps</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {exercise.sets.map((set) => {
                                                            const exceededTarget = set.actualWeight > set.targetWeight;
                                                            const metReps = set.actualReps >= set.targetReps;

                                                            return (
                                                                <tr key={set.setNumber} className="border-b border-border/50">
                                                                    <td className="py-2 px-3 font-medium">#{set.setNumber}</td>
                                                                    <td className="text-center py-2 px-3 text-muted-foreground">
                                                                        {set.targetWeight}kg x {set.targetReps}
                                                                    </td>
                                                                    <td className={cn(
                                                                        "text-center py-2 px-3 font-bold",
                                                                        exceededTarget ? "text-green-400" : "text-foreground"
                                                                    )}>
                                                                        {set.actualWeight}kg
                                                                        {exceededTarget && (
                                                                            <TrendingUp className="w-3 h-3 inline ml-1" />
                                                                        )}
                                                                    </td>
                                                                    <td className={cn(
                                                                        "text-center py-2 px-3",
                                                                        metReps ? "text-green-400 font-semibold" : "text-orange-400"
                                                                    )}>
                                                                        {set.actualReps}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default ClientProgress;
