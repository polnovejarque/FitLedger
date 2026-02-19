import { useNavigate } from 'react-router-dom';
import { 
    CheckCircle2, ArrowRight, BarChart3, 
    Calendar, Users, Check, X, LayoutDashboard, Dumbbell, UserPlus,
    Star, HelpCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-black">
            
            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="FitLeader Logo" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight">FitLeader</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                        <a href="#features" className="hover:text-white transition-colors">Características</a>
                        <a href="#comparison" className="hover:text-white transition-colors">Método</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
                        <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/dashboard')} className="text-sm font-bold text-white hover:text-emerald-400 transition-colors px-4 py-2">
                            Login
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full -z-10 opacity-60 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Texto Hero */}
                    <div className="text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-emerald-400 mb-6">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            v2.0 Disponible: Automatiza tu negocio
                        </div>
                        
                        <h1 className="text-5xl md:text-6xl font-black text-white leading-[1.1] mb-6">
                            Tu Negocio Fitness <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">en Automático.</span>
                        </h1>
                        
                        <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-lg">
                            Olvida el Excel. Gestiona clientes, pagos y rutinas con tu App Premium para atletas. Todo tu negocio fitness en un solo lugar.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                                onClick={() => navigate('/dashboard')} 
                                className="h-14 px-8 text-lg bg-emerald-500 text-black hover:bg-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                            >
                                Empezar Ahora
                            </Button>
                            
                            <Button 
                                variant="outline" 
                                onClick={() => navigate('/client-app')} 
                                className="h-14 px-8 text-lg border-zinc-700 text-white hover:bg-white/5 transition-all"
                            >
                                Acceso Atletas
                            </Button>
                        </div>
                        <p className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Cancela cuando quieras, sin compromiso.
                        </p>
                    </div>

                    {/* --- DASHBOARD VISUAL (MOCKUP) --- */}
                    <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 mt-10 lg:mt-0 select-none pointer-events-none">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-20 animate-pulse"></div>
                        
                        <div className="relative bg-[#09090b] rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden aspect-video flex">
                            
                            {/* Sidebar Mockup */}
                            <div className="w-1/4 border-r border-zinc-800 bg-[#0c0c0e] p-4 flex flex-col gap-6 hidden sm:flex">
                                <div className="flex items-center gap-2 font-bold">
                                    <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" /> 
                                    <span className="text-white text-sm">FitLeader</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-800/80 rounded-lg text-xs font-medium text-white border-l-2 border-emerald-500">
                                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                                    </div>
                                    <div className="flex items-center gap-3 px-3 py-2 text-zinc-500 text-xs font-medium">
                                        <Users className="w-4 h-4" /> Clientes
                                    </div>
                                    <div className="flex items-center gap-3 px-3 py-2 text-zinc-500 text-xs font-medium">
                                        <Dumbbell className="w-4 h-4" /> Entrenamientos
                                    </div>
                                    <div className="flex items-center gap-3 px-3 py-2 text-zinc-500 text-xs font-medium">
                                        <Calendar className="w-4 h-4" /> Agenda
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Mockup */}
                            <div className="flex-1 p-6 flex flex-col gap-6 bg-[#09090b]">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold text-white">Dashboard</h3>
                                    <div className="px-3 py-1 bg-zinc-800 rounded text-[10px] text-zinc-400 border border-zinc-700">Nueva Sesión</div>
                                </div>

                                {/* KPI CARDS */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-[#111] p-3 rounded-xl border border-zinc-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] text-zinc-500">$</span>
                                            <span className="text-[10px] text-emerald-500 flex items-center">+20% <ArrowRight className="w-2 h-2 -rotate-45" /></span>
                                        </div>
                                        <div className="text-[10px] text-zinc-400">Ingresos Recurrentes</div>
                                        <div className="text-sm font-bold text-white">$12,450</div>
                                    </div>
                                    <div className="bg-[#111] p-3 rounded-xl border border-zinc-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <UserPlus className="w-3 h-3 text-zinc-500" />
                                            <span className="text-[10px] text-emerald-500 flex items-center">+3 <ArrowRight className="w-2 h-2 -rotate-45" /></span>
                                        </div>
                                        <div className="text-[10px] text-zinc-400">Clientes Activos</div>
                                        <div className="text-sm font-bold text-white">45</div>
                                    </div>
                                    <div className="bg-[#111] p-3 rounded-xl border border-zinc-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <BarChart3 className="w-3 h-3 text-zinc-500" />
                                            <span className="text-[10px] text-emerald-500 flex items-center">+8% <ArrowRight className="w-2 h-2 -rotate-45" /></span>
                                        </div>
                                        <div className="text-[10px] text-zinc-400">Sesiones</div>
                                        <div className="text-sm font-bold text-white">128</div>
                                    </div>
                                </div>

                                {/* Graph Area */}
                                <div className="flex-1 bg-[#111] rounded-xl border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-end">
                                    <div className="absolute top-4 left-4">
                                        <p className="text-xs font-bold text-white">Flujo de Caja</p>
                                        <p className="text-[10px] text-zinc-500">Últimos 6 meses</p>
                                    </div>
                                    {/* Fake Graph Line */}
                                    <div className="w-full h-16 flex items-end gap-1">
                                        <div className="flex-1 bg-gradient-to-t from-zinc-800/50 to-transparent h-[40%] rounded-t-sm"></div>
                                        <div className="flex-1 bg-gradient-to-t from-zinc-800/50 to-transparent h-[60%] rounded-t-sm"></div>
                                        <div className="flex-1 bg-gradient-to-t from-zinc-800/50 to-transparent h-[50%] rounded-t-sm"></div>
                                        <div className="flex-1 bg-gradient-to-t from-zinc-800/50 to-transparent h-[70%] rounded-t-sm"></div>
                                        <div className="flex-1 bg-gradient-to-t from-zinc-800/50 to-transparent h-[85%] rounded-t-sm border-t-2 border-emerald-500/50"></div>
                                        <div className="flex-1 bg-gradient-to-t from-emerald-500/20 to-transparent h-[100%] rounded-t-sm border-t-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="features" className="py-24 bg-zinc-950/50 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Tu Software Fitness Pro.</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">Herramientas potentes diseñadas específicamente para entrenadores personales y estudios boutique.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* 1. Control Financiero */}
                        <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all group">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-zinc-700">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Control Financiero Total</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Registra ingresos, gastos y suscripciones. Visualiza tu flujo de caja en tiempo real y nunca pierdas de vista tus márgenes.</p>
                        </div>

                        {/* 2. Gestión de Clientes */}
                        <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all group">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-zinc-700">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Gestión de Clientes</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Perfiles de atletas, fotos de progreso e historial de entrenos. El seguimiento más completo en un solo software pro.
                            </p>
                        </div>

                        {/* 3. Agenda Inteligente */}
                        <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 hover:bg-zinc-900/50 transition-all group">
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-zinc-700">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Agenda Inteligente</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Gestiona tus sesiones y clases grupales. Evita solapamientos con nuestro sistema de reservas y agenda inteligente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- COMPARACIÓN --- */}
            <section id="comparison" className="py-24 bg-black relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-full bg-emerald-900/10 blur-[100px] rounded-full -z-10" />
                
                <div className="max-w-5xl mx-auto px-6">
                    <h2 className="text-3xl md:text-5xl font-black text-center mb-16">¿Tus asesorías son un caos?</h2>
                    
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-zinc-900/30 border border-red-900/20 p-8 rounded-3xl relative overflow-hidden">
                            <h3 className="text-xl font-bold text-zinc-400 mb-6 flex items-center gap-2">Lo de siempre</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-zinc-400">
                                    <div className="mt-1 bg-red-500/10 p-1 rounded"><X className="w-4 h-4 text-red-500" /></div>
                                    <span>Excels infinitos que se rompen</span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-400">
                                    <div className="mt-1 bg-red-500/10 p-1 rounded"><X className="w-4 h-4 text-red-500" /></div>
                                    <span>Notas de clientes perdidas en WhatsApp</span>
                                </li>
                                <li className="flex items-start gap-3 text-zinc-400">
                                    <div className="mt-1 bg-red-500/10 p-1 rounded"><X className="w-4 h-4 text-red-500" /></div>
                                    <span>¿Quién me ha pagado?</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-3xl relative overflow-hidden shadow-2xl shadow-emerald-900/20">
                            <div className="absolute top-4 right-4 text-xs font-bold bg-emerald-500 text-black px-2 py-1 rounded">Recomendado</div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">El Método FitLeader</h3>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 text-white">
                                    <div className="mt-1 bg-emerald-500 p-1 rounded"><Check className="w-4 h-4 text-black" /></div>
                                    <span>Panel de Control centralizado</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <div className="mt-1 bg-emerald-500 p-1 rounded"><Check className="w-4 h-4 text-black" /></div>
                                    <span>Fichas de clientes con historial</span>
                                </li>
                                <li className="flex items-start gap-3 text-white">
                                    <div className="mt-1 bg-emerald-500 p-1 rounded"><Check className="w-4 h-4 text-black" /></div>
                                    <span>Automatización de cobros (Stripe)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIOS --- */}
            <section className="py-24 bg-zinc-950 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Lo que dicen los entrenadores</h2>
                        <p className="text-zinc-400">Más de 500 entrenadores ya han automatizado su negocio.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Review 1 */}
                        <div className="p-6 bg-[#111] rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
                            <div className="flex gap-1 mb-4 text-emerald-500">
                                <Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" />
                            </div>
                            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">"Desde que uso FitLeader ahorro unas 10 horas a la semana. Antes todo era un caos de Excels y PDFs. Ahora mis clientes tienen su app y yo tengo paz mental."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">CR</div>
                                <div>
                                    <p className="text-white text-sm font-bold">Carlos Rodríguez</p>
                                    <p className="text-zinc-500 text-xs">Entrenador Personal</p>
                                </div>
                            </div>
                        </div>
                        {/* Review 2 */}
                        <div className="p-6 bg-[#111] rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
                            <div className="flex gap-1 mb-4 text-emerald-500">
                                <Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" />
                            </div>
                            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">"A mis clientes les encanta la app. Ver su progreso gráfico y tener los vídeos de los ejercicios a mano ha mejorado muchísimo su adherencia. Imprescindible."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">SM</div>
                                <div>
                                    <p className="text-white text-sm font-bold">Sofía Martínez</p>
                                    <p className="text-zinc-500 text-xs">Coach Online</p>
                                </div>
                            </div>
                        </div>
                        {/* Review 3 */}
                        <div className="p-6 bg-[#111] rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all">
                            <div className="flex gap-1 mb-4 text-emerald-500">
                                <Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" /><Star className="w-4 h-4 fill-emerald-500" />
                            </div>
                            <p className="text-zinc-300 text-sm mb-6 leading-relaxed">"La mejor inversión para mi estudio. La gestión de pagos automatizada me ha quitado un peso enorme de encima. Muy intuitivo y el soporte es de 10."</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white">JT</div>
                                <div>
                                    <p className="text-white text-sm font-bold">Javier Torres</p>
                                    <p className="text-zinc-500 text-xs">Dueño de Box</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRICING SECTION --- */}
            <section id="pricing" className="py-24 relative border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Planes simples y transparentes</h2>
                        <p className="text-zinc-400">Escala tu negocio sin costes ocultos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        
                        {/* PROFESIONAL */}
                        <div className="p-8 rounded-3xl border border-emerald-500 bg-zinc-900/50 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-emerald-500/10">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">Más Popular</div>
                            <h3 className="text-xl font-bold text-emerald-400 mb-2">Profesional</h3>
                            <div className="mb-6">
                                <span className="text-5xl font-bold text-white">29,99€</span>
                                <span className="text-zinc-400">/mes</span>
                            </div>
                            <p className="text-zinc-300 text-sm mb-8">Para entrenadores que viven de ello.</p>
                            
                            <Button onClick={() => navigate('/dashboard')} className="w-full mb-8 bg-emerald-500 text-black hover:bg-emerald-400 font-bold h-12 shadow-lg shadow-emerald-500/20">
                                Empezar prueba de 14 días
                            </Button>
                            
                            <div className="space-y-4 flex-1">
                                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> <strong>Clientes Ilimitados</strong></li>
                                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Rutinas Avanzadas + Vídeos</li>
                                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Reportes Financieros</li>
                                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Pagos Stripe Integrados</li>
                                <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Marca Personalizada (Logo)</li>
                            </div>
                        </div>

                        {/* PREMIUM */}
                        <div className="p-8 rounded-3xl border border-zinc-800 bg-black flex flex-col opacity-60">
                            <h3 className="text-xl font-bold text-purple-400 mb-2">Premium</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">Prox.</span>
                            </div>
                            <p className="text-zinc-400 text-sm mb-8">Para gimnasios y grandes equipos.</p>
                            <Button disabled variant="outline" className="w-full mb-8 border-zinc-800 text-zinc-500 cursor-not-allowed">
                                Próximamente
                            </Button>
                            <div className="space-y-4 flex-1">
                                <li className="flex items-center gap-3 text-sm text-zinc-500"><CheckCircle2 className="w-4 h-4 text-zinc-700" /> Múltiples entrenadores</li>
                                <li className="flex items-center gap-3 text-sm text-zinc-500"><CheckCircle2 className="w-4 h-4 text-zinc-700" /> Web propia integrada</li>
                                <li className="flex items-center gap-3 text-sm text-zinc-500"><CheckCircle2 className="w-4 h-4 text-zinc-700" /> API Access</li>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section id="faq" className="py-24 bg-zinc-950 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
                        <p className="text-zinc-400">Resolvemos tus dudas antes de empezar.</p>
                    </div>
                    <div className="grid gap-4">
                        <div className="p-6 bg-[#111] border border-zinc-800 rounded-2xl">
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-emerald-500"/> ¿Es difícil pasar mis datos de Excel a FitLeader?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Para nada. Nuestra interfaz es muy intuitiva y está diseñada para que puedas crear clientes y rutinas en segundos. Olvídate de fórmulas complicadas.</p>
                        </div>
                        <div className="p-6 bg-[#111] border border-zinc-800 rounded-2xl">
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-emerald-500"/> ¿La App para el cliente tiene coste extra?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">No, está incluida en tu suscripción. Tus clientes pueden descargarla y usarla gratis para ver sus rutinas y registrar sus marcas.</p>
                        </div>
                        <div className="p-6 bg-[#111] border border-zinc-800 rounded-2xl">
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-emerald-500"/> ¿Hay permanencia?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Ninguna. Eres libre de cancelar tu suscripción en cualquier momento desde tu panel de configuración.</p>
                        </div>
                        <div className="p-6 bg-[#111] border border-zinc-800 rounded-2xl">
                            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-emerald-500"/> ¿Sirve para entrenadores online y presenciales?</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">Sí, FitLeader está diseñado para modelos híbridos. Puedes gestionar tanto clientes a distancia como sesiones presenciales en tu gimnasio.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="py-24 bg-gradient-to-b from-black to-emerald-950/30 border-t border-white/5">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6">¿Listo para profesionalizarte?</h2>
                    <p className="text-xl text-zinc-400 mb-10">Únete a los entrenadores que ya están escalando su negocio con FitLeader.</p>
                    <Button 
                        onClick={() => navigate('/dashboard')}
                        className="h-16 px-10 text-xl bg-white text-black hover:bg-zinc-200 font-bold rounded-full shadow-[0_0_50px_rgba(255,255,255,0.2)] active:scale-95 transition-all"
                    >
                        Crear Cuenta Gratis <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                    <p className="mt-6 text-sm text-zinc-500">No se requiere tarjeta de crédito • Cancelación en cualquier momento</p>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 border-t border-white/10 bg-black text-zinc-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        {/* LOGO FOOTER */}
                        <img src="/logo.png" alt="FitLeader Logo" className="w-6 h-6 object-contain" />
                        <span className="font-bold text-white">FitLeader</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition-colors">Términos</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Soporte</a>
                    </div>
                    <p>© 2025 FitLeader Inc. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Landing;