import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { supabase } from '../lib/supabase';
import { 
    Users, Calendar, DollarSign, BarChart3, Bell, 
    Calendar as CalendarIcon, ArrowUpRight, Loader2
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis } from 'recharts';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Estados de Datos Reales
    const [kpi, setKpi] = useState({
        monthlyRevenue: 0,
        activeClients: 0,
        totalClients: 0,
        sessionsToday: 0
    });
    const [cashFlowData, setCashFlowData] = useState<any[]>([]);
    const [todayEvents, setTodayEvents] = useState<any[]>([]);

    // CARGAR DATOS
    useEffect(() => {
        const loadDashboardData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
            
            // 1. KPI: INGRESOS MES ACTUAL
            const { data: payments } = await supabase
                .from('payments')
                .select('amount, date')
                .eq('coach_id', user.id);

            const currentMonthRevenue = payments
                ?.filter(p => p.date >= startOfMonth && p.date <= endOfMonth && p.amount > 0)
                .reduce((acc, curr) => acc + curr.amount, 0) || 0;

            // 2. DATOS GRÁFICA (Ingresos por mes)
            const monthsMap: any = {};
            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const key = d.toLocaleString('es-ES', { month: 'short' });
                monthsMap[key] = { month: key, value: 0, sort: d.getTime() };
            }

            payments?.forEach(p => {
                if (p.amount > 0) {
                    const d = new Date(p.date);
                    const key = d.toLocaleString('es-ES', { month: 'short' });
                    if (monthsMap[key]) {
                        monthsMap[key].value += p.amount;
                    }
                }
            });
            const graphData = Object.values(monthsMap).sort((a: any, b: any) => a.sort - b.sort);
            setCashFlowData(graphData);

            // 3. KPI: CLIENTES
            const { data: clients } = await supabase.from('clients').select('id');
            const totalClients = clients?.length || 0;
            
            // 4. KPI: SESIONES HOY & AGENDA
            const todayStart = new Date(); todayStart.setHours(0,0,0,0);
            const todayEnd = new Date(); todayEnd.setHours(23,59,59,999);

            const { data: events } = await supabase
                .from('calendar_events')
                .select('*')
                .eq('coach_id', user.id)
                .gte('date', todayStart.toISOString())
                .lt('date', todayEnd.toISOString())
                .order('date', { ascending: true });

            const sessionsTodayCount = events?.length || 0;
            setTodayEvents(events || []);

            setKpi({
                monthlyRevenue: currentMonthRevenue,
                activeClients: totalClients,
                totalClients: totalClients,
                sessionsToday: sessionsTodayCount
            });
            setLoading(false);
        };

        loadDashboardData();
    }, []);

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Tarjetas Superiores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Ingresos */}
                <div onClick={() => navigate('/dashboard/finance')} className="bg-[#111] p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group hover:border-emerald-500/30 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><DollarSign className="w-5 h-5" /></div>
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Ingresos Este Mes</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{kpi.monthlyRevenue} €</h3>
                </div>
                
                {/* Clientes Activos */}
                <div onClick={() => navigate('/dashboard/clients')} className="bg-[#111] p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group hover:border-blue-500/50 cursor-pointer transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors"><Users className="w-5 h-5" /></div>
                        <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-blue-500" />
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Clientes Totales</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{kpi.activeClients}</h3>
                </div>

                {/* Sesiones Hoy */}
                <div onClick={() => navigate('/dashboard/agenda')} className="bg-[#111] p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group hover:border-purple-500/30 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Calendar className="w-5 h-5" /></div>
                        <span className="text-xs font-bold text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">Hoy</span>
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Sesiones Hoy</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{kpi.sessionsToday}</h3>
                </div>

                {/* Efectividad */}
                <div className="bg-[#111] p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group hover:border-orange-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><BarChart3 className="w-5 h-5" /></div>
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Efectividad</p>
                    <h3 className="text-3xl font-bold text-white mt-1">100%</h3>
                </div>
            </div>

            {/* Gráfica y Agenda */}
            <div className="grid lg:grid-cols-3 gap-6">
                
                {/* Gráfica Flujo de Caja */}
                <div className="lg:col-span-2 bg-[#111] p-6 rounded-2xl border border-zinc-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Evolución de Ingresos</h3>
                    </div>
                    
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={cashFlowData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradientGraph" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" hide />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }} 
                                    itemStyle={{ color: '#10b981' }}
                                    formatter={(value: number) => [`${value} €`, 'Ingresos']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    fill="url(#gradientGraph)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Agenda Lateral */}
                <div className="space-y-6">
                    <div className="bg-[#111] p-6 rounded-2xl border border-zinc-800 h-full flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-purple-500" /> Agenda de Hoy
                        </h3>
                        
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                            {todayEvents.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center py-10">No hay eventos para hoy.</p>
                            ) : (
                                todayEvents.map(event => {
                                    const date = new Date(event.date);
                                    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                                    
                                    return (
                                        <div key={event.id} className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 flex justify-between items-center hover:bg-zinc-900 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-bold text-white font-mono">{time}</span>
                                                <div className="h-8 w-[1px] bg-zinc-700"></div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white font-bold truncate max-w-[120px]">{event.title}</p>
                                                    <p className="text-xs text-zinc-500 capitalize">{event.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        
                        <div className="mt-4 text-center pt-4 border-t border-zinc-800">
                            <button 
                                onClick={() => navigate('/dashboard/agenda')} 
                                className="text-xs text-zinc-400 hover:text-white underline-offset-4 hover:underline transition-all"
                            >
                                Ver agenda completa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="h-screen flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin"/></div>;

    return (
        <div className="p-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">Hola, Coach <span className="animate-pulse">👋</span></h1>
                    <p className="text-zinc-400 mt-1">Aquí tienes el resumen de tu negocio hoy.</p>
                </div>
                <div className="flex items-center gap-4 hidden md:flex">
                    <button className="p-2 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg hover:bg-zinc-900 transition-colors">
                        <Bell className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {renderOverview()}
        </div>
    );
};

export default Dashboard;