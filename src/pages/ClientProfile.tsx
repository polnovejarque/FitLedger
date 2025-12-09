import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Calendar, Dumbbell, TrendingUp, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const weightData = [
    { date: 'Ene', weight: 85 },
    { date: 'Feb', weight: 84 },
    { date: 'Mar', weight: 82.5 },
    { date: 'Abr', weight: 81 },
    { date: 'May', weight: 80.5 },
    { date: 'Jun', weight: 79 },
];

const ClientProfile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Mock client data (would normally fetch based on ID)
    const client = {
        name: 'Carlos Martínez',
        email: 'carlos.m@email.com',
        phone: '+34 623 456 789',
        location: 'Madrid, España',
        joinDate: '15 Ene 2024',
        status: 'Active',
        avatar: 'C.M.',
        stats: {
            sessionsCompleted: 42,
            streak: 5,
            weightLost: 6,
            waist: 85,
        },
        goals: ['Ganar masa muscular', 'Mejorar resistencia cardiovascular'],
        limitations: ['Lesión leve en rodilla derecha (Menisco)'],
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/clients')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.location}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button variant="outline">Editar Perfil</Button>
                    <Button>Nueva Sesión</Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-full text-accent">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Sesiones</p>
                            <p className="text-2xl font-bold">{client.stats.sessionsCompleted}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-orange-500/10 rounded-full text-orange-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Racha</p>
                            <p className="text-2xl font-bold">{client.stats.streak} <span className="text-sm text-muted-foreground font-normal">sem</span></p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Peso Perdido</p>
                            <p className="text-2xl font-bold">{client.stats.weightLost} <span className="text-sm text-muted-foreground font-normal">kg</span></p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Cintura</p>
                            <p className="text-2xl font-bold">{client.stats.waist} <span className="text-sm text-muted-foreground font-normal">cm</span></p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-border">
                <div className="flex gap-6">
                    {['overview', 'workouts', 'progress'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "pb-3 text-sm font-medium transition-colors border-b-2",
                                activeTab === tab
                                    ? "border-accent text-accent"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información General</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Teléfono</p>
                                        <p className="font-medium">{client.phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Fecha de Inicio</p>
                                        <p className="font-medium">{client.joinDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Estado</p>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                            {client.status}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Objetivos y Limitaciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-accent" /> Objetivos
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {client.goals.map((goal, i) => (
                                            <li key={i}>{goal}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-destructive">
                                        <AlertCircle className="w-4 h-4" /> Limitaciones / Lesiones
                                    </h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                        {client.limitations.map((lim, i) => (
                                            <li key={i}>{lim}</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {activeTab === 'workouts' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Planes de Entrenamiento</CardTitle>
                            <Button size="sm">Asignar Plan</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-secondary rounded-lg">
                                            <Dumbbell className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Hipertrofia - Fase 1</h4>
                                            <p className="text-sm text-muted-foreground">4 días/semana • 6 semanas</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Ver Detalles</Button>
                                </div>
                                <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/20">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-secondary rounded-lg">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Cardio HIIT</h4>
                                            <p className="text-sm text-muted-foreground">2 días/semana • Complementario</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Ver Detalles</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'progress' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Progreso de Peso</CardTitle>
                            <CardDescription>Evolución de los últimos 6 meses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={weightData}>
                                        <defs>
                                            <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                        />
                                        <Area type="monotone" dataKey="weight" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default ClientProfile;
