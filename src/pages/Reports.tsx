import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

const weightData = [
    { date: 'Sem 1', weight: 85, target: 80 },
    { date: 'Sem 2', weight: 84.2, target: 79.8 },
    { date: 'Sem 3', weight: 83.5, target: 79.6 },
    { date: 'Sem 4', weight: 82.8, target: 79.4 },
    { date: 'Sem 5', weight: 82.1, target: 79.2 },
    { date: 'Sem 6', weight: 81.5, target: 79 },
    { date: 'Sem 7', weight: 80.8, target: 78.8 },
    { date: 'Sem 8', weight: 80.2, target: 78.6 },
];

const strengthData = [
    { name: 'Squat', prev: 90, current: 110 },
    { name: 'Bench', prev: 70, current: 85 },
    { name: 'Deadlift', prev: 120, current: 145 },
    { name: 'OHP', prev: 45, current: 55 },
];

const Reports = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reportes de Progreso</h1>
                    <p className="text-muted-foreground">Análisis detallado de rendimiento y evolución.</p>
                </div>
                <Button className="gap-2">
                    <Download className="w-4 h-4" />
                    Descargar PDF
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weight Loss Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Progreso de Peso</CardTitle>
                                <CardDescription>Evolución vs Objetivo</CardDescription>
                            </div>
                            <div className="p-2 bg-green-500/10 rounded-lg">
                                <TrendingDown className="w-5 h-5 text-green-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={weightData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="weight" name="Peso Actual" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--accent))' }} />
                                    <Line type="monotone" dataKey="target" name="Objetivo" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Strength Gains Chart */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Ganancias de Fuerza</CardTitle>
                                <CardDescription>Comparativa Mes Anterior vs Actual</CardDescription>
                            </div>
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-blue-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={strengthData} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--secondary))' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="prev" name="Mes Anterior" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="current" name="Mes Actual" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Reports;
