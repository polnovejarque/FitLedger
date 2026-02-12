import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Dumbbell, Target } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const WorkoutSummary = () => {
    const navigate = useNavigate();

    // Mock data - would come from workout session
    const workoutStats = {
        duration: "45'",
        totalVolume: '3.200 kg',
        exercisesCompleted: '5',
    };

    const handleGoHome = () => {
        // Navigate home and the ClientHome component will show the toast
        navigate('/client', { state: { showStreakToast: true } });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full space-y-8">
                {/* Success Icon */}
                <div className="flex justify-center">
                    <div className="w-28 h-28 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/30">
                        <CheckCircle className="w-16 h-16 text-green-500" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-4xl font-bold text-white">¡Entrenamiento Completado!</h1>
                    <p className="text-lg text-muted-foreground">
                        Buen trabajo, has cumplido tu objetivo de hoy.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Duration */}
                    <Card className="p-5 text-center bg-card/50">
                        <div className="flex justify-center mb-3">
                            <Clock className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{workoutStats.duration}</p>
                        <p className="text-xs text-muted-foreground mt-2">Tiempo</p>
                    </Card>

                    {/* Volume */}
                    <Card className="p-5 text-center bg-card/50">
                        <div className="flex justify-center mb-3">
                            <Dumbbell className="w-6 h-6 text-accent" />
                        </div>
                        <p className="text-3xl font-bold text-white">3.200</p>
                        <p className="text-xs text-muted-foreground mt-2">kg totales</p>
                    </Card>

                    {/* Exercises */}
                    <Card className="p-5 text-center bg-card/50">
                        <div className="flex justify-center mb-3">
                            <Target className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">{workoutStats.exercisesCompleted}</p>
                        <p className="text-xs text-muted-foreground mt-2">Ejercicios</p>
                    </Card>
                </div>

                {/* Action Button */}
                <Button
                    className="w-full h-14 text-lg"
                    size="lg"
                    onClick={handleGoHome}
                >
                    Volver al Inicio
                </Button>
            </div>
        </div>
    );
};

export default WorkoutSummary;
