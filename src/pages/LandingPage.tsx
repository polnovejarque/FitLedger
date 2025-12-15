import { useNavigate } from 'react-router-dom';
import { DollarSign, Users, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <nav className="border-b border-border/40 backdrop-blur-sm fixed w-full top-0 z-50 bg-background/80">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <span className="text-lg font-bold">FL</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">FitLedger</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => navigate('/dashboard')}>
                            Login
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col pt-24">
                <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-20 lg:py-32 space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
                            Tu Negocio Fitness en <span className="text-primary">Autopiloto</span>.
                        </h1>
                        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            Deja el Excel y las notas del móvil. Gestiona clientes, pagos y entrenamientos en un solo lugar.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-8">
                        <Button
                            size="lg"
                            className="px-8 py-6 text-lg rounded-full shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all duration-300"
                            onClick={() => navigate('/dashboard')}
                        >
                            Ver Demo Interactiva
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="px-8 py-6 text-lg rounded-full border-primary/50 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                        >
                            Unirse a la Lista de Espera
                        </Button>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto px-6 py-20">
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<DollarSign className="h-8 w-8 text-primary" />}
                            title="Control Financiero Total"
                            description="Registra ingresos, gastos y suscripciones. Visualiza tu flujo de caja en tiempo real."
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8 text-primary" />}
                            title="Gestión de Clientes"
                            description="Perfiles detallados, seguimiento de progreso y historial de entrenamientos en un clic."
                        />
                        <FeatureCard
                            icon={<Calendar className="h-8 w-8 text-primary" />}
                            title="Agenda Inteligente"
                            description="Organiza sesiones, clases grupales y evita conflictos de horarios automáticamente."
                        />
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border py-8 text-center text-muted-foreground">
                <p>&copy; 2025 FitLedger. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};

// Simple internal component for feature cards to keep it clean
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-8 rounded-2xl bg-card border border-border/50 hover:border-primary/50 transition-colors duration-300 group hover:shadow-lg hover:shadow-primary/5">
        <div className="mb-6 p-4 rounded-xl bg-background border border-border inline-block group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
