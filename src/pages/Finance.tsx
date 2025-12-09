import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, TrendingUp, TrendingDown, FileText, Download, Filter } from 'lucide-react';
import { cn } from '../lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const monthlyData = [
    { name: 'Ene', income: 4000, expenses: 2400 },
    { name: 'Feb', income: 3000, expenses: 1398 },
    { name: 'Mar', income: 2000, expenses: 9800 },
    { name: 'Abr', income: 2780, expenses: 3908 },
    { name: 'May', income: 1890, expenses: 4800 },
    { name: 'Jun', income: 2390, expenses: 3800 },
    { name: 'Jul', income: 3490, expenses: 4300 },
    { name: 'Ago', income: 4200, expenses: 3100 },
    { name: 'Sep', income: 5100, expenses: 3500 },
    { name: 'Oct', income: 4800, expenses: 2900 },
    { name: 'Nov', income: 5600, expenses: 4100 },
    { name: 'Dic', income: 6100, expenses: 3800 },
];

const expenseCategories = [
    { name: 'Alquiler', value: 3500, color: '#00E676' },
    { name: 'Equipamiento', value: 1200, color: '#3b82f6' },
    { name: 'Marketing', value: 800, color: '#f59e0b' },
    { name: 'Servicios', value: 450, color: '#ef4444' },
    { name: 'Software', value: 200, color: '#8b5cf6' },
];

const transactions = [
    { id: 'TRX-9821', date: '2024-03-15', description: 'Pago Mensualidad - Cliente #452', category: 'Ingreso', amount: 150.00, status: 'Completed' },
    { id: 'TRX-9822', date: '2024-03-14', description: 'Compra Material Deportivo', category: 'Gasto', amount: -450.50, status: 'Completed' },
    { id: 'TRX-9823', date: '2024-03-14', description: 'Campaña Facebook Ads', category: 'Gasto', amount: -120.00, status: 'Pending' },
    { id: 'TRX-9824', date: '2024-03-13', description: 'Pago Mensualidad - Cliente #453', category: 'Ingreso', amount: 150.00, status: 'Completed' },
    { id: 'TRX-9825', date: '2024-03-12', description: 'Mantenimiento Aire Acondicionado', category: 'Gasto', amount: -280.00, status: 'Completed' },
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
                    {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-muted-foreground text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold mt-1">{value}</h3>
            </div>
        </CardContent>
    </Card>
);

const Finance = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finanzas</h1>
                    <p className="text-muted-foreground">Resumen financiero y gestión de transacciones.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Exportar
                    </Button>
                    <Button className="gap-2">
                        <FileText className="w-4 h-4" />
                        Nueva Factura
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Ingresos Totales"
                    value="$45,231.89"
                    change="+20.1%"
                    icon={DollarSign}
                    trend="up"
                />
                <StatCard
                    title="Gastos Totales"
                    value="$12,450.00"
                    change="-4.5%"
                    icon={TrendingDown}
                    trend="up" // Up is good for expenses going down? Or visually consistent? Let's use up for positive outcome (green)
                />
                <StatCard
                    title="Beneficio Neto"
                    value="$32,781.89"
                    change="+15.2%"
                    icon={TrendingUp}
                    trend="up"
                />
                <StatCard
                    title="Facturas Pendientes"
                    value="$1,250.00"
                    change="+2"
                    icon={FileText}
                    trend="down" // Down is bad (red)
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Income vs Expenses Chart */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Ingresos vs Gastos</CardTitle>
                        <CardDescription>Comparativa anual de rendimiento financiero.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <defs>
                                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="income" name="Ingresos" stroke="hsl(var(--accent))" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                    <Area type="monotone" dataKey="expenses" name="Gastos" stroke="hsl(var(--destructive))" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
                                    <Legend />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Expense Breakdown */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Desglose de Gastos</CardTitle>
                        <CardDescription>Distribución por categoría.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full flex justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseCategories}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {expenseCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} stroke="hsl(var(--background))" strokeWidth={2} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
                                        itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                    />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transacciones Recientes</CardTitle>
                        <CardDescription>Últimos movimientos registrados.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input placeholder="Buscar transacción..." className="w-[250px]" />
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-lg">ID</th>
                                    <th className="px-6 py-3">Fecha</th>
                                    <th className="px-6 py-3">Descripción</th>
                                    <th className="px-6 py-3">Categoría</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3 text-right rounded-tr-lg">Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((trx) => (
                                    <tr key={trx.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{trx.id}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{trx.date}</td>
                                        <td className="px-6 py-4">{trx.description}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                                                trx.category === 'Ingreso' ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                                            )}>
                                                {trx.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                                                trx.status === 'Completed' ? "bg-green-500/10 text-green-500" :
                                                    trx.status === 'Pending' ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
                                            )}>
                                                {trx.status === 'Completed' ? 'Completado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className={cn("px-6 py-4 text-right font-bold",
                                            trx.amount > 0 ? "text-accent" : "text-foreground"
                                        )}>
                                            {trx.amount > 0 ? '+' : ''}{trx.amount.toFixed(2)} €
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Finance;
