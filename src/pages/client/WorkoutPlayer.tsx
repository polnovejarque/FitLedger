import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

interface ExerciseSet {
    setNumber: number;
    previousBest: string;
    targetReps: number;
    targetWeight: number;
    completed: boolean;
    actualWeight?: number; // Actual weight logged by user
}

interface Exercise {
    id: string;
    name: string;
    sets: ExerciseSet[];
    restTime: number; // seconds
}

const mockWorkout: Exercise[] = [
    {
        id: '1',
        name: 'Sentadilla',
        restTime: 90,
        sets: [
            { setNumber: 1, previousBest: '80kg x 10', targetReps: 10, targetWeight: 80, completed: false, actualWeight: undefined },
            { setNumber: 2, previousBest: '80kg x 10', targetReps: 10, targetWeight: 80, completed: false, actualWeight: undefined },
            { setNumber: 3, previousBest: '80kg x 8', targetReps: 10, targetWeight: 80, completed: false, actualWeight: undefined },
            { setNumber: 4, previousBest: '80kg x 8', targetReps: 10, targetWeight: 80, completed: false, actualWeight: undefined },
        ]
    },
    {
        id: '2',
        name: 'Press Banca',
        restTime: 120,
        sets: [
            { setNumber: 1, previousBest: '60kg x 10', targetReps: 10, targetWeight: 60, completed: false, actualWeight: undefined },
            { setNumber: 2, previousBest: '60kg x 10', targetReps: 10, targetWeight: 60, completed: false, actualWeight: undefined },
            { setNumber: 3, previousBest: '60kg x 8', targetReps: 10, targetWeight: 60, completed: false, actualWeight: undefined },
        ]
    },
];

const WorkoutPlayer = () => {
    const navigate = useNavigate();
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [exercises, setExercises] = useState<Exercise[]>(mockWorkout);
    const [showRestTimer, setShowRestTimer] = useState(false);
    const [restTimeRemaining, setRestTimeRemaining] = useState(0);

    const currentExercise = exercises[currentExerciseIndex];
    const isLastExercise = currentExerciseIndex === exercises.length - 1;

    // Rest timer countdown
    useEffect(() => {
        if (showRestTimer && restTimeRemaining > 0) {
            const timer = setInterval(() => {
                setRestTimeRemaining(prev => {
                    if (prev <= 1) {
                        setShowRestTimer(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [showRestTimer, restTimeRemaining]);

    const handleSetComplete = (setIndex: number) => {
        const updatedExercises = [...exercises];
        const currentSet = updatedExercises[currentExerciseIndex].sets[setIndex];

        if (!currentSet.completed) {
            currentSet.completed = true;
            setExercises(updatedExercises);

            // Start rest timer
            setRestTimeRemaining(currentExercise.restTime);
            setShowRestTimer(true);
        }
    };

    const handleNextExercise = () => {
        if (!isLastExercise) {
            setCurrentExerciseIndex(prev => prev + 1);
        }
    };

    const handleFinishWorkout = () => {
        // TODO: Save workout data
        navigate('/client/workout-summary');
    };

    const handleMinimize = () => {
        navigate('/client');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Ejercicio {currentExerciseIndex + 1}/{exercises.length}
                        </p>
                        <h1 className="text-xl font-bold">{currentExercise.name}</h1>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleMinimize}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-6 pb-32">
                {/* Video/Image Placeholder */}
                <div className="aspect-video bg-secondary/50 rounded-lg flex flex-col items-center justify-center border border-border gap-3">
                    <div className="w-16 h-16 rounded-full bg-background/50 flex items-center justify-center">
                        <Play className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">Vista previa no disponible</p>
                </div>

                {/* Sets List */}
                <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Series</h2>
                    {currentExercise.sets.map((set, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                                set.completed
                                    ? "bg-accent/10 border-accent/50"
                                    : "bg-card border-border hover:border-accent/30"
                            )}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => handleSetComplete(index)}
                                className={cn(
                                    "shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all",
                                    set.completed
                                        ? "bg-accent text-background"
                                        : "bg-secondary border-2 border-border hover:border-accent"
                                )}
                            >
                                {set.completed ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <Circle className="w-6 h-6 text-muted-foreground" />
                                )}
                            </button>

                            {/* Set Info */}
                            <div className="flex-1">
                                <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Serie</p>
                                        <p className="font-semibold">#{set.setNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Anterior</p>
                                        <p className="font-semibold text-xs">{set.previousBest}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Objetivo</p>
                                        <p className="font-semibold">{set.targetWeight}kg x {set.targetReps}</p>
                                    </div>
                                </div>

                                {/* Weight Input */}
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-muted-foreground whitespace-nowrap">Peso usado:</label>
                                    <input
                                        type="number"
                                        value={set.actualWeight ?? ''}
                                        onChange={(e) => {
                                            const updatedExercises = [...exercises];
                                            updatedExercises[currentExerciseIndex].sets[index].actualWeight =
                                                e.target.value ? parseFloat(e.target.value) : undefined;
                                            setExercises(updatedExercises);
                                        }}
                                        placeholder={set.targetWeight.toString()}
                                        className="w-20 px-2 py-1 bg-background border border-border rounded text-sm text-center focus:outline-none focus:ring-1 focus:ring-accent"
                                        step="0.5"
                                        min="0"
                                    />
                                    <span className="text-xs text-muted-foreground">kg</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer - Navigation */}
            <div className="fixed bottom-20 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-40">
                <div className="max-w-md mx-auto">
                    {isLastExercise ? (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleFinishWorkout}
                        >
                            Finalizar Entrenamiento
                        </Button>
                    ) : (
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleNextExercise}
                        >
                            Siguiente Ejercicio
                        </Button>
                    )}
                </div>
            </div>

            {/* Rest Timer Overlay */}
            {showRestTimer && (
                <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-4">Tiempo de descanso</p>
                        <div className="text-8xl font-bold text-accent mb-8">
                            {formatTime(restTimeRemaining)}
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowRestTimer(false)}
                        >
                            Saltar descanso
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkoutPlayer;
