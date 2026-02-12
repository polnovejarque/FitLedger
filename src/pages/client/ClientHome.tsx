import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Flame, Weight } from 'lucide-react';
import WeightModal from '../../components/WeightModal';
import ToastContainer from '../../components/ui/ToastContainer';
import type { ToastProps } from '../../components/ui/Toast';

const ClientHome = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showWeightModal, setShowWeightModal] = useState(false);
    const [currentWeight, setCurrentWeight] = useState(68);
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    // Check if we're returning from workout summary
    useEffect(() => {
        if (location.state?.showStreakToast) {
            showToast('Racha actualizada 🔥', 'success');
            // Clear the state to prevent showing toast again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: ToastProps = {
            id,
            message,
            type,
            onClose: (toastId: string) => {
                setToasts(prev => prev.filter(t => t.id !== toastId));
            }
        };
        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    };

    const handleWeightSave = (weight: number) => {
        setCurrentWeight(weight);
        showToast(`Peso actualizado: ${weight}kg`, 'success');
    };

    return (
        <>
            <div className="p-4 space-y-6">
                {/* Hero Section */}
                <div className="pt-2 pb-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Hola, Ana 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>

                {/* Daily Workout Card - Main CTA */}
                <Link to="/client/workout-player">
                    <Card className="p-6 bg-gradient-to-br from-accent/20 to-accent/5 border-accent/30 hover:border-accent/50 transition-all cursor-pointer active:scale-[0.98]">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-2">
                                    Entrenamiento de Hoy
                                </p>
                                <h2 className="text-2xl font-bold mb-1">Pierna e Hipertrofia</h2>
                                <p className="text-sm text-muted-foreground">5 ejercicios • 45-60 min</p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                                <ArrowRight className="w-6 h-6 text-accent" />
                            </div>
                        </div>
                        <Button className="w-full mt-2" size="lg">
                            Comenzar Entrenamiento
                        </Button>
                    </Card>
                </Link>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Streak Card */}
                    <Card className="p-4 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">7</p>
                                <p className="text-xs text-muted-foreground">Días de racha</p>
                            </div>
                        </div>
                    </Card>

                    {/* Current Weight Card */}
                    <Card className="p-4 hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Weight className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">68kg</p>
                                <p className="text-xs text-muted-foreground">Peso actual</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions Section */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Acciones Rápidas
                    </h3>

                    <Card
                        className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:scale-[0.98]"
                        onClick={() => setShowWeightModal(true)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Registrar Peso</p>
                                <p className="text-sm text-muted-foreground">Mantén tu progreso actualizado</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </Card>

                    <Card
                        className="p-4 hover:bg-secondary/50 transition-colors cursor-pointer active:scale-[0.98]"
                        onClick={() => navigate('/client/progress')}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold">Ver Historial</p>
                                <p className="text-sm text-muted-foreground">Revisa tus entrenamientos</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Weight Modal */}
            <WeightModal
                isOpen={showWeightModal}
                onClose={() => setShowWeightModal(false)}
                onSave={handleWeightSave}
                currentWeight={currentWeight}
            />

            {/* Toast Notifications */}
            <ToastContainer
                toasts={toasts}
                onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
            />
        </>
    );
};

export default ClientHome;
