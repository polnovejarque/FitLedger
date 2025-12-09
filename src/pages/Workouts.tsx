import { useState } from 'react';
import { Play, Clock, Save, Plus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const exercises = [
    { id: 1, name: 'Barbell Squat', sets: 4, reps: '8-10', weight: 100, lastWeight: 95 },
    { id: 2, name: 'Bench Press', sets: 3, reps: '10-12', weight: 80, lastWeight: 75 },
    { id: 3, name: 'Deadlift', sets: 3, reps: '5', weight: 140, lastWeight: 135 },
    { id: 4, name: 'Overhead Press', sets: 3, reps: '12', weight: 50, lastWeight: 45 },
];

const Workouts = () => {
    const [duration] = useState('00:45:30');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Entrenamiento Activo</h1>
                    <p className="text-muted-foreground">Rutina de Fuerza - Día A (Pierna y Empuje)</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-lg border border-border">
                        <Clock className="w-4 h-4 text-accent" />
                        <span className="font-mono font-medium text-lg">{duration}</span>
                    </div>
                    <Button variant="destructive">Finalizar</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {exercises.map((exercise, index) => (
                    <Card key={exercise.id} className="border-l-4 border-l-accent">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 text-accent font-bold text-sm">
                                    {index + 1}
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{exercise.name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">Objetivo: {exercise.sets} series x {exercise.reps} reps</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon">
                                    <Clock className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                    <Play className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid grid-cols-12 gap-4 text-sm text-muted-foreground mb-2 px-2">
                                    <div className="col-span-2 text-center">SET</div>
                                    <div className="col-span-3 text-center">PREV</div>
                                    <div className="col-span-3 text-center">KG</div>
                                    <div className="col-span-3 text-center">REPETICIONES</div>
                                    <div className="col-span-1"></div>
                                </div>
                                {Array.from({ length: exercise.sets }).map((_, i) => (
                                    <div key={i} className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-2 flex justify-center">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                                                {i + 1}
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-center text-sm text-muted-foreground">
                                            {exercise.lastWeight}kg x {exercise.reps}
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                className="text-center h-9"
                                                defaultValue={exercise.weight}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <Input
                                                className="text-center h-9"
                                                placeholder={exercise.reps.toString()}
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <div className="w-6 h-6 rounded bg-accent/20 flex items-center justify-center cursor-pointer hover:bg-accent/30 transition-colors">
                                                <div className="w-2 h-2 rounded-full bg-accent"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button variant="ghost" size="sm" className="w-full mt-2 gap-2 text-muted-foreground hover:text-accent">
                                    <Plus className="w-4 h-4" /> Añadir Serie
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-8 pb-20">
                <Button size="lg" className="w-full md:w-[300px] gap-2">
                    <Save className="w-4 h-4" /> Guardar Entrenamiento
                </Button>
            </div>
        </div>
    );
};

export default Workouts;
