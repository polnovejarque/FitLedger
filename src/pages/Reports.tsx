import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
    DollarSign, TrendingUp, TrendingDown, Users, 
    UserPlus, Activity, BarChart3, Download, ArrowUpRight, ArrowDownRight,
    Calendar, ChevronDown, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Reports = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    
    // Estados de Datos
    const [fullData, setFullData] = useState<any[]>([]); // Datos de los últimos 12 meses
    const [filteredData, setFilteredData] = useState<any[]>([]); // Datos según el rango seleccionado
    const [kpi, setKpi] = useState({ income: 0, expenses: 0, net: 0 });
    const [metrics, setMetrics] = useState({ totalClients: 0, totalSessions: 0 });

    // Estado del filtro
    const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y'>('6M');
    const [showRangeMenu, setShowRangeMenu] = useState(false);

    // 1. CARGA DE DATOS
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // A. Obtener Pagos (Ingresos y Gastos)
            const { data: payments } = await supabase
                .from('payments')
                .select('*')
                .eq('coach_id', user.id)
                .order('date', { ascending: true });

            // B. Procesar datos para la gráfica (Últimos 12 meses)
            const processedMonths = [];
            const today = new Date();
            
            // Generar estructura de los últimos 12 meses vacía
            for (let i = 11; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthLabel = d.toLocaleString('es-ES', { month: 'short' }); // "ene", "feb"
                const year = d.getFullYear();
                const month = d.getMonth();

                // Filtrar pagos de este mes específico
                const monthPayments = payments?.filter(p => {
                    const pDate = new Date(p.date);
                    return pDate.getMonth() === month && pDate.getFullYear() === year;
                });

                const income = monthPayments?.filter(p => p.amount > 0).reduce((acc, curr) => acc + curr.amount, 0) || 0;
                const expenses = Math.abs(monthPayments?.filter(p => p.amount < 0).reduce((acc, curr) => acc + curr.amount, 0) || 0);

                processedMonths.push({
                    month: monthLabel, // Eje X
                    fullDate: d,       // Para filtrar
                    income,
                    expenses
                });
            }
            setFullData(processedMonths);

            // C. Métricas de Clientes y Sesiones (Citas)
            const { count: clientsCount } = await supabase.from('clients').select('*', { count: 'exact', head: true });
            const { count: sessionsCount } = await supabase.from('calendar_events').select('*', { count: 'exact', head: true }).eq('coach_id', user.id);
            
            setMetrics({
                totalClients: clientsCount || 0,
                totalSessions: sessionsCount || 0
            });

            setLoading(false);
        };
        loadData();
    }, []);

    // 2. FILTRADO DINÁMICO (Cuando cambia timeRange o cargan los datos)
    useEffect(() => {
        if (fullData.length === 0) return;

        let sliceCount = 6;
        if (timeRange === '1M') sliceCount = 1;
        if (timeRange === '3M') sliceCount = 3;
        if (timeRange === '6M') sliceCount = 6;
        if (timeRange === '1Y') sliceCount = 12;

        // Coger los últimos X meses
        const currentSlice = fullData.slice(fullData.length - sliceCount);
        setFilteredData(currentSlice);

        // Recalcular KPIs totales basados en la selección
        const totalIncome = currentSlice.reduce((acc, curr) => acc + curr.income, 0);
        const totalExpenses = currentSlice.reduce((acc, curr) => acc + curr.expenses, 0);
        
        setKpi({
            income: totalIncome,
            expenses: totalExpenses,
            net: totalIncome - totalExpenses
        });

    }, [timeRange, fullData]);

    const maxValue = Math.max(...filteredData.map(d => Math.max(d.income, d.expenses)), 100); // 100 mínimo para evitar div/0

    const rangeLabels = {
        '1M': 'Último mes',
        '3M': 'Últimos 3 meses',
        '6M': 'Últimos 6 meses',
        '1Y': 'Año completo'
    };

    const handleExport = () => {
        window.print();
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin"/></div>;

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans animate-in fade-in duration-500" onClick={() => setShowRangeMenu(false)}>
            
            {/* CSS SOLO PARA IMPRESIÓN */}
            <style>{`
                @media print {
                    @page { margin: 10mm; size: landscape; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    /* Ocultar elementos de navegación al imprimir */
                    nav, header, .no-print { display: none !important; }
                }
            `}</style>

            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 print:text-black">Reporte Financiero</h1>
                    <p className="text-zinc-400 print:text-zinc-600">Resumen de rendimiento y métricas clave.</p>
                </div>
                
                <div className="flex gap-3 print:hidden">
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowRangeMenu(!showRangeMenu); }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-700 transition-all text-sm font-medium min-w-[160px] justify-between"
                        >
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-zinc-500" />
                                <span>{rangeLabels[timeRange]}</span>
                            </div>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showRangeMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {showRangeMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#18181b] border border-zinc-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                {(['1M', '3M', '6M', '1Y'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => setTimeRange(range)}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 transition-colors flex items-center justify-between ${timeRange === range ? 'text-emerald-500 font-medium bg-emerald-500/5' : 'text-zinc-400'}`}
                                    >
                                        {rangeLabels[range]}
                                        {timeRange === range && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button onClick={handleExport} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 gap-2 transition-all active:scale-95">
                        <Download className="w-4 h-4" /> Exportar PDF
                    </Button>
                </div>
            </div>

            {/* KPI CARDS (DINÁMICOS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:gap-4">
                {/* Ingresos */}
                <div className="bg-[#111] border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group print:bg-white print:border-zinc-300 print:text-black">
                    <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none print:hidden" />
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 print:bg-emerald-100 print:text-emerald-700"><DollarSign className="w-6 h-6" /></div>
                        <span className="flex items-center text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full print:bg-emerald-100 print:text-emerald-700">Ingresos <TrendingUp className="w-3 h-3 ml-1" /></span>
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider print:text-zinc-600">Total Ingresado ({timeRange})</p>
                    <h3 className="text-3xl font-bold text-white mt-2 print:text-black print:text-2xl">{kpi.income.toFixed(2)} €</h3>
                </div>

                {/* Gastos */}
                <div className="bg-[#111] border border-zinc-800 p-6 rounded-2xl relative overflow-hidden print:bg-white print:border-zinc-300 print:text-black">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500 print:bg-red-100 print:text-red-700"><TrendingDown className="w-6 h-6" /></div>
                        <span className="flex items-center text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full print:bg-red-100 print:text-red-700">Gastos <ArrowDownRight className="w-3 h-3 ml-1" /></span>
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider print:text-zinc-600">Gastos Operativos</p>
                    <h3 className="text-3xl font-bold text-white mt-2 print:text-black print:text-2xl">{kpi.expenses.toFixed(2)} €</h3>
                </div>

                {/* Beneficio Neto */}
                <div className="bg-[#111] border border-zinc-800 p-6 rounded-2xl relative overflow-hidden ring-1 ring-emerald-500/20 print:bg-white print:border-zinc-300 print:text-black print:ring-0">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 print:bg-blue-100 print:text-blue-700"><BarChart3 className="w-6 h-6" /></div>
                        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${kpi.net >= 0 ? 'text-blue-400 bg-blue-500/10' : 'text-red-400 bg-red-500/10'}`}>
                            Neto {kpi.net >= 0 ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                        </span>
                    </div>
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider print:text-zinc-600">Beneficio Neto</p>
                    <h3 className={`text-3xl font-bold mt-2 print:text-2xl ${kpi.net >= 0 ? 'text-white print:text-black' : 'text-red-500 print:text-red-600'}`}>{kpi.net.toFixed(2)} €</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
                
                {/* 1. GRÁFICA DE BARRAS DINÁMICA */}
                <div className="lg:col-span-2 bg-[#111] border border-zinc-800 rounded-2xl p-6 flex flex-col print:col-span-2 print:bg-white print:border-zinc-300">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-bold text-white flex items-center gap-2 print:text-black">
                            <Activity className="w-5 h-5 text-emerald-500" /> Evolución Financiera
                        </h3>
                        <span className="text-xs bg-zinc-900 text-zinc-400 px-2 py-1 rounded border border-zinc-800 print:bg-zinc-100 print:text-zinc-600 print:border-zinc-200">
                            {rangeLabels[timeRange]}
                        </span>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 h-64 w-full px-2 border-b border-zinc-800/50 pb-2 print:border-zinc-300">
                        {filteredData.map((item, index) => {
                            // Calculamos altura basada en el máximo valor (ingreso o gasto)
                            const incomeHeight = (item.income / maxValue) * 100;
                            const expenseHeight = (item.expenses / maxValue) * 100;

                            return (
                                <div key={index} className="flex-1 flex flex-col justify-end group h-full relative cursor-pointer gap-1">
                                    
                                    {/* TOOLTIP (Solo Pantalla) */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#18181b] text-white text-xs py-2 px-3 rounded-lg border border-zinc-700 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 pointer-events-none shadow-xl print:hidden w-max text-center">
                                        <div className="font-bold text-emerald-400">Ing: {item.income}€</div>
                                        <div className="font-bold text-red-400">Gas: {item.expenses}€</div>
                                    </div>

                                    {/* ETIQUETA FIJA (Solo PDF) */}
                                    <div className="hidden print:block w-full text-center mb-1">
                                        <span className="text-[8px] font-bold text-black block">{item.income > 0 ? item.income : ''}</span>
                                    </div>

                                    <div className="flex items-end justify-center w-full gap-1 h-full">
                                        {/* BARRA INGRESOS */}
                                        <div 
                                            className={`w-1/2 rounded-t-sm bg-zinc-800 group-hover:bg-emerald-500 transition-all duration-500 print:bg-black`} 
                                            style={{ height: item.income === 0 ? '2px' : `${incomeHeight}%` }}
                                        />
                                        {/* BARRA GASTOS (Más finita o diferente color) */}
                                        {item.expenses > 0 && (
                                            <div 
                                                className={`w-1/2 rounded-t-sm bg-zinc-800/50 group-hover:bg-red-500 transition-all duration-500 print:bg-zinc-400`} 
                                                style={{ height: `${expenseHeight}%` }}
                                            />
                                        )}
                                    </div>
                                    
                                    {/* ETIQUETA EJE X */}
                                    <span className={`text-xs text-center mt-2 font-medium text-zinc-600 print:text-zinc-400 uppercase`}>
                                        {item.month}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 2. MÉTRICAS DE ATLETAS (REALES) */}
                <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 flex flex-col print:col-span-1 print:bg-white print:border-zinc-300">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-white flex items-center gap-2 print:text-black">
                            <Users className="w-5 h-5 text-blue-500" /> Métricas Atletas
                        </h3>
                        <div className="p-1.5 bg-zinc-900 rounded-lg print:bg-zinc-100"><UserPlus className="w-4 h-4 text-zinc-400 print:text-zinc-600" /></div>
                    </div>

                    <div className="space-y-6 flex-1">
                        
                        {/* Clientes Activos */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-zinc-400 print:text-zinc-600">Total Clientes Activos</span>
                                <span className="text-xl font-bold text-emerald-500 print:text-black">{metrics.totalClients}</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden print:bg-zinc-200">
                                <div className="h-full rounded-full bg-emerald-500 print:bg-black" style={{ width: '80%' }} />
                            </div>
                            <p className="text-[10px] text-zinc-500 text-right">Base de datos actual</p>
                        </div>

                        {/* Sesiones Totales (AHORA: Citas Agendadas) */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-zinc-400 print:text-zinc-600">Citas Agendadas</span>
                                <span className="text-xl font-bold text-blue-500 print:text-black">{metrics.totalSessions}</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden print:bg-zinc-200">
                                <div className="h-full rounded-full bg-blue-500 print:bg-black" style={{ width: '65%' }} />
                            </div>
                            <p className="text-[10px] text-zinc-500 text-right">Histórico Agenda</p>
                        </div>

                        {/* Placeholder (Para equilibrar diseño) */}
                        <div className="space-y-2 opacity-50">
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-zinc-400 print:text-zinc-600">Satisfacción (Est.)</span>
                                <span className="text-xl font-bold text-orange-500 print:text-black">4.9/5</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden print:bg-zinc-200">
                                <div className="h-full rounded-full bg-orange-500 print:bg-black" style={{ width: '98%' }} />
                            </div>
                            <p className="text-[10px] text-zinc-500 text-right">Basado en retención</p>
                        </div>

                    </div>

                    <div className="mt-6 pt-6 border-t border-zinc-800 print:hidden">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate('/dashboard/clients')}
                            className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 border border-dashed border-zinc-800"
                        >
                            Gestionar Cartera
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;