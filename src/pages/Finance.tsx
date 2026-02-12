import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    DollarSign, Download, Search, ArrowUpRight, ArrowDownRight, 
    Clock, CheckCircle2, AlertCircle, Plus, X, Loader2, Calendar 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const Finance = () => {
    // Estados de Datos
    const [transactions, setTransactions] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para "Nuevo Movimiento"
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Formulario Nuevo Movimiento
    const [newType, setNewType] = useState<'income' | 'expense'>('income');
    const [newAmount, setNewAmount] = useState('');
    const [newConcept, setNewConcept] = useState('');
    const [newClientId, setNewClientId] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

    // 1. CARGAR DATOS (Pagos y Clientes)
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // A. Cargar Clientes (para el select)
        const { data: clientsData } = await supabase.from('clients').select('id, name');
        if (clientsData) setClients(clientsData);

        // B. Cargar Pagos (Uniendo con tabla clientes para saber el nombre)
        const { data: paymentsData } = await supabase
            .from('payments')
            .select('*, clients(name)')
            .eq('coach_id', user.id)
            .order('date', { ascending: false });

        if (paymentsData) {
            // Transformar datos de Supabase al formato que usa tu UI
            const formatted = paymentsData.map(p => ({
                id: `TRX-${p.id}`,
                date: p.date,
                // Si hay cliente, ponemos "Concepto - NombreCliente", si no solo Concepto
                description: p.clients ? `${p.concept} - ${p.clients.name}` : p.concept,
                category: p.amount >= 0 ? 'Ingreso' : 'Gasto',
                status: p.status === 'paid' ? 'Completado' : 'Pendiente',
                amount: p.amount,
                rawDate: new Date(p.date) // Para ordenar gráficas
            }));
            setTransactions(formatted);
        }
        setLoading(false);
    };

    // 2. GUARDAR NUEVO MOVIMIENTO
    const handleSaveTransaction = async () => {
        if (!newAmount || !newConcept) return alert("Rellena importe y concepto");
        setIsSaving(true);

        const { data: { user } } = await supabase.auth.getUser();
        
        // Si es gasto, el monto es negativo
        const finalAmount = newType === 'expense' ? -Math.abs(Number(newAmount)) : Math.abs(Number(newAmount));

        const paymentData = {
            coach_id: user?.id,
            amount: finalAmount,
            concept: newConcept,
            date: newDate,
            status: 'paid', // Por defecto pagado al crearlo manual
            client_id: newType === 'income' && newClientId ? newClientId : null
        };

        const { error } = await supabase.from('payments').insert([paymentData]);

        if (error) {
            alert("Error al guardar: " + error.message);
        } else {
            setShowModal(false);
            // Reset form
            setNewAmount(''); setNewConcept(''); setNewClientId('');
            fetchData(); // Recargar tabla
        }
        setIsSaving(false);
    };

    // --- CÁLCULOS KPI (Dinamicos) ---
    const totalRevenue = transactions
        .filter(t => t.category === 'Ingreso' && t.status === 'Completado')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingRevenue = transactions
        .filter(t => t.category === 'Ingreso' && t.status === 'Pendiente')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const completedPaymentsCount = transactions.filter(t => t.category === 'Ingreso' && t.status === 'Completado').length;
    const averageTicket = completedPaymentsCount > 0 ? Math.round(totalRevenue / completedPaymentsCount) : 0;

    // --- CÁLCULO GRÁFICAS (Dinámico) ---
    // 1. Gráfica de Flujo (Agrupar por mes)
    const processChartData = () => {
        const months: any = {};
        transactions.forEach(t => {
            const monthName = t.rawDate.toLocaleString('es-ES', { month: 'short' }); // "ene", "feb"
            if (!months[monthName]) months[monthName] = { month: monthName, ingresos: 0, gastos: 0, order: t.rawDate.getMonth() };
            
            if (t.amount > 0) months[monthName].ingresos += t.amount;
            else months[monthName].gastos += Math.abs(t.amount);
        });
        // Convertir a array y ordenar por mes
        return Object.values(months).sort((a:any, b:any) => a.order - b.order);
    };

    // 2. Gráfica de Queso (Agrupar gastos por concepto)
    const processPieData = () => {
        const expenses = transactions.filter(t => t.amount < 0);
        const categories: any = {};
        expenses.forEach(t => {
            // Simplificar concepto (ej: "Alquiler Enero" -> "Alquiler")
            const key = t.description.split(' ')[0]; 
            if (!categories[key]) categories[key] = 0;
            categories[key] += Math.abs(t.amount);
        });
        
        const colors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];
        return Object.keys(categories).map((key, index) => ({
            name: key,
            value: categories[key],
            color: colors[index % colors.length]
        }));
    };

    // Filtrado y Exportación
    const filteredTransactions = transactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExportCSV = () => {
        const separator = ";";
        const headers = ["ID", "Fecha", "Descripción", "Categoría", "Estado", "Monto (€)"];
        const rows = filteredTransactions.map(t => [
            t.id, t.date, `"${t.description}"`, t.category, t.status, t.amount.toFixed(2)
        ].join(separator));
        const csvContent = [headers.join(separator), ...rows].join("\n");
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `movimientos_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && transactions.length === 0) return <div className="flex h-screen items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin"/></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Finanzas</h1>
                    <p className="text-zinc-400 mt-1">Controla tus ingresos, gastos y flujo de caja.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800" onClick={handleExportCSV}>
                        <Download className="w-4 h-4" /> Exportar
                    </Button>
                    <Button className="gap-2 bg-emerald-500 text-black hover:bg-emerald-400 font-bold" onClick={() => setShowModal(true)}>
                        <Plus className="w-4 h-4" /> Nuevo Movimiento
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-emerald-500/10 border-emerald-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-500"><DollarSign className="w-6 h-6" /></div>
                            <div><p className="text-sm font-medium text-zinc-400">Cobrado este mes</p><h3 className="text-2xl font-bold text-emerald-500">{totalRevenue} €</h3></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/10 border-amber-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-500/20 rounded-full text-amber-500"><Clock className="w-6 h-6" /></div>
                            <div><p className="text-sm font-medium text-zinc-400">Pendiente de cobro</p><h3 className="text-2xl font-bold text-amber-500">{pendingRevenue} €</h3></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-500/10 border-blue-500/20">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-full text-blue-500"><ArrowUpRight className="w-6 h-6" /></div>
                            <div><p className="text-sm font-medium text-zinc-400">Ticket Medio</p><h3 className="text-2xl font-bold text-blue-500">{averageTicket} €</h3></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* GRÁFICOS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-[#111] border-zinc-800">
                    <CardHeader><CardTitle className="text-white">Flujo de Caja</CardTitle><CardDescription>Ingresos vs Gastos reales.</CardDescription></CardHeader>
                    <CardContent className="pl-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={processChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}€`} />
                                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                    <Area type="monotone" dataKey="ingresos" stroke="#10b981" fillOpacity={1} fill="url(#colorIngresos)" />
                                    <Area type="monotone" dataKey="gastos" stroke="#ef4444" fillOpacity={1} fill="url(#colorGastos)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-[#111] border-zinc-800">
                    <CardHeader><CardTitle className="text-white">Gastos</CardTitle><CardDescription>Distribución por concepto.</CardDescription></CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex justify-center items-center">
                            {transactions.some(t => t.amount < 0) ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={processPieData()} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {processPieData().map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-zinc-500 text-sm text-center">Registra un gasto para ver la gráfica.</div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* TABLA */}
            <Card className="bg-[#111] border-zinc-800">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white">Movimientos</CardTitle>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input placeholder="Buscar..." className="pl-9 bg-zinc-900 border-zinc-700 text-white w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-zinc-800 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-zinc-900 text-zinc-400 font-medium">
                                <tr className="border-b border-zinc-800"><th className="p-4">Fecha</th><th className="p-4">Descripción</th><th className="p-4">Categoría</th><th className="p-4">Estado</th><th className="p-4 text-right">Monto</th></tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                {filteredTransactions.length === 0 ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-zinc-500">No hay movimientos aún.</td></tr>
                                ) : (
                                    filteredTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-zinc-900/50">
                                            <td className="p-4 text-zinc-500">{t.date}</td>
                                            <td className="p-4 font-medium text-white">{t.description}</td>
                                            <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs ${t.category === 'Ingreso' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>{t.category === 'Ingreso' ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownRight className="w-3 h-3"/>} {t.category}</span></td>
                                            <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${t.status === 'Completado' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{t.status === 'Completado' ? <CheckCircle2 className="w-3 h-3"/> : <AlertCircle className="w-3 h-3"/>} {t.status}</span></td>
                                            <td className={`p-4 text-right font-bold ${t.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{t.amount > 0 ? '+' : ''}{t.amount} €</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* MODAL NUEVO MOVIMIENTO */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-bold text-white mb-6">Registrar Movimiento</h2>
                        
                        <div className="space-y-4">
                            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                                <button onClick={() => setNewType('income')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newType === 'income' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}>Ingreso</button>
                                <button onClick={() => setNewType('expense')} className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newType === 'expense' ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-white'}`}>Gasto</button>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Importe (€)</label>
                                <Input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="0.00" className="bg-zinc-900 border-zinc-700 text-white" />
                            </div>

                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Concepto</label>
                                <Input type="text" value={newConcept} onChange={(e) => setNewConcept(e.target.value)} placeholder={newType === 'income' ? "Ej: Mensualidad Febrero" : "Ej: Alquiler Estudio"} className="bg-zinc-900 border-zinc-700 text-white" />
                            </div>

                            {newType === 'income' && (
                                <div>
                                    <label className="text-xs text-zinc-500 mb-1 block">Cliente (Opcional)</label>
                                    <select value={newClientId} onChange={(e) => setNewClientId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-sm text-white outline-none focus:border-emerald-500">
                                        <option value="">-- Seleccionar Cliente --</option>
                                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-zinc-500 mb-1 block">Fecha</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"/>
                                    <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="pl-9 bg-zinc-900 border-zinc-700 text-white" />
                                </div>
                            </div>

                            <Button onClick={handleSaveTransaction} disabled={isSaving} className="w-full bg-white text-black font-bold hover:bg-zinc-200 mt-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : "Guardar Movimiento"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Finance;