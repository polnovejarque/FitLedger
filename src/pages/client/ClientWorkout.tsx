import { useNavigate } from 'react-router-dom';
import { Dumbbell, Play, Calendar, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

// Mock routine data
const activeRoutine = {
    id: '1',
    name: 'Rutina de Fuerza A',
    assignedDate: '2026-01-14',
    exercises: [
        { name: 'Sentadilla', sets: 4, reps: 10, weight: 80 },
        { name: 'Press Banca', sets: 3, reps: 10, weight: 60 },
        { name: 'Peso Muerto', sets: 3, reps: 8, weight: 100 },
        { name: 'Press Militar', sets: 3, reps: 10, weight: 40 },
    ]
};

const ClientWorkout = () => {
    const navigate = useNavigate();

    const handleStartWorkout = () => {
        navigate('/client/workout-player');
    };

    return (
        <div className="p-4 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold mb-2">Mi Rutina</h1>
                <p className="text-muted-foreground">Rutina asignada para hoy</p>
            </div>

            {activeRoutine ? (
                <>
                    {/* Routine Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-accent" />
                                {activeRoutine.name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(activeRoutine.assignedDate).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>~45 min</span>
                                </div>
                            </div>

                            {/* Start Workout Button */}
                            <Button
                                onClick={handleStartWorkout}
                                className="w-full gap-2"
                                size="lg"
                            >
                                <Play className="w-5 h-5" />
                                Comenzar Entrenamiento
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Exercises List */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ejercicios de Hoy</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {activeRoutine.exercises.map((exercise, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-medium">{exercise.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {exercise.sets} series × {exercise.reps} reps
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-accent">{exercise.weight}kg</p>
                                            <p className="text-xs text-muted-foreground">objetivo</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                /* No Routine Assigned */
                <Card>
                    <CardContent className="py-12 text-center">
                        <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <h3 className="text-lg font-semibold mb-2">No tienes rutinas asignadas hoy</h3>
                        <p className="text-sm text-muted-foreground">
                            Tu entrenador te asignará una rutina próximamente
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ClientWorkout;
