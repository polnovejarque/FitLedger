import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ArrowUpRight, Users, DollarSign, TrendingUp, Activity, Dumbbell } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const data = [
    { name: 'Jan', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Apr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
    { name: 'Jul', income: 3490, expenses: 4300 },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card>
        <CardContent className="p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <div className="p-3 bg-secondary rounded-xl">
                    <Icon className="w-6 h-6 text-accent" />
                </div>
                <div className={cn("flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg",
                    trend === 'up' ? "text-accent bg-accent/10" : "text-destructive bg-destructive/10")}>
                    {change}
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
            <div className="mt-4">
                <p className="text-muted-foreground text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
            </div>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline">Descargar Reporte</Button>
                    <Button>Nueva Sesión</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ingresos Recurrentes (MRR)"
                    value="$12,450"
                    change="+20%"
                    icon={DollarSign}
                    trend="up"
                />
                <StatCard
                    title="Beneficio Neto"
                    value="$8,150"
                    change="+12%"
                    icon={TrendingUp}
                    trend="up"
                />
                <StatCard
                    title="Clientes Activos"
                    value="45"
                    change="+3"
                    icon={Users}
                    trend="up"
                />
                <StatCard
                    title="Sesiones Completadas"
                    value="128"
                    change="+8%"
                    icon={Activity}
                    trend="up"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                {/* Main Chart Section */}
                <Card className="col-span-1 md:col-span-4 lg:col-span-5">
                    <CardHeader>
                        <CardTitle>Flujo de Caja</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="income" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-1 md:col-span-3 lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="space-y-4">
                            {[
                                { id: 1, name: 'Carlos M.', action: 'pagó su mensualidad', time: 'Hace 2 horas', avatar: 'CM' },
                                { id: 2, name: 'Ana García', action: 'completó sesión de fuerza', time: 'Hace 3 horas', avatar: 'AG' },
                                { id: 3, name: 'Pedro Suárez', action: 'reservó una clase', time: 'Hace 5 horas', avatar: 'PS' },
                                { id: 4, name: 'María López', action: 'actualizó su peso', time: 'Hace 1 día', avatar: 'ML' },
                                { id: 5, name: 'Jorge Ruiz', action: 'renovó su plan', time: 'Hace 1 día', avatar: 'JR' },
                            ].map((activity) => (
                                <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold border border-border" translate="no">
                                        {activity.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{activity.name} {activity.action}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Sessions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Próximas Sesiones</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
                                        <Dumbbell className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Entrenamiento de Fuerza</p>
                                        <p className="text-xs text-muted-foreground">Ana García • 10:00 AM</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-accent/10 text-accent text-xs rounded-full font-medium">Confirmado</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Revisión Mensual</p>
                                        <p className="text-xs text-muted-foreground">Pedro S. • 11:30 AM</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full font-medium">Online</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribución de Ingresos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Personal', value: 65 },
                                    { name: 'Online', value: 25 },
                                    { name: 'Nutrición', value: 10 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--secondary))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
