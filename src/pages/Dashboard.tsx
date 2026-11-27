import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
    Users,
    Calendar,
    DollarSign,
    BarChart3,
    Bell,
    Calendar as CalendarIcon,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, CartesianGrid } from 'recharts';
import { subscribeToPush } from '../services/pushNotificationService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState('admin');
    const [kpi, setKpi] = useState({
        monthlyRevenue: 0,
        activeClients: 0,
        totalClients: 0,
        sessionsToday: 0,
        sessionsThisMonth: 0,
    });
    const [cashFlowData, setCashFlowData] = useState<any[]>([]);
    const [todayEvents, setTodayEvents] = useState<any[]>([]);
    const [newLeadsCount, setNewLeadsCount] = useState(0);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setError(null);
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (userError || !user) { setError('No se pudo verificar la sesión. Recarga la página.'); setLoading(false); return; }

                // Registrar para recibir notificaciones push en el teléfono/navegador
                subscribeToPush(user.id, null).catch(err => console.log('Push subscription skipped:', err));

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, plan, business_name, logo_url, studio_id')
                    .eq('id', user.id)
                    .single();

                if (profileError) console.warn('Error cargando perfil:', profileError.message);
                if (profile?.role) setUserRole(profile.role);

                const currentStudioId = profile?.studio_id || user.id;

                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

                let currentMonthRevenue = 0;
                if (profile?.role !== 'staff') {
                    const { data: payments, error: paymentsError } = await supabase
                        .from('payments')
                        .select('amount, date')
                        .eq('coach_id', user.id);

                    if (paymentsError) console.warn('Error cargando pagos:', paymentsError.message);

                    currentMonthRevenue = payments
                        ?.filter(p => p.date >= startOfMonth && p.date <= endOfMonth && p.amount > 0)
                        .reduce((acc, curr) => acc + curr.amount, 0) || 0;

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
                            if (monthsMap[key]) monthsMap[key].value += p.amount;
                        }
                    });

                    setCashFlowData(Object.values(monthsMap).sort((a: any, b: any) => a.sort - b.sort));
                }

                // Cargar únicamente los clientes asignados o creados por este coach/studio
                const { data: clients } = await supabase
                    .from('clients')
                    .select('id, status')
                    .or(`studio_id.eq.${currentStudioId},user_id.eq.${user.id},assigned_coach_id.eq.${user.id}`);

                const activeClientsCount = clients?.filter(c => !c.status || c.status.toLowerCase() === 'active').length || 0;
                const totalClients = activeClientsCount;

                const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
                const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

                const { data: events } = await supabase
                    .from('calendar_events')
                    .select('*')
                    .eq('coach_id', user.id)
                    .gte('date', todayStart.toISOString())
                    .lt('date', todayEnd.toISOString())
                    .order('date', { ascending: true });

                setTodayEvents(events || []);

                // Sesiones del mes completo
                const { data: monthEvents } = await supabase
                    .from('calendar_events')
                    .select('id')
                    .eq('coach_id', user.id)
                    .gte('date', startOfMonth)
                    .lte('date', endOfMonth);

                setKpi({ 
                    monthlyRevenue: currentMonthRevenue, 
                    activeClients: totalClients, 
                    totalClients, 
                    sessionsToday: events?.length || 0,
                    sessionsThisMonth: monthEvents?.length || 0,
                });

                // Cargar leads pendientes del marketplace
                const { data: newLeads, error: leadsError } = await supabase
                    .from('marketplace_leads')
                    .select('id')
                    .eq('coach_id', user.id)
                    .eq('status', 'new');
                if (!leadsError && newLeads) {
                    setNewLeadsCount(newLeads.length);
                }
            } catch (err: any) {
                console.error('Error en Dashboard:', err);
                setError('No se pudieron cargar los datos. Comprueba tu conexión y recarga.');
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const formattedTodayLabel = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    const renderOverview = () => (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* ALERT BANNERS */}
            {newLeadsCount > 0 && (
                <div className="glass-card flex flex-col md:flex-row items-center justify-between gap-4 p-4 !border-emerald-500/25 rounded-3xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/15 rounded-2xl text-emerald-400">
                            <Sparkles className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">¡Tienes {newLeadsCount} nuevo{newLeadsCount > 1 ? 's' : ''} lead{newLeadsCount > 1 ? 's' : ''} en el Marketplace!</p>
                            <p className="text-xs text-zinc-400">Nuevos atletas están interesados en trabajar contigo. Revísalos y acéptalos en tu lista de clientes.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard/clients?tab=marketplace')}
                        className="w-full md:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-full transition-all cursor-pointer shadow-lg shadow-emerald-500/15 shrink-0"
                    >
                        Ver Solicitudes
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI INGRESOS */}
                {userRole !== 'staff' && (
                    <div
                        onClick={() => navigate('/dashboard/finance')}
                        className="glass-card p-5 rounded-2xl relative overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between gap-3.5"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider truncate">Ingresos este mes</p>
                                    <h3 className="text-3xl font-black text-white mt-0.5 tabular-nums tracking-tight">{kpi.monthlyRevenue} €</h3>
                                </div>
                            </div>
                            <span className="glass-pill text-[11px] font-medium text-emerald-400 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                                <ArrowUpRight className="w-3 h-3" /> Mes
                            </span>
                        </div>
                        <div className="kpi-bar-track">
                            <div
                                className="kpi-bar-fill bg-emerald-500"
                                style={{ width: kpi.monthlyRevenue > 0 ? '78%' : '12%' }}
                            />
                        </div>
                    </div>
                )}

                {/* KPI CLIENTES */}
                <div onClick={() => navigate('/dashboard/clients')} className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/35 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider truncate">Clientes Totales</p>
                                <h3 className="text-3xl font-black text-white mt-0.5 tabular-nums tracking-tight">{kpi.activeClients}</h3>
                            </div>
                        </div>
                        <span className="glass-pill text-[11px] font-medium text-zinc-400 px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                            Activos <ArrowUpRight className="w-3 h-3" />
                        </span>
                    </div>
                    <div className="kpi-bar-track">
                        <div
                            className="kpi-bar-fill bg-blue-500"
                            style={{ width: `${Math.min(100, Math.max(12, kpi.activeClients * 8))}%` }}
                        />
                    </div>
                </div>

                {/* KPI SESIONES HOY */}
                <div onClick={() => navigate('/dashboard/agenda')} className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/35 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider truncate">Sesiones Hoy</p>
                                <h3 className="text-3xl font-black text-white mt-0.5 tabular-nums tracking-tight">{kpi.sessionsToday}</h3>
                            </div>
                        </div>
                        <span className="glass-pill text-[11px] font-medium text-zinc-400 px-2.5 py-1 rounded-full shrink-0">Hoy</span>
                    </div>
                    <div className="kpi-bar-track">
                        <div
                            className="kpi-bar-fill bg-purple-500"
                            style={{ width: `${Math.min(100, Math.max(10, kpi.sessionsToday * 15))}%` }}
                        />
                    </div>
                </div>

                {/* KPI SESIONES MES */}
                <div onClick={() => navigate('/dashboard/agenda')} className="glass-card p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/35 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 flex flex-col justify-between gap-3.5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider truncate">Sesiones del Mes</p>
                                <h3 className="text-3xl font-black text-white mt-0.5 tabular-nums tracking-tight">{kpi.sessionsThisMonth}</h3>
                            </div>
                        </div>
                        <span className="glass-pill text-[11px] font-medium text-zinc-400 px-2.5 py-1 rounded-full shrink-0">Mes</span>
                    </div>
                    <div className="kpi-bar-track">
                        <div
                            className="kpi-bar-fill bg-emerald-500"
                            style={{ width: `${Math.min(100, Math.max(12, kpi.sessionsThisMonth * 4))}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={`grid ${userRole !== 'staff' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
                {userRole !== 'staff' && (
                    <div className="lg:col-span-2 glass-card p-6 rounded-3xl">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white tracking-tight">Evolución de Ingresos</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">Últimos 6 meses</p>
                            </div>
                            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
                                ↑ Ingresos
                            </span>
                        </div>

                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cashFlowData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradientGraph" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
                                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 4" vertical={false} stroke="currentColor" strokeOpacity={0.07} />
                                    <XAxis dataKey="month" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        formatter={(value: number) => [`${value} €`, 'Ingresos']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={2.5}
                                        fill="url(#gradientGraph)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="glass-card p-6 rounded-3xl h-full flex flex-col">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 tracking-tight">
                            <CalendarIcon className="w-5 h-5 text-purple-500" /> Agenda de Hoy
                        </h3>

                        <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-1 max-h-[300px]">
                            {todayEvents.length === 0 ? (
                                <p className="text-zinc-400 text-sm text-center py-10">No hay eventos para hoy.</p>
                            ) : (
                                todayEvents.map(event => {
                                    const date = new Date(event.date);
                                    const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                                    return (
                                        <div key={event.id} className="glass-panel p-3 rounded-2xl flex justify-between items-center hover:border-emerald-500/30 transition-colors">
                                            <div className="flex items-center gap-3">
                                                {/* Hora: pastilla oscura forzada en ambos modos */}
                                                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full agenda-time-badge tabular-nums" style={{ backgroundColor: '#18181b', color: '#ffffff' }}>
                                                    {time}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white font-bold truncate max-w-[130px]">{event.title}</p>
                                                    <p className="text-xs text-zinc-400 capitalize">{event.type}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="mt-4 text-center pt-4 border-t border-white/10">
                            <button
                                onClick={() => navigate('/dashboard/agenda')}
                                className="glass-pill px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-400 hover:text-white transition-all cursor-pointer"
                            >
                                Ver agenda completa
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


    const renderSkeleton = () => (
        <div className="p-8 w-full max-w-7xl mx-auto animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="w-full">
                    <div className="h-8 w-64 glass-card rounded-full mb-2"></div>
                    <div className="h-4 w-48 glass-card rounded-full"></div>
                </div>
                <div className="hidden md:block h-10 w-10 glass-card rounded-full"></div>
            </div>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="glass-card p-6 rounded-3xl h-[136px]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 bg-zinc-800/40 rounded-2xl"></div>
                            </div>
                            <div className="h-3 w-24 bg-zinc-800/40 rounded mt-2"></div>
                            <div className="h-8 w-16 bg-zinc-800/40 rounded mt-2"></div>
                        </div>
                    ))}
                </div>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 glass-card p-6 rounded-3xl h-[350px]"></div>
                    <div className="glass-card p-6 rounded-3xl h-[350px]"></div>
                </div>
            </div>
        </div>
    );

    if (loading) return renderSkeleton();

    if (error) return (
        <div className="h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <span className="text-red-400 text-xl">!</span>
            </div>
            <p className="text-white font-bold text-lg">Error al cargar el dashboard</p>
            <p className="text-zinc-400 text-sm max-w-sm">{error}</p>
            <button
                onClick={() => { setLoading(true); setError(null); }}
                className="mt-2 px-6 py-2.5 bg-emerald-500 text-black font-bold rounded-full hover:bg-emerald-400 transition-colors text-sm"
            >
                Reintentar
            </button>
        </div>
    );

    return (
        <div className="p-6 md:p-8 w-full max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 glass-pill px-3 py-1 rounded-full text-xs font-medium text-zinc-400 mb-3 capitalize">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Hoy · {formattedTodayLabel}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Hola, Coach</h1>
                    <p className="text-zinc-400 mt-1 text-sm">Aquí tienes el resumen de tu negocio hoy.</p>
                </div>
                <div className="flex items-center gap-3 hidden md:flex">
                    <button 
                        onClick={() => {
                            if (newLeadsCount > 0) {
                                navigate('/dashboard/clients?tab=marketplace');
                            }
                        }}
                        className="p-3 text-zinc-400 hover:text-white glass-card rounded-full transition-all relative cursor-pointer"
                        aria-label="Notificaciones"
                    >
                        <Bell className="w-5 h-5" />
                        {newLeadsCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                        )}
                        {newLeadsCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                        )}
                    </button>
                </div>
            </div>
            {renderOverview()}
        </div>
    );
};

export default Dashboard;
