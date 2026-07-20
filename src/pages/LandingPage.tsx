import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
    CheckCircle2, ArrowRight, Users, Dumbbell, 
    DollarSign, Check, X, Menu, ChevronDown,
    Sparkles, ArrowLeft, Globe, LayoutDashboard,
    MoreVertical, Home, Flame, Calendar, Trophy, 
    TrendingUp, Camera, User, MessageSquare, Plus, 
    ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';


const faqs = [
    {
        q: '¿Es difícil pasar mis datos de Excel a FitLeader?',
        a: 'Para nada. Nuestra interfaz es muy intuitiva y está diseñada para que puedas crear clientes y rutinas en segundos. Olvídate de fórmulas complicadas.'
    },
    {
        q: '¿La App para el cliente tiene coste extra?',
        a: 'No, está incluida en tu suscripción. Tus clientes pueden descargarla y usarla gratis para ver sus rutinas, registrar sus marcas y hacer seguimiento de su progreso.'
    },
    {
        q: '¿Hay permanencia?',
        a: 'Ninguna. Eres libre de cancelar tu suscripción en cualquier momento desde tu panel de configuración. Sin llamadas, sin formularios.'
    },
    {
        q: '¿Sirve para entrenadores online y presenciales?',
        a: 'Sí, FitLeader está diseñado para modelos híbridos. Puedes gestionar tanto clientes a distancia como sesiones presenciales en tu gimnasio.'
    },
    {
        q: '¿Puedo probar FitLeader antes de pagar?',
        a: 'Sí. Tienes 14 días de prueba gratuita con todas las funciones activas. No se requiere tarjeta de crédito para empezar.'
    },
    {
        q: '¿Mis datos están seguros?',
        a: 'Completamente. Toda la información se almacena cifrada en servidores europeos certificados y nunca compartimos tus datos ni los de tus clientes con terceros.'
    },
];

const Landing = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentProduct = searchParams.get('product') || 'gateway';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [hoveredGate, setHoveredGate] = useState<'saas' | 'marketplace' | null>(null);
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(0);
    const [activePhoneTab, setActivePhoneTab] = useState<'inicio' | 'rutina' | 'racha' | 'progreso'>('inicio');

    // Enlace a Calendly para agendar llamadas
    const handleDemoClick = () => {
        window.open('https://calendly.com/fitleader', '_blank');
    };

    // Scroll al cambiar de vista
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentProduct]);

    const setProductView = (view: 'gateway' | 'saas' | 'marketplace') => {
        if (view === 'gateway') {
            setSearchParams({});
        } else {
            setSearchParams({ product: view });
        }
    };



    return (
        <div className="min-h-screen bg-[#0c0c0c] text-white font-sans selection:bg-emerald-500/30 selection:text-white overflow-x-hidden relative">
            
            {/* --- GLOBAL SVG NOISE FILTER --- */}
            <svg className="hidden">
                <defs>
                    <filter id="c3-noise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
                        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0" />
                        <feComposite in2="SourceGraphic" operator="in" result="noise" />
                        <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
                    </filter>
                </defs>
            </svg>

            {/* --- FIXED FULLSCREEN CINEMATIC BACKGROUND VIDEO --- */}
            {(currentProduct === 'saas' || currentProduct === 'marketplace') && (
                <>
                    <div className="fixed inset-0 z-0 pointer-events-none opacity-30" style={{ filter: 'hue-rotate(140deg) saturate(1.4)' }}>
                        <video autoPlay loop muted playsInline
                            className="w-full h-full object-cover pointer-events-none"
                            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4" />
                    </div>
                </>
            )}

            {/* --- FONDO GLOW GENÉRICO PARA EL PORTAL --- */}
            {currentProduct === 'gateway' && (
                <>
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-950/10 blur-[150px] rounded-full pointer-events-none -z-10" />
                    <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-blue-950/10 blur-[150px] rounded-full pointer-events-none -z-10" />
                </>
            )}

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div 
                        onClick={() => setProductView('gateway')}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <img src="/logo.png" alt="FitLeader Logo" className="w-8 h-8 object-contain group-hover:rotate-12 transition-transform duration-300" />
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">FitLeader</span>
                    </div>
                    
                    {/* Links desktop según vista */}
                    {currentProduct === 'gateway' && (
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                            <button onClick={() => setProductView('saas')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Software SaaS</button>
                            <button onClick={() => setProductView('marketplace')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none">Marketplace B2C & B2B</button>
                        </div>
                    )}

                    {currentProduct === 'saas' && (
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                            <a href="#plataforma" className="hover:text-white transition-colors">Plataforma</a>
                            <a href="#atletas" className="hover:text-white transition-colors">App Atleta</a>
                            <a href="#comparison" className="hover:text-white transition-colors">Método</a>
                            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
                            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                            <button onClick={() => setProductView('marketplace')} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer bg-transparent border-none">Ver Marketplace →</button>
                        </div>
                    )}

                    {currentProduct === 'marketplace' && (
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                            <a href="#mkt-coaches" className="hover:text-white transition-colors">Para Coaches</a>
                            <a href="#mkt-centers" className="hover:text-white transition-colors">Para Centros</a>
                            <a href="#mkt-rates" className="hover:text-white transition-colors">Tarifas</a>
                            <button onClick={() => setProductView('saas')} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer bg-transparent border-none">Ver Software SaaS →</button>
                        </div>
                    )}

                    {/* Acciones desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <button onClick={() => navigate('/client-app')} className="text-sm font-medium text-zinc-400 hover:text-emerald-400 transition-colors px-4 py-2 cursor-pointer bg-transparent border-none">
                            Acceso Atleta
                        </button>
                        <button onClick={() => navigate('/auth')} className="text-sm font-bold text-white hover:text-emerald-400 transition-colors px-4 py-2 cursor-pointer bg-transparent border-none">
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={handleDemoClick}
                            className="btn-apple-pill btn-apple-pill-green shadow-[0_0_20px_rgba(16,185,129,0.3)] !py-2 !px-5 !text-xs"
                        >
                            Solicitar Demo
                        </button>
                    </div>

                    {/* Hamburger móvil */}
                    <button
                        className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Abrir menú"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Menú móvil desplegable */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-black/95 border-t border-white/5 px-6 py-6 flex flex-col gap-4">
                        {currentProduct === 'gateway' ? (
                            <>
                                <button onClick={() => { setMobileMenuOpen(false); setProductView('saas'); }} className="text-left text-base font-medium text-zinc-300 hover:text-white transition-colors py-2 bg-transparent border-none">Software SaaS</button>
                                <button onClick={() => { setMobileMenuOpen(false); setProductView('marketplace'); }} className="text-left text-base font-medium text-zinc-300 hover:text-white transition-colors py-2 bg-transparent border-none">Marketplace B2C & B2B</button>
                            </>
                        ) : currentProduct === 'saas' ? (
                            <>
                                <a href="#plataforma" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">Plataforma</a>
                                <a href="#atletas" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">App Atleta</a>
                                <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">Método</a>
                                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">Precios</a>
                                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">FAQ</a>
                                <button onClick={() => { setMobileMenuOpen(false); setProductView('marketplace'); }} className="text-left text-base font-bold text-emerald-400 hover:text-white transition-colors py-2 bg-transparent border-none">Marketplace →</button>
                            </>
                        ) : (
                            <>
                                <a href="#mkt-coaches" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">Para Coaches</a>
                                <a href="#mkt-centers" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">Para Centros</a>
                                <a href="#mkt-rates" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-zinc-300 hover:text-white transition-colors py-2">Tarifas</a>
                                <button onClick={() => { setMobileMenuOpen(false); setProductView('saas'); }} className="text-left text-base font-bold text-emerald-400 hover:text-white transition-colors py-2 bg-transparent border-none">Software SaaS →</button>
                            </>
                        )}
                        <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/client-app'); }} className="w-full text-sm font-bold text-zinc-400 border border-zinc-800 rounded-lg px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer bg-transparent">
                                Acceso Atleta
                            </button>
                            <button onClick={() => { setMobileMenuOpen(false); navigate('/auth'); }} className="w-full text-sm font-bold text-white border border-zinc-800 rounded-lg px-4 py-3 hover:bg-white/5 transition-colors cursor-pointer bg-transparent">
                                Iniciar Sesión (Coach)
                            </button>
                            <button onClick={() => { setMobileMenuOpen(false); handleDemoClick(); }} className="w-full text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg px-4 py-3 transition-colors cursor-pointer border-none">
                                Solicitar Demo
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* --- CONTENIDO DINÁMICO --- */}
            <div className="pt-20">
                <AnimatePresence mode="wait">
                    {currentProduct === 'gateway' && (
                        <motion.div 
                            key="gateway"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="min-h-[calc(100vh-80px)] flex flex-col lg:flex-row relative overflow-hidden"
                        >
                            {/* SECCIÓN IZQUIERDA: SAAS GESTIÓN (Verde con degradado) */}
                            <div 
                                onMouseEnter={() => setHoveredGate('saas')}
                                onMouseLeave={() => setHoveredGate(null)}
                                onClick={() => setProductView('saas')}
                                className={`flex-1 min-h-[50vh] lg:min-h-0 flex flex-col justify-between p-8 lg:p-16 cursor-pointer relative overflow-hidden transition-all duration-500 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-950 group ${
                                    hoveredGate === 'saas' ? 'lg:flex-[1.5]' : hoveredGate === 'marketplace' ? 'lg:flex-[0.5] opacity-50' : ''
                                }`}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent)] pointer-events-none" />
                                
                                {/* Texto de fondo gigantesco tipo EMBER de la imagen */}
                                <div className="absolute top-10 left-10 text-white/5 text-7xl lg:text-9xl font-black uppercase tracking-tighter select-none pointer-events-none font-sans">
                                    SOFTWARE
                                </div>

                                <div className="mt-28 lg:mt-40 relative z-10 space-y-6 max-w-xl">
                                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">SaaS de Gestión</span>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none uppercase">
                                        FitLeader <br/><span className="text-emerald-350">SaaS</span>
                                    </h2>
                                    <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md">
                                        Planifica entrenamientos y dietas, gestiona clientes en tu app y automatiza cobros de forma profesional.
                                    </p>
                                </div>

                                <div className="mt-8 relative z-10 flex items-center gap-2 font-bold text-white text-sm">
                                    <span>EXPLORAR SOFTWARE</span>
                                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>

                            {/* SECCIÓN DERECHA: MARKETPLACE B2C/B2B (Darkmode) */}
                            <div 
                                onMouseEnter={() => setHoveredGate('marketplace')}
                                onMouseLeave={() => setHoveredGate(null)}
                                onClick={() => setProductView('marketplace')}
                                className={`flex-1 min-h-[50vh] lg:min-h-0 flex flex-col justify-between p-8 lg:p-16 cursor-pointer relative overflow-hidden transition-all duration-500 bg-[#060608] group ${
                                    hoveredGate === 'marketplace' ? 'lg:flex-[1.5]' : hoveredGate === 'saas' ? 'lg:flex-[0.5] opacity-50' : ''
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                                
                                {/* Texto de fondo gigantesco tipo STUDIO de la imagen */}
                                <div className="absolute top-10 left-10 text-white/5 text-7xl lg:text-9xl font-black uppercase tracking-tighter select-none pointer-events-none font-sans">
                                    MARKET
                                </div>

                                <div className="mt-28 lg:mt-40 relative z-10 space-y-6 max-w-xl">
                                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Directorio B2C/B2B</span>
                                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-none uppercase">
                                        FitLeader <br/><span className="text-blue-400">Market</span>
                                    </h2>
                                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
                                        Consigue clientes en nuestro buscador público de entrenadores o alquila salas equipadas por horas de forma flexible.
                                    </p>
                                </div>

                                <div className="mt-8 relative z-10 flex items-center gap-2 font-bold text-white text-sm">
                                    <span className="group-hover:text-blue-400 transition-colors">ENTRAR AL MARKETPLACE</span>
                                    <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* VISTA PRODUCTO: SAAS GESTIÓN */}
                    {currentProduct === 'saas' && (
                        <motion.div 
                            key="saas"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Botón Volver */}
                            <div className="max-w-7xl mx-auto px-6 pt-8 z-10 relative">
                                <button 
                                    onClick={() => setProductView('gateway')}
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Volver al portal
                                </button>
                            </div>

                            {/* --- HERO SAAS --- */}
                            <header className="relative pt-12 pb-16 px-6 text-center overflow-hidden z-10">
                                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-950/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-widest">
                                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Software de Gestión Fitness
                                    </span>
                                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none uppercase select-none">
                                        Tu negocio fitness, <br />
                                        <span 
                                            className="animate-shiny" 
                                            style={{
                                                backgroundImage: 'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #10b981 32.5%, #059669 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
                                                backgroundSize: '200% auto',
                                                WebkitBackgroundClip: 'text',
                                                backgroundClip: 'text',
                                                color: 'transparent',
                                                WebkitTextFillColor: 'transparent',
                                                filter: 'url(#c3-noise)'
                                            }}
                                        >
                                            Automatizado
                                        </span>
                                    </h1>
                                    <p className="text-zinc-450 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                        Diseña entrenamientos, planifica macronutrientes, gestiona cobros y da a tus atletas una experiencia app premium personalizada.
                                    </p>
                                    <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                                        <button 
                                            onClick={handleDemoClick} 
                                            className="btn-apple-pill btn-apple-pill-green shadow-[0_0_30px_rgba(16,185,129,0.35)] text-base px-8 py-4"
                                        >
                                            Agendar Llamada de Explicación
                                        </button>
                                        <a href="#product" className="text-sm text-zinc-450 hover:text-white font-semibold transition-colors py-3">
                                            Ver características
                                        </a>
                                    </div>
                                    <p className="text-xs text-zinc-550">Llamada de 15 minutos • Sin compromisos</p>
                                </div>
                            </header>

                            {/* --- STRIP MENÚ MAC_OS DE PREVISUALIZACIÓN --- */}
                            <div className="w-full h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10 z-10 relative">
                                <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs text-zinc-400">
                                    <div className="flex items-center gap-6">
                                        <span className="font-bold text-white flex items-center gap-1">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> FitLeader
                                        </span>
                                        <span className="hidden sm:inline">Archivo</span>
                                        <span className="hidden sm:inline">Edición</span>
                                        <span className="hidden md:inline">Atletas</span>
                                        <span className="hidden md:inline">Rutinas</span>
                                        <span className="hidden lg:inline">Finanzas</span>
                                    </div>
                                    <div />
                                </div>
                            </div>

                            {/* --- INTERACTIVE FITLEADER DASHBOARD MOCKUP --- */}
                            <section id="plataforma" className="max-w-6xl mx-auto px-6 py-16 md:py-24 z-10 relative">
                                <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl">
                                    {/* Cabecera macOS */}
                                    <div className="h-10 bg-black/25 flex items-center px-4 justify-between border-b border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                        </div>
                                        <span className="text-[11px] font-bold text-zinc-550">FitLeader — Panel del Entrenador</span>
                                        <div className="w-12" />
                                    </div>

                                    {/* Cuerpo del Dashboard */}
                                    <div className="grid grid-cols-12 h-[520px] text-left">
                                        {/* Barra lateral */}
                                        <div className="col-span-3 border-r border-white/5 bg-black/20 p-4 flex flex-col justify-between">
                                            <div className="space-y-6">
                                                <button onClick={handleDemoClick} className="w-full rounded-xl bg-white text-black text-xs font-bold py-2.5 px-4 flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                                                    <Sparkles className="w-3.5 h-3.5" /> Nueva Rutina
                                                </button>
                                                
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="bg-white/10 text-white rounded-lg px-3 py-2 font-semibold flex items-center justify-between">
                                                        <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4 text-emerald-450" /> Dashboard</span>
                                                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Activo</span>
                                                    </div>
                                                    <div className="text-zinc-400 hover:bg-white/5 hover:text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-2">
                                                        <Users className="w-4 h-4" /> Atletas (12)
                                                    </div>
                                                    <div className="text-zinc-400 hover:bg-white/5 hover:text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-2">
                                                        <Dumbbell className="w-4 h-4" /> Creador de Rutinas
                                                    </div>
                                                    <div className="text-zinc-400 hover:bg-white/5 hover:text-white rounded-lg px-3 py-2 transition-colors flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" /> Finanzas
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Zonas / Salas */}
                                            <div className="space-y-3">
                                                <div className="text-[9px] uppercase tracking-wider text-zinc-550 font-bold">Salas de Alquiler</div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span>Sala Funcional 1</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                    <span>Box de Fuerza A</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Lista de Atletas */}
                                        <div className="col-span-4 border-r border-white/5 p-4 space-y-4">
                                            <div className="text-xs font-bold text-white flex items-center justify-between">
                                                <span>Atletas Activos</span>
                                                <span className="text-[10px] text-zinc-550">Última actualización</span>
                                            </div>

                                            <div className="space-y-2">
                                                {/* Atleta 1 */}
                                                <div className="p-3 bg-white/5 border border-emerald-500/20 rounded-xl space-y-1.5 cursor-pointer">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-white">Carlos Rodríguez</span>
                                                        <span className="text-[9px] text-emerald-450 font-mono">Plan Elite</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-400 truncate">Sentadillas pesadas con fatiga lumbar</p>
                                                    <div className="flex justify-between items-center text-[9px] text-zinc-550">
                                                        <span>Hoy 9:41 AM</span>
                                                        <span className="bg-emerald-500/10 text-emerald-450 px-1 py-0.2 rounded">Al día</span>
                                                    </div>
                                                </div>

                                                {/* Atleta 2 */}
                                                <div className="p-3 hover:bg-white/5 rounded-xl space-y-1.5 cursor-pointer transition-colors">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-white">Sofía Martínez</span>
                                                        <span className="text-[9px] text-zinc-400 font-mono">Plan Pro</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-550 truncate">Dieta y entrenamiento completados</p>
                                                    <div className="flex justify-between items-center text-[9px] text-zinc-550">
                                                        <span>Ayer 18:12 PM</span>
                                                        <span className="bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded">Al día</span>
                                                    </div>
                                                </div>

                                                {/* Atleta 3 */}
                                                <div className="p-3 hover:bg-white/5 rounded-xl space-y-1.5 cursor-pointer transition-colors">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-bold text-white">Javier Torres</span>
                                                        <span className="text-[9px] text-purple-400 font-mono">Plan Studio</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-550 truncate">Requiere renovación de membresía</p>
                                                    <div className="flex justify-between items-center text-[9px] text-zinc-550">
                                                        <span>Lunes</span>
                                                        <span className="bg-red-500/10 text-red-400 px-1 py-0.2 rounded">Pendiente</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vista de Detalle y Chat */}
                                        <div className="col-span-5 p-4 flex flex-col justify-between bg-black/10">
                                            {/* Header */}
                                            <div className="border-b border-white/5 pb-3">
                                                <h4 className="text-sm font-bold text-white">Carlos Rodríguez</h4>
                                                <p className="text-[10px] text-zinc-550">Asesoría de Fuerza y Composición Corporal</p>
                                            </div>

                                            {/* AI Summary Box */}
                                            <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-1.5 text-xs my-2">
                                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                                    <Sparkles className="w-3.5 h-3.5 font-sans" />
                                                    <span>Resumen por FitLeader AI</span>
                                                </div>
                                                <p className="text-[10px] text-zinc-350 leading-relaxed">
                                                    El atleta reporta molestia en la zona lumbar baja al terminar la sentadilla en RPE 9. Plan nutricional cumplido al 95%. Se sugiere reajustar carga a RPE 8.
                                                </p>
                                            </div>

                                            {/* Mensajes del chat */}
                                            <div className="flex-1 overflow-y-auto py-2 space-y-2 text-xs">
                                                <div className="flex flex-col items-end">
                                                    <div className="bg-zinc-800 text-white rounded-lg p-2.5 max-w-[80%] text-[11px] leading-relaxed">
                                                        Hola Carlos, ¿cómo te has sentido esta semana con el aumento de carga?
                                                    </div>
                                                    <span className="text-[8px] text-zinc-550 mt-1">9:40 AM</span>
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <div className="bg-emerald-600 text-white rounded-lg p-2.5 max-w-[80%] text-[11px] leading-relaxed">
                                                        ¡Hola! Todo bien, pero he sentido algo de sobrecarga lumbar en las últimas sentadillas pesadas.
                                                    </div>
                                                    <span className="text-[8px] text-zinc-550 mt-1">9:41 AM</span>
                                                </div>
                                            </div>

                                            {/* Input del chat */}
                                            <div className="border-t border-white/5 pt-3 flex gap-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Responder a Carlos..." 
                                                    className="flex-1 bg-[#111] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-650 outline-none"
                                                    readOnly
                                                />
                                                <Button onClick={handleDemoClick} className="bg-emerald-500 text-black py-2 px-3 text-xs font-bold rounded-lg hover:bg-emerald-400">
                                                    Enviar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* --- SECCIÓN ZIG-ZAG SAAS --- */}
                            <section id="product" className="py-24 bg-black/40 border-y border-white/5 relative z-10">
                                <div className="max-w-7xl mx-auto px-6 space-y-32">
                                    
                                    {/* Grid de Características */}
                                    <div className="space-y-16 relative">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                                        
                                        <div className="text-center max-w-3xl mx-auto space-y-4">
                                            <h2 className="text-xs font-semibold tracking-widest text-emerald-450 uppercase">Funciones Todo-En-Uno</h2>
                                            <h3 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-white">
                                                El ecosistema perfecto <br />
                                                <span 
                                                    className="animate-shiny bg-gradient-to-r from-emerald-450 via-teal-400 to-indigo-500 bg-clip-text text-transparent font-black leading-none"
                                                    style={{ backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                                >
                                                    para potenciar y automatizar tu negocio
                                                </span>
                                            </h3>
                                            <p className="text-zinc-450 text-sm max-w-lg mx-auto leading-relaxed">
                                                La plataforma integral que unifica entrenamientos, planificación de nutrición y cobros bajo tu propia marca corporativa.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                                            {[
                                                {
                                                    category: "Gestión",
                                                    dotColor: "bg-emerald-400",
                                                    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                                    title: "Controla tus atletas y su progreso en un solo lugar.",
                                                    bullets: [
                                                        "Fichas de atletas con histórico",
                                                        "Fotos de progreso y medidas",
                                                        "Chat directo en tiempo real"
                                                    ],
                                                    colorTheme: "from-emerald-500 to-teal-500",
                                                    shadowTheme: "rgba(16, 185, 129, 0.15)"
                                                },
                                                {
                                                    category: "Entrenamiento",
                                                    dotColor: "bg-cyan-400",
                                                    badgeStyle: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                                                    title: "Diseña rutinas y entrenamientos estructurados sin fricción.",
                                                    bullets: [
                                                        "Creador inteligente de rutinas",
                                                        "Biblioteca de vídeos demostrativos",
                                                        "Seguimiento de marcas y RPE"
                                                    ],
                                                    colorTheme: "from-cyan-400 to-blue-500",
                                                    shadowTheme: "rgba(6, 182, 212, 0.15)"
                                                },
                                                {
                                                    category: "Marca Blanca",
                                                    dotColor: "bg-purple-400",
                                                    badgeStyle: "bg-purple-500/10 text-purple-400 border-purple-500/20",
                                                    title: "Tu propia App instalada en el móvil de tu cliente.",
                                                    bullets: [
                                                        "Logotipo y colores corporativos",
                                                        "Instalación PWA rápida y ligera",
                                                        "Notificaciones integradas"
                                                    ],
                                                    colorTheme: "from-purple-500 to-indigo-500",
                                                    shadowTheme: "rgba(168, 85, 247, 0.15)"
                                                },
                                                {
                                                    category: "Finanzas",
                                                    dotColor: "bg-emerald-400",
                                                    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                                                    title: "Automatiza cobros y controla tu facturación.",
                                                    bullets: [
                                                        "Pasarela de pagos con Stripe",
                                                        "Cobros recurrentes mensuales",
                                                        "Informes de rentabilidad limpios"
                                                    ],
                                                    colorTheme: "from-emerald-400 to-teal-500",
                                                    shadowTheme: "rgba(16, 185, 129, 0.15)"
                                                }
                                            ].map((feat, idx) => {
                                                const isActive = hoveredFeature === idx;
                                                return (
                                                    <div
                                                        key={idx}
                                                        onMouseEnter={() => setHoveredFeature(idx)}
                                                        className={`liquid-glass rounded-3xl p-6 flex flex-col justify-between transition-all duration-500 cursor-pointer min-h-[380px] relative ${
                                                            isActive 
                                                                ? 'scale-[1.02] border-t border-white/20' 
                                                                : 'opacity-60'
                                                        }`}
                                                        style={{
                                                            boxShadow: isActive ? `0 10px 40px ${feat.shadowTheme}, inset 0 1px 1px rgba(255,255,255,0.15)` : 'none',
                                                            borderColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'
                                                        }}
                                                    >
                                                        {/* Efecto de resplandor para la tarjeta activa */}
                                                        {isActive && (
                                                            <div className={`absolute -inset-px bg-gradient-to-b ${feat.colorTheme} opacity-10 blur-xl pointer-events-none rounded-3xl`} />
                                                        )}

                                                        <div className="space-y-6 relative z-10 text-left">
                                                            {/* Pill de categoría */}
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${feat.badgeStyle}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${feat.dotColor} animate-pulse`} />
                                                                {feat.category}
                                                            </div>

                                                            {/* Titular */}
                                                            <h4 className="text-base font-bold text-white leading-snug">
                                                                {feat.title}
                                                            </h4>

                                                            {/* Lista de características */}
                                                            <ul className="space-y-2.5 text-xs text-zinc-400">
                                                                {feat.bullets.map((bullet, bIdx) => (
                                                                    <li key={bIdx} className="flex items-center gap-2">
                                                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                                                        <span>{bullet}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Botón dinámico */}
                                                        <div className="mt-6 relative z-10">
                                                            <button
                                                                onClick={handleDemoClick}
                                                                className={`w-full h-10 text-xs font-bold rounded-xl transition-all duration-300 ${
                                                                    isActive 
                                                                        ? `bg-gradient-to-r ${feat.colorTheme} text-black opacity-100 shadow-md` 
                                                                        : 'bg-white/5 text-zinc-400 opacity-60 hover:opacity-100'
                                                                }`}
                                                            >
                                                                Saber más
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    
                                    {/* Detalle 1 */}
                                    <div id="clientes" className="grid lg:grid-cols-2 gap-16 items-center pt-16">
                                        <div>
                                            <h3 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">Control total sobre tus atletas.</h3>
                                            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                                Toda la información agrupada de forma limpia. Sigue su adherencia al entrenamiento y a la dieta, sus medidas antropométricas y mantén el chat en un solo lugar.
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-2xl blur-lg pointer-events-none" />
                                            
                                            <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl">
                                                {/* Cabecera macOS */}
                                                <div className="h-10 bg-black/25 flex items-center px-4 justify-between border-b border-white/5">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                                        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                                        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                                    </div>
                                                    <span className="text-[10px] font-bold text-zinc-550">FitLeader — Cartera de Clientes</span>
                                                    <div className="w-12" />
                                                </div>

                                                {/* Contenedor del panel */}
                                                <div className="p-4 space-y-4 text-left">
                                                    {/* Pestañas superiores */}
                                                    <div className="flex gap-2 text-[10px] sm:text-xs font-semibold">
                                                        <span className="bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                                                            Activos (4)
                                                        </span>
                                                        <span className="text-zinc-550 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                                            Leads (Invitados) (1)
                                                        </span>
                                                        <span className="text-zinc-550 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                                            Marketplace (0)
                                                        </span>
                                                    </div>

                                                    {/* Tabla */}
                                                    <div className="overflow-x-auto">
                                                        <table className="w-full text-[11px] text-zinc-400 border-collapse">
                                                            <thead>
                                                                <tr className="border-b border-white/5 text-zinc-500 text-[9px] uppercase font-bold tracking-wider text-left">
                                                                    <th className="py-2.5 pb-3">Atleta y Acceso</th>
                                                                    <th className="py-2.5 pb-3">Objetivo</th>
                                                                    <th className="py-2.5 pb-3">Estado</th>
                                                                    <th className="py-2.5 pb-3">Pago / Fecha</th>
                                                                    <th className="py-2.5 pb-3 text-right">Acción</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/5">
                                                                {[
                                                                    {
                                                                        name: "Alberto Gómez",
                                                                        email: "fitleaderapp@gmail.com",
                                                                        code: "FIT-3568",
                                                                        coach: "Sin asignar",
                                                                        objective: "Hyrox",
                                                                        status: "active",
                                                                        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                                                                    },
                                                                    {
                                                                        name: "Marcos Mendoza",
                                                                        email: "fitleaderapp@gmail.com",
                                                                        code: "FIT-1234",
                                                                        coach: "Sin asignar",
                                                                        objective: "Volumen",
                                                                        status: "active",
                                                                        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                                                                    },
                                                                    {
                                                                        name: "Juan Pérez",
                                                                        email: "fitleaderapp@gmail.com",
                                                                        code: "FIT-4133",
                                                                        coach: "Sin asignar",
                                                                        objective: "Hipertrofia",
                                                                        status: "active",
                                                                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                                                                    },
                                                                    {
                                                                        name: "Sofia Martínez",
                                                                        email: "fitleaderapp@gmail.com",
                                                                        code: "FIT-6430",
                                                                        coach: "Sin asignar",
                                                                        objective: "Retomar forma física",
                                                                        status: "active",
                                                                        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                                                                    }
                                                                ].map((row, rIdx) => (
                                                                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                                                                        <td className="py-3 pr-4 flex items-center gap-3">
                                                                            <img src={row.avatar} alt={row.name} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                                                                            <div className="space-y-0.5">
                                                                                <div className="font-bold text-white text-xs whitespace-nowrap">{row.name}</div>
                                                                                <div className="text-[10px] text-zinc-550">{row.email}</div>
                                                                                <div className="flex gap-1.5 text-[9px] whitespace-nowrap">
                                                                                    <span className="text-emerald-450 font-mono">{row.code}</span>
                                                                                    <span className="text-zinc-550">• Coach: {row.coach}</span>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-3 pr-4">
                                                                            <div className="flex items-center gap-1.5 text-zinc-300 whitespace-nowrap">
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-650" />
                                                                                {row.objective}
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-3 pr-4">
                                                                            <span className="bg-amber-500/10 text-amber-500 text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-amber-500/20 whitespace-nowrap">
                                                                                {row.status}
                                                                            </span>
                                                                        </td>
                                                                        <td className="py-3 pr-4">
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
                                                                        </td>
                                                                        <td className="py-3 text-right">
                                                                            <button className="p-1 text-zinc-550 hover:text-white transition-colors cursor-pointer bg-transparent border-none">
                                                                                <MoreVertical className="w-4 h-4" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalle 2 - App del Atleta */}
                                    <div id="atletas" className="grid lg:grid-cols-2 gap-16 items-center pt-24 border-t border-white/5">
                                        <div className="space-y-6 text-left">
                                            <span className="text-xs font-bold text-emerald-450 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">APP MÓVIL MARCA BLANCA</span>
                                            <h3 className="text-3xl md:text-5xl font-black text-white leading-tight">
                                                Tu propia App en la mano de tu cliente
                                            </h3>
                                            <p className="text-zinc-450 text-lg leading-relaxed">
                                                Tus alumnos disponen de una app nativa desde la cual registran sus marcas de entrenamiento, siguen sus planes nutricionales, envían fotos de evolución y registran sus medidas. Todo conectado en tiempo real con tu panel de coach.
                                            </p>
                                            
                                            {/* Selector interactivo para explicar las pestañas */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                                                {[
                                                    { id: 'inicio', label: 'Pantalla Inicio' },
                                                    { id: 'rutina', label: 'Registro Rutina' },
                                                    { id: 'racha', label: 'Racha & Motivación' },
                                                    { id: 'progreso', label: 'Evolución' }
                                                ].map((tab) => (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActivePhoneTab(tab.id as any)}
                                                        className={`py-2 px-3 text-xs font-bold rounded-xl transition-all duration-300 ${
                                                            activePhoneTab === tab.id
                                                                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10'
                                                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                                    >
                                                        {tab.label}
                                                    </button>
                                                ))}
                                            </div>

                                            <ul className="space-y-4 pt-4">
                                                <li className="flex items-start gap-3 text-zinc-300">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="text-white">Seguimiento de entrenamientos</strong>
                                                        <p className="text-xs text-zinc-450 mt-0.5">Tus clientes anotan las series, repeticiones y pesos de forma limpia e intuitiva.</p>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-3 text-zinc-300">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="text-white">Gamificación y adherencia</strong>
                                                        <p className="text-xs text-zinc-450 mt-0.5">El sistema de rachas (On Fire) incentiva a tus alumnos a no fallar sus entrenos.</p>
                                                    </div>
                                                </li>
                                                <li className="flex items-start gap-3 text-zinc-300">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="text-white">Fotos de progreso y medidas</strong>
                                                        <p className="text-xs text-zinc-450 mt-0.5">Historias visuales de antes/después y registro detallado de perímetros corporales.</p>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Mockup del Teléfono */}
                                        <div className="flex justify-center relative">
                                            {/* Glow background around phone */}
                                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[550px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

                                            {/* iPhone Container */}
                                            <div className="w-[305px] h-[610px] rounded-[48px] border-[10px] border-zinc-800 bg-black shadow-2xl relative flex flex-col overflow-hidden ring-4 ring-white/5 select-none">
                                                {/* Dynamic Island */}
                                                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[90px] h-[22px] bg-black rounded-full z-40 flex items-center justify-end px-3">
                                                    <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
                                                </div>

                                                {/* Status Bar */}
                                                <div className="h-8 flex justify-between items-center px-6 text-[10px] font-bold text-white z-30 pt-1">
                                                    <span>9:41</span>
                                                    <div className="flex items-center gap-1">
                                                        <span>📶</span>
                                                        <span>🔋</span>
                                                    </div>
                                                </div>

                                                {/* Screen Content */}
                                                <div className="flex-1 px-4 overflow-y-auto pb-14 text-left scrollbar-none space-y-4">
                                                    {activePhoneTab === 'inicio' && (
                                                        <div className="space-y-4 pt-1 animate-fadeIn">
                                                            {/* Saludo */}
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="text-base font-black text-white leading-tight">Hola, Campeón 👋</h4>
                                                                    <p className="text-[9px] text-zinc-400">Vamos a por el objetivo de hoy.</p>
                                                                </div>
                                                                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-orange-500/10 border border-orange-500/20 text-orange-405">
                                                                    🔥 12
                                                                </span>
                                                            </div>

                                                            {/* Objetivo Semanal */}
                                                            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 space-y-2 relative overflow-hidden">
                                                                <div className="flex justify-between items-center relative z-10">
                                                                    <span className="text-[10px] font-bold text-emerald-450 uppercase tracking-wider">Objetivo Semanal</span>
                                                                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                                                                </div>
                                                                <div className="text-3xl font-black text-white relative z-10">3 <span className="text-xs text-zinc-550 font-medium">/ 4 sesiones</span></div>
                                                                <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden relative z-10">
                                                                    <div className="bg-emerald-500 h-full rounded-full w-[75%]" />
                                                                </div>
                                                                <div className="text-right text-[8px] text-emerald-400 font-bold relative z-10">¡Casi lo tienes!</div>
                                                            </div>

                                                            {/* Tip del Día */}
                                                            <div className="bg-[#141416] border border-zinc-850 rounded-2xl p-4 flex gap-3">
                                                                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                                                                    <span className="text-amber-400 text-sm font-bold">💡</span>
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="text-[10px] font-bold text-white">Tip del Día</div>
                                                                    <p className="text-[9px] text-zinc-450 leading-normal">La hidratación es clave para el rendimiento. Intenta beber 500ml de agua 30 minutos antes de tu sesión hoy.</p>
                                                                </div>
                                                            </div>

                                                            {/* Próxima Sesión */}
                                                            <div className="space-y-2">
                                                                <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider">Próxima sesión:</span>
                                                                <div className="bg-[#141416] border border-zinc-850 rounded-2xl p-3.5 flex justify-between items-center hover:border-zinc-800 transition-colors">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-450">
                                                                            <Calendar className="w-4 h-4" />
                                                                        </div>
                                                                        <div>
                                                                            <div className="text-xs font-bold text-white">Pierna Hipertrofia</div>
                                                                            <div className="text-[9px] text-zinc-500">Mañana, 18:00</div>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight className="w-4 h-4 text-zinc-650" />
                                                                </div>
                                                            </div>

                                                            {/* Floating Chat Bubble */}
                                                            <div className="absolute bottom-16 right-6 w-11 h-11 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center text-black hover:scale-105 transition-transform cursor-pointer">
                                                                <MessageSquare className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    {activePhoneTab === 'rutina' && (
                                                        <div className="space-y-4 pt-1 animate-fadeIn">
                                                            {/* Cabecera Rutina */}
                                                            <div className="relative rounded-2xl overflow-hidden h-28 flex flex-col justify-end p-3 border border-zinc-850 bg-gradient-to-t from-black via-black/40 to-transparent">
                                                                {/* Background image placeholder */}
                                                                <div className="absolute inset-0 bg-zinc-900 opacity-60 -z-10 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80")' }} />
                                                                <div className="flex gap-1.5 mb-1">
                                                                    <span className="bg-emerald-500 text-black text-[8px] font-black px-2 py-0.5 rounded-md uppercase">Día 1</span>
                                                                    <span className="bg-white/10 text-zinc-300 text-[8px] font-bold px-2 py-0.5 rounded-md uppercase">Semana 4</span>
                                                                </div>
                                                                <h4 className="text-base font-black text-white">Fuerza Tren Inferior</h4>
                                                                <div className="text-[9px] text-zinc-400 mt-0.5">⏱ 60 min  |  🔥 450 kcal</div>
                                                            </div>

                                                            {/* Ejercicio Card */}
                                                            <div className="bg-[#141416] border border-zinc-850 rounded-2xl p-3.5 space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    {/* Thumbnail */}
                                                                    <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden relative flex items-center justify-center border border-white/5">
                                                                        <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=100&q=80" alt="Sentadilla" className="w-full h-full object-cover opacity-60" />
                                                                        <span className="absolute text-[10px] text-white">▶</span>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs font-bold text-white leading-snug">Sentadilla con Barra</div>
                                                                        <div className="text-[9px] text-emerald-450 font-mono">Last: 100kg x 8</div>
                                                                        <div className="text-[9px] text-zinc-550">4 Series  •  10-12 Reps</div>
                                                                    </div>
                                                                </div>

                                                                {/* Set Rows */}
                                                                <div className="space-y-1.5">
                                                                    {[1, 2, 3, 4].map((set) => (
                                                                        <div key={set} className="flex items-center justify-between bg-black/40 rounded-lg px-2.5 py-1.5 border border-zinc-900">
                                                                            <span className="text-[10px] font-bold text-zinc-550">{set}</span>
                                                                            <div className="flex gap-4">
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="text-[9px] font-mono text-white">0</span>
                                                                                    <span className="text-[8px] text-zinc-650 uppercase">kg</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className="text-[9px] font-mono text-white">0</span>
                                                                                    <span className="text-[8px] text-zinc-650 uppercase">reps</span>
                                                                                </div>
                                                                            </div>
                                                                            <div className="w-4 h-4 rounded border border-zinc-700 flex items-center justify-center text-[8px] text-emerald-400">✓</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Completar Button */}
                                                            <button className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black rounded-xl transition-colors">
                                                                Completar Entrenamiento
                                                            </button>
                                                        </div>
                                                    )}

                                                    {activePhoneTab === 'racha' && (
                                                        <div className="space-y-6 pt-6 text-center animate-fadeIn">
                                                            {/* Flame Logo */}
                                                            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                                                                <div className="absolute inset-0 bg-orange-500/10 blur-xl rounded-full animate-pulse" />
                                                                <Flame className="w-20 h-20 text-orange-500 fill-orange-500 animate-bounce" />
                                                                <span className="absolute -bottom-1 right-2 bg-zinc-900 border border-zinc-850 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                                                    12
                                                                </span>
                                                            </div>

                                                            <div className="space-y-1.5">
                                                                <h4 className="text-lg font-black text-white tracking-tight">¡ESTÁS ON FIRE!</h4>
                                                                <p className="text-[10px] text-zinc-450 leading-normal max-w-[200px] mx-auto">Llevas 12 días seguidos cumpliendo. No rompas la cadena ahora.</p>
                                                            </div>

                                                            {/* Stats Grid */}
                                                            <div className="grid grid-cols-3 gap-2 text-left">
                                                                {[
                                                                    { label: "Nivel", val: "Espartano", icon: <Trophy className="w-3.5 h-3.5 text-amber-500" /> },
                                                                    { label: "Total", val: "45 Días", icon: <Calendar className="w-3.5 h-3.5 text-emerald-400" /> },
                                                                    { label: "Récord", val: "21 Días", icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> }
                                                                ].map((stat, idx) => (
                                                                    <div key={idx} className="bg-[#141416] border border-zinc-850 rounded-xl p-2.5 space-y-1">
                                                                        <div className="flex justify-between items-center">
                                                                            <span className="text-[8px] text-zinc-650 uppercase tracking-wider">{stat.label}</span>
                                                                            {stat.icon}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-white truncate">{stat.val}</div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            {/* Action Button */}
                                                            <button className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-black rounded-xl transition-opacity hover:opacity-90 shadow-lg shadow-orange-500/10">
                                                                Ir a Entrenar
                                                            </button>
                                                        </div>
                                                    )}

                                                    {activePhoneTab === 'progreso' && (
                                                        <div className="space-y-4 pt-1 animate-fadeIn">
                                                            {/* Header Evolución */}
                                                            <div className="flex justify-between items-center">
                                                                <h4 className="text-xs font-bold text-white">Tu Evolución 📈</h4>
                                                                <button className="bg-white/10 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 hover:bg-white/15">
                                                                    <Plus className="w-2.5 h-2.5" /> Registrar
                                                                </button>
                                                            </div>

                                                            {/* Fotos de Progreso */}
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400">
                                                                    <span>Fotos de Progreso</span>
                                                                    <span className="text-emerald-450 hover:underline cursor-pointer">Ver galería</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-3.5">
                                                                    {/* Antes */}
                                                                    <div className="relative rounded-xl overflow-hidden aspect-[4/5] border border-zinc-800">
                                                                        <img src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=150&q=80" alt="Antes" className="w-full h-full object-cover opacity-50 filter grayscale" />
                                                                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[7px] font-black px-1.5 py-0.5 rounded">ANTES</span>
                                                                        <span className="absolute bottom-2 left-2 text-[7px] text-zinc-450 font-mono">01 Ene 2024</span>
                                                                    </div>
                                                                    {/* Ahora */}
                                                                    <div className="relative rounded-xl border border-dashed border-zinc-850 flex flex-col items-center justify-center aspect-[4/5] bg-black/40 cursor-pointer hover:border-zinc-700 transition-colors">
                                                                        <span className="absolute top-2 left-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[7px] font-black px-1.5 py-0.5 rounded">AHORA</span>
                                                                        <Camera className="w-5 h-5 text-zinc-650 mb-1" />
                                                                        <span className="text-[7px] text-zinc-650 font-bold uppercase tracking-wider">+ Añadir Foto</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Medidas Corporales */}
                                                            <div className="space-y-2">
                                                                <span className="text-[10px] font-bold text-zinc-400">Medidas Corporales</span>
                                                                <div className="grid grid-cols-2 gap-2 text-left">
                                                                    {[
                                                                        { label: "Cintura", val: "82 cm", diff: "-2cm", up: false },
                                                                        { label: "Brazo D.", val: "38 cm", diff: "+1cm", up: true },
                                                                        { label: "Peso", val: "78.5 kg", diff: "-1.2kg", up: false },
                                                                        { label: "Entrenos", val: "12", diff: "Este mes", up: true, special: true }
                                                                    ].map((item, idx) => (
                                                                        <div key={idx} className="bg-[#141416] border border-zinc-850 rounded-xl p-3">
                                                                            <div className="text-[8px] text-zinc-650 uppercase tracking-wider">{item.label}</div>
                                                                            <div className="text-sm font-bold text-white mt-0.5">{item.val}</div>
                                                                            <span className={`text-[8px] font-bold ${
                                                                                item.special 
                                                                                    ? 'text-blue-400' 
                                                                                    : item.up 
                                                                                        ? 'text-emerald-450' 
                                                                                        : 'text-emerald-400'
                                                                            }`}>
                                                                                {item.diff}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Navigation Bar */}
                                                <div className="absolute bottom-0 inset-x-0 h-14 bg-black/80 backdrop-blur-md border-t border-zinc-900 flex items-center justify-around z-30 px-2 pb-2">
                                                    {[
                                                        { id: 'inicio', label: 'Inicio', icon: <Home className="w-4 h-4" /> },
                                                        { id: 'rutina', label: 'Rutina', icon: <Dumbbell className="w-4 h-4" /> },
                                                        { id: 'racha', label: 'Racha', icon: <Flame className="w-4 h-4" /> },
                                                        { id: 'progreso', label: 'Progreso', icon: <TrendingUp className="w-4 h-4" /> },
                                                        { id: 'perfil', label: 'Perfil', icon: <User className="w-4 h-4" /> }
                                                    ].map((btn) => {
                                                        const isBtnActive = activePhoneTab === btn.id;
                                                        return (
                                                            <button
                                                                key={btn.id}
                                                                onClick={() => {
                                                                    if (btn.id !== 'perfil') {
                                                                        setActivePhoneTab(btn.id as any);
                                                                    }
                                                                }}
                                                                className={`flex flex-col items-center gap-0.5 bg-transparent border-none outline-none cursor-pointer ${
                                                                    isBtnActive ? 'text-emerald-450' : 'text-zinc-650 hover:text-zinc-400'
                                                                }`}
                                                            >
                                                                {btn.icon}
                                                                <span className="text-[8px] font-medium">{btn.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* --- COMPARACIÓN SAAS --- */}
                            <section id="comparison" className="py-32 bg-black/20 border-b border-white/5 z-10 relative overflow-hidden">
                                
                                {/* Halo de fondo */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none -z-10">
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-950/20 via-transparent to-emerald-950/20 blur-[120px] rounded-full" />
                                </div>

                                <div className="max-w-5xl mx-auto px-6">
                                    
                                    {/* Header */}
                                    <div className="text-center mb-20 space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            El cambio que marca la diferencia
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight">
                                            ¿Tus asesorías<br />
                                            <span
                                                className="animate-shiny bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent"
                                                style={{ backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                            >
                                                son un caos?
                                            </span>
                                        </h2>
                                        <p className="text-zinc-400 text-base max-w-lg mx-auto leading-relaxed">
                                            Deja atrás las herramientas improvisadas. Pasa a un sistema diseñado específicamente para entrenadores.
                                        </p>
                                    </div>

                                    {/* Tarjetas de comparación */}
                                    <div className="grid md:grid-cols-2 gap-6">

                                        {/* Columna: Lo de siempre */}
                                        <div className="liquid-glass rounded-3xl p-8 relative overflow-hidden" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 to-transparent pointer-events-none rounded-3xl" />
                                            <div className="relative z-10 space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-red-500/10 text-red-400 border-red-500/20 uppercase tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                        Sin FitLeader
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-zinc-200 leading-tight">
                                                    Lo de siempre
                                                </h3>
                                                <ul className="space-y-4">
                                                    {[
                                                        "Excels rotos y pesados",
                                                        "Mensajes de clientes perdidos en WhatsApp",
                                                        "Pérdida de tiempo persiguiendo impagos",
                                                        "Sin imagen profesional ni app propia",
                                                    ].map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-zinc-400 text-sm">
                                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                                                <X className="w-3 h-3 text-red-400" />
                                                            </div>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Columna: El Método FitLeader */}
                                        <div className="liquid-glass rounded-3xl p-8 relative overflow-hidden" style={{ boxShadow: '0 10px 60px rgba(16,185,129,0.12), inset 0 1px 1px rgba(255,255,255,0.15)', borderColor: 'rgba(16,185,129,0.2)' }}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 to-transparent pointer-events-none rounded-3xl" />
                                            
                                            {/* Badge recomendado */}
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wide shadow-lg shadow-emerald-500/30">
                                                ✦ Recomendado
                                            </div>

                                            <div className="relative z-10 space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                        Con FitLeader
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-white leading-tight">
                                                    El Método FitLeader
                                                </h3>
                                                <ul className="space-y-4">
                                                    {[
                                                        "Panel de control centralizado",
                                                        "App móvil propia e intuitiva para tus atletas",
                                                        "Cobros recurrentes automatizados con Stripe",
                                                        "Imagen profesional con marca blanca completa",
                                                    ].map((item, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-zinc-200 text-sm">
                                                            <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                                                                <Check className="w-3 h-3 text-emerald-400" />
                                                            </div>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={handleDemoClick}
                                                    className="mt-2 w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 text-black text-xs font-black rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
                                                >
                                                    Solicitar Demo Gratuita →
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </section>


                            {/* --- PRECIOS SAAS (CINEMATIC) --- */}
                            <section id="pricing" className="c3-pricing-section z-10 relative">
                                <div className="c3-watermark-container">
                                    <div className="c3-watermark-main">
                                        <span className="c3-watermark-line-1">Tu Negocio Fitness,</span>
                                        <span className="c3-watermark-line-2">Automatizado</span>
                                    </div>
                                </div>

                                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full space-y-20">

                                    {/* Header */}
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Planes simples y transparentes
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black text-white leading-none tracking-tight">
                                            El plan perfecto<br />
                                            <span
                                                className="animate-shiny bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent"
                                                style={{ backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                            >
                                                para cada negocio
                                            </span>
                                        </h2>
                                        <p className="text-zinc-400 text-base max-w-lg mx-auto">
                                            Elige tu perfil, explora los planes y agenda una demo con nuestro equipo.
                                        </p>
                                    </div>

                                    {/* GRUPO 1: Para Coaches */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                Para Entrenadores Personales
                                            </div>
                                            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/20 to-transparent" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                {
                                                    name: "Profesional",
                                                    price: "29,99€",
                                                    badge: null,
                                                    accentFrom: "from-emerald-500",
                                                    accentTo: "to-teal-500",
                                                    accentText: "text-emerald-400",
                                                    accentBorder: "rgba(16,185,129,0.25)",
                                                    accentGlow: "rgba(16,185,129,0.1)",
                                                    tagline: "Ideal para coaches individuales que quieren profesionalizar su negocio.",
                                                    features: [
                                                        "App nativa para tus atletas (iOS & Android)",
                                                        "Clientes ilimitados",
                                                        "App marca blanca PWA para tus atletas",
                                                        "Creador de rutinas y dietas",
                                                        "Seguimiento de progreso y métricas",
                                                        "Cobros manuales y facturas",
                                                        "Soporte por email",
                                                    ]
                                                },
                                                {
                                                    name: "Elite",
                                                    price: "59,99€",
                                                    badge: "Más completo",
                                                    accentFrom: "from-emerald-400",
                                                    accentTo: "to-cyan-500",
                                                    accentText: "text-emerald-400",
                                                    accentBorder: "rgba(16,185,129,0.3)",
                                                    accentGlow: "rgba(16,185,129,0.12)",
                                                    tagline: "Para coaches que quieren la experiencia más completa para sus atletas.",
                                                    features: [
                                                        "App nativa para tus atletas (iOS & Android)",
                                                        "Todo lo del plan Profesional",
                                                        "Plan nutricional",
                                                        "Chat de mensajería instantánea integrado",
                                                        "Cobros recurrentes automatizados con Stripe",
                                                        "Analíticas avanzadas de retención",
                                                        "Estadísticas avanzadas de negocio",
                                                        "Soporte prioritario",
                                                    ]
                                                }
                                            ].map((plan) => (
                                                <div
                                                    key={plan.name}
                                                    className="group liquid-glass rounded-3xl p-8 relative overflow-hidden cursor-pointer
                                                        transition-all duration-500
                                                        hover:scale-[1.02]"
                                                    style={{
                                                        borderColor: plan.accentBorder,
                                                        boxShadow: `0 4px 30px ${plan.accentGlow}`
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 60px ${plan.accentGlow.replace('0.1', '0.25').replace('0.12', '0.28')}`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 30px ${plan.accentGlow}`;
                                                    }}
                                                >
                                                    {/* Glow bg */}
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.accentFrom} opacity-[0.06] pointer-events-none rounded-3xl`} />

                                                    {plan.badge && (
                                                        <div className={`absolute top-4 right-4 bg-gradient-to-r ${plan.accentFrom} ${plan.accentTo} text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wide`}>
                                                            ✦ {plan.badge}
                                                        </div>
                                                    )}

                                                    <div className="relative z-10 space-y-5">
                                                        {/* Nombre y precio */}
                                                        <div>
                                                            <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                                                            <p className={`text-xs ${plan.accentText} mb-3`}>{plan.tagline}</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-bold text-zinc-450 line-through opacity-50">{plan.price}</span>
                                                                <span className="text-5xl font-black text-white">0€</span>
                                                                <span className="text-zinc-400 text-sm mb-1.5">/mes</span>
                                                            </div>
                                                        </div>

                                                        {/* Features: visibles en hover */}
                                                        <ul className="space-y-2.5 text-xs text-zinc-300
                                                            max-h-0 overflow-hidden opacity-0
                                                            group-hover:max-h-[400px] group-hover:opacity-100
                                                            transition-all duration-500 ease-in-out">
                                                            {plan.features.map((f, fi) => (
                                                                <li key={fi} className="flex items-center gap-2">
                                                                    <CheckCircle2 className={`w-3.5 h-3.5 ${plan.accentText} shrink-0`} />
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        {/* CTA */}
                                                        <button
                                                            onClick={handleDemoClick}
                                                            className={`w-full h-11 bg-gradient-to-r ${plan.accentFrom} ${plan.accentTo} text-black text-xs font-black rounded-xl hover:opacity-90 transition-opacity shadow-lg mt-2`}
                                                        >
                                                            Reservar Demo →
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* GRUPO 2: Para Centros y Studios */}
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                                Para Centros y Studios Deportivos
                                            </div>
                                            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/20 to-transparent" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {[
                                                {
                                                    name: "Studio",
                                                    price: "59,99€",
                                                    badge: null,
                                                    accentFrom: "from-purple-500",
                                                    accentTo: "to-indigo-500",
                                                    accentText: "text-purple-400",
                                                    accentBorder: "rgba(168,85,247,0.25)",
                                                    accentGlow: "rgba(168,85,247,0.1)",
                                                    tagline: "Para studios con múltiples coaches y gestión de horarios.",
                                                    features: [
                                                        "App nativa para tus atletas (iOS & Android)",
                                                        "Clientes ilimitados",
                                                        "App marca blanca PWA para atletas",
                                                        "Gestión de staff de entrenadores",
                                                        "Asignación de atletas por coach",
                                                        "Control de inventario de equipamiento",
                                                        "Cobros recurrentes con Stripe",
                                                        "Soporte prioritario",
                                                    ]
                                                },
                                                {
                                                    name: "Center",
                                                    price: "99,99€",
                                                    badge: "Más completo",
                                                    accentFrom: "from-blue-500",
                                                    accentTo: "to-indigo-500",
                                                    accentText: "text-blue-400",
                                                    accentBorder: "rgba(59,130,246,0.3)",
                                                    accentGlow: "rgba(59,130,246,0.12)",
                                                    tagline: "La solución completa para grandes centros o cadenas de gimnasios.",
                                                    features: [
                                                        "App nativa para tus atletas (iOS & Android)",
                                                        "Todo lo del plan Studio",
                                                        "Gestión de zonas y salas B2B",
                                                        "Reservas de entrenadores freelance por horas",
                                                        "Cobros automáticos a externos vía Stripe",
                                                        "Dashboard de ocupación y rentabilidad",
                                                        "Control de acceso y aforo",
                                                        "Account Manager dedicado",
                                                    ]
                                                }
                                            ].map((plan) => (
                                                <div
                                                    key={plan.name}
                                                    className="group liquid-glass rounded-3xl p-8 relative overflow-hidden cursor-pointer
                                                        transition-all duration-500
                                                        hover:scale-[1.02]"
                                                    style={{
                                                        borderColor: plan.accentBorder,
                                                        boxShadow: `0 4px 30px ${plan.accentGlow}`
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 60px ${plan.accentGlow.replace('0.1', '0.25').replace('0.12', '0.28')}`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 30px ${plan.accentGlow}`;
                                                    }}
                                                >
                                                    {/* Glow bg */}
                                                    <div className={`absolute inset-0 bg-gradient-to-br ${plan.accentFrom} opacity-[0.06] pointer-events-none rounded-3xl`} />

                                                    {plan.badge && (
                                                        <div className={`absolute top-4 right-4 bg-gradient-to-r ${plan.accentFrom} ${plan.accentTo} text-black text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wide`}>
                                                            ✦ {plan.badge}
                                                        </div>
                                                    )}

                                                    <div className="relative z-10 space-y-5">
                                                        {/* Nombre y precio */}
                                                        <div>
                                                            <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                                                            <p className={`text-xs ${plan.accentText} mb-3`}>{plan.tagline}</p>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-2xl font-bold text-zinc-450 line-through opacity-50">{plan.price}</span>
                                                                <span className="text-5xl font-black text-white">0€</span>
                                                                <span className="text-zinc-400 text-sm mb-1.5">/mes</span>
                                                            </div>
                                                        </div>

                                                        {/* Features: visibles en hover */}
                                                        <ul className="space-y-2.5 text-xs text-zinc-300
                                                            max-h-0 overflow-hidden opacity-0
                                                            group-hover:max-h-[400px] group-hover:opacity-100
                                                            transition-all duration-500 ease-in-out">
                                                            {plan.features.map((f, fi) => (
                                                                <li key={fi} className="flex items-center gap-2">
                                                                    <CheckCircle2 className={`w-3.5 h-3.5 ${plan.accentText} shrink-0`} />
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>

                                                        {/* CTA */}
                                                        <button
                                                            onClick={handleDemoClick}
                                                            className={`w-full h-11 bg-gradient-to-r ${plan.accentFrom} ${plan.accentTo} text-black text-xs font-black rounded-xl hover:opacity-90 transition-opacity shadow-lg mt-2`}
                                                        >
                                                            Reservar Demo →
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </section>

                            {/* --- FAQ SAAS --- */}
                            <section id="faq" className="py-32 bg-black/40 border-t border-white/5 z-10 relative overflow-hidden">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                                
                                <div className="max-w-3xl mx-auto px-6">
                                    <div className="text-center mb-16 space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-zinc-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            Resolviendo tus dudas
                                        </div>
                                        <h2 className="text-4xl font-extrabold text-white tracking-tight">Preguntas Frecuentes</h2>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        {faqs.map((faq, i) => {
                                            const isOpen = openFaq === i;
                                            return (
                                                <div
                                                    key={i}
                                                    className={`liquid-glass rounded-2xl overflow-hidden transition-all duration-300 ${
                                                        isOpen ? 'border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' : 'border-white/5'
                                                    }`}
                                                >
                                                    <button
                                                        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-transparent border-none outline-none cursor-pointer"
                                                        onClick={() => setOpenFaq(isOpen ? null : i)}
                                                    >
                                                        <span className="font-bold text-white text-sm sm:text-base hover:text-emerald-400 transition-colors">{faq.q}</span>
                                                        <ChevronDown className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <div 
                                                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                            isOpen ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
                                                        }`}
                                                    >
                                                        <p className="px-6 pb-5 text-zinc-400 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-4">
                                                            {faq.a}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {/* VISTA PRODUCTO: MARKETPLACE B2C/B2B */}
                    {currentProduct === 'marketplace' && (
                        <motion.div 
                            key="marketplace"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {/* Botón Volver */}
                            <div className="max-w-7xl mx-auto px-6 pt-8 z-10 relative">
                                <button 
                                    onClick={() => setProductView('gateway')}
                                    className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Volver al portal
                                </button>
                            </div>

                            {/* --- HERO MARKETPLACE --- */}
                            <header className="relative pt-12 pb-24 px-6 text-center overflow-hidden z-10">
                                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#2f3d33]/20 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#8fa895]/10 border border-[#8fa895]/20 text-[#8fa895] uppercase tracking-widest">
                                        <Globe className="w-3.5 h-3.5" /> Directorio & Espacios Deportivos
                                    </span>
                                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
                                        Tu escaparate B2C y <br />
                                        <span className="bg-gradient-to-r from-[#8fa895] to-[#5f7a66] bg-clip-text text-transparent font-extrabold">Alquiler de Salas B2B</span>
                                    </h1>
                                    <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                                        Los atletas encuentran entrenadores, y los entrenadores alquilan salas de entrenamiento funcional en centros locales por horas sin costes fijos.
                                    </p>
                                    <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
                                        <Button 
                                            onClick={() => navigate('/coaches')} 
                                            className="h-14 px-8 text-base bg-[#5f7a66] text-black hover:bg-[#6e8c75] font-bold rounded-xl shadow-lg shadow-[#5f7a66]/10 border-none"
                                        >
                                            Buscar Entrenador Personal
                                        </Button>
                                        <Button 
                                            variant="ghost"
                                            onClick={() => navigate('/auth?mode=register&plan=center')} 
                                            className="h-14 px-8 text-base border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl"
                                        >
                                            Registrar mi Centro Deportivo
                                        </Button>
                                    </div>
                                </div>
                            </header>

                            {/* --- PARA COACHES (B2C) --- */}
                            <section id="mkt-coaches" className="py-24 bg-black/40 border-y border-white/5 relative z-10">
                                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                                    <div>
                                        <span className="text-xs font-bold text-[#8fa895] uppercase tracking-wider">Para Entrenadores (B2C)</span>
                                        <h3 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Consigue nuevos clientes locales y online.</h3>
                                        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                            Activa tu visibilidad en el marketplace de FitLeader. Permite que atletas busquen por especialidad (pérdida de grasa, fuerza, CrossFit) y te envíen solicitudes de contacto que aparecerán directamente en tu panel.
                                        </p>
                                        <ul className="space-y-4">
                                            <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-[#8fa895]" /> Perfil personalizable con tu tarifa, bio y redes</li>
                                            <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-[#8fa895]" /> Avisos instantáneos y leads integrados en tu panel</li>
                                        </ul>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#5f7a66]/10 to-transparent rounded-2xl blur-lg pointer-events-none" />
                                        
                                        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl p-6 space-y-4">
                                            {/* Cabecera macOS */}
                                            <div className="absolute top-0 inset-x-0 h-10 bg-black/25 flex items-center px-4 justify-between border-b border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-550">FitLeader — Buscador de Entrenadores</span>
                                                <div className="w-12" />
                                            </div>

                                            <div className="pt-8 space-y-4 text-left">
                                                {/* Barra de búsqueda simulada */}
                                                <div className="flex gap-2 bg-black/40 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-500 items-center justify-between">
                                                    <span className="flex items-center gap-2">🔍 Especialidad: Fuerza, Hyrox...</span>
                                                    <span className="text-[10px] bg-[#8fa895]/10 text-[#8fa895] px-2 py-0.5 rounded border border-[#8fa895]/20 font-bold">Filtros Activos</span>
                                                </div>

                                                {/* Lista de entrenadores */}
                                                <div className="space-y-3.5">
                                                    {[
                                                        {
                                                            name: "Juan Martínez",
                                                            specialty: "Preparador Físico Fuerza & Hyrox",
                                                            rating: "4.9 (42 valoraciones)",
                                                            rate: "Desde 45€/mes",
                                                            tags: ["Hyrox", "Fuerza", "Online"],
                                                            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                                                        },
                                                        {
                                                            name: "Marta Silva",
                                                            specialty: "Nutricionista & Composición Corporal",
                                                            rating: "5.0 (28 valoraciones)",
                                                            rate: "Desde 50€/mes",
                                                            tags: ["Pérdida de peso", "Presencial", "Nutrición"],
                                                            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                                                        }
                                                    ].map((coach, cIdx) => (
                                                        <div key={cIdx} className="liquid-glass border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-[#8fa895]/30 transition-all duration-300">
                                                            <div className="flex justify-between items-start">
                                                                <div className="flex items-center gap-3">
                                                                    <img src={coach.avatar} alt={coach.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" />
                                                                    <div>
                                                                        <div className="font-bold text-white text-xs sm:text-sm">{coach.name}</div>
                                                                        <div className="text-[10px] text-zinc-400">{coach.specialty}</div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-[10px] font-bold text-white whitespace-nowrap">{coach.rate}</div>
                                                                    <div className="text-[9px] text-amber-400 whitespace-nowrap">★ {coach.rating}</div>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-1.5">
                                                                {coach.tags.map((tag, tIdx) => (
                                                                    <span key={tIdx} className="text-[8px] sm:text-[9px] bg-white/5 text-zinc-300 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* --- PARA CENTROS (B2B) --- */}
                            <section id="mkt-centers" className="py-24 bg-zinc-950/20 z-10 relative">
                                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                                    <div className="relative lg:order-2">
                                        <div className="absolute -inset-2 bg-gradient-to-tr from-[#4d6253]/15 to-transparent rounded-2xl blur-lg pointer-events-none" />
                                        
                                        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-[#0e1014]/90 backdrop-blur-2xl shadow-2xl p-6 space-y-4 text-left">
                                            {/* Cabecera macOS */}
                                            <div className="absolute top-0 inset-x-0 h-10 bg-black/25 flex items-center px-4 justify-between border-b border-white/5">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                                                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-550">FitLeader — Alquiler de Salas B2B</span>
                                                <div className="w-12" />
                                            </div>

                                            <div className="pt-8 space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h4 className="text-white text-sm font-bold">Olympus Fitness Center</h4>
                                                        <p className="text-[10px] text-zinc-400">Box de Entrenamiento Funcional 1</p>
                                                    </div>
                                                    <span className="text-xs bg-[#8fa895]/10 text-[#8fa895] border border-[#8fa895]/20 px-2.5 py-1 rounded-lg font-bold">15€ / hora</span>
                                                </div>

                                                {/* Slots de Horario */}
                                                <div className="space-y-2">
                                                    {[
                                                        { time: "10:00 - 11:00", status: "reserved", label: "Reservado — Coach Marcos" },
                                                        { time: "11:00 - 12:00", status: "available", label: "Reservar Slot" },
                                                        { time: "12:00 - 13:00", status: "available", label: "Reservar Slot" },
                                                        { time: "13:00 - 14:00", status: "reserved", label: "Reservado — Coach Marta" }
                                                    ].map((slot, sIdx) => (
                                                        <div 
                                                            key={sIdx}
                                                            className={`flex justify-between items-center p-3 rounded-xl border text-xs transition-all duration-300 ${
                                                                slot.status === 'reserved'
                                                                    ? 'bg-black/40 border-white/5 text-zinc-500 opacity-60'
                                                                    : 'liquid-glass border-[#8fa895]/20 text-white hover:border-[#8fa895]/40 hover:shadow-[0_0_15px_rgba(95,122,102,0.1)] cursor-pointer'
                                                            }`}
                                                        >
                                                            <span className="font-mono font-bold">{slot.time}</span>
                                                            <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide border ${
                                                                slot.status === 'reserved'
                                                                    ? 'bg-zinc-800/20 border-zinc-700 text-zinc-500'
                                                                    : 'bg-[#5f7a66]/10 border-[#5f7a66]/20 text-[#8fa895]'
                                                            }`}>
                                                                {slot.label}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:order-1">
                                        <span className="text-xs font-bold text-[#8fa895] uppercase tracking-wider">Para Centros Deportivos (B2B)</span>
                                        <h3 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Rentabiliza las horas muertas de tus salas.</h3>
                                        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                                            ¿Tienes zonas libres o salas de entrenamiento funcional vacías? Publícalas en FitLeader. Los coaches freelance de la zona reservarán y pagarán por horas a través de la plataforma para entrenar a sus atletas presenciales.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* --- TARIFAS MARKETPLACE --- */}
                            <section id="mkt-rates" className="py-24 bg-black/40 border-t border-white/5 z-10 relative">
                                <div className="max-w-4xl mx-auto px-6 text-center">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Tarifas de Promoción</h2>
                                    <p className="text-zinc-400 mb-12">Publicar tu perfil básico es gratis. Destácate para captar a máxima velocidad.</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                                        
                                        {/* Coach Destacado */}
                                        <div className="p-8 rounded-3xl border border-zinc-800 bg-black/60 backdrop-blur-md flex flex-col justify-between hover:border-[#8fa895]/30 transition-all text-left">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-2">Coach Destacado</h3>
                                                <div className="mb-4 flex items-baseline gap-2">
                                                    <span className="text-xl font-bold text-zinc-450 line-through opacity-50">9,99€</span>
                                                    <span className="text-4xl font-black text-white">0€</span>
                                                    <span className="text-zinc-400 text-xs">/mes</span>
                                                </div>
                                                <p className="text-zinc-400 text-xs mb-6">Aparece en la parte superior del listado público de entrenadores y capta más leads.</p>
                                            </div>
                                            <Button 
                                                onClick={() => navigate('/auth?mode=register')} 
                                                className="w-full bg-[#5f7a66] hover:bg-[#6e8c75] text-black font-bold h-10 text-xs border-none"
                                            >
                                                Activar Destacado
                                            </Button>
                                        </div>

                                        {/* Centro Proveedor */}
                                        <div className="p-8 rounded-3xl border border-zinc-800 bg-black/60 backdrop-blur-md flex flex-col justify-between hover:border-[#4d6253]/35 transition-all text-left">
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-2">Centro Proveedor</h3>
                                                <div className="mb-4 flex items-baseline gap-2">
                                                    <span className="text-xl font-bold text-zinc-450 line-through opacity-50">49,99€</span>
                                                    <span className="text-4xl font-black text-white">0€</span>
                                                    <span className="text-zinc-400 text-xs">/mes</span>
                                                </div>
                                                <p className="text-zinc-400 text-xs mb-6">Publica tus salas, gestiona tu aforo de externos y recibe cobros automáticos de freelance.</p>
                                            </div>
                                            <Button 
                                                onClick={() => navigate('/auth?mode=register&plan=center')} 
                                                className="w-full bg-[#4d6253] hover:bg-[#5a7361] text-white font-bold h-10 text-xs border-none"
                                            >
                                                Registrar Centro
                                            </Button>
                                        </div>

                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- CTA FINAL --- */}
            <section className="py-32 bg-gradient-to-b from-black to-emerald-950/20 border-t border-white/5 z-10 relative overflow-hidden">
                {/* Glow de fondo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
                
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-none">
                        Únete al ecosistema <br />
                        <span 
                            className="animate-shiny bg-gradient-to-r from-emerald-450 via-teal-400 to-indigo-500 bg-clip-text text-transparent font-black"
                            style={{ backgroundSize: '200% auto', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                        >
                            FitLeader
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        La plataforma líder que une la gestión profesional de tu negocio fitness con el mercado B2C y B2B.
                    </p>
                    <div className="pt-4">
                                                <button 
                                                    onClick={handleDemoClick}
                                                    className="btn-apple-pill btn-apple-pill-green shadow-[0_0_40px_rgba(16,185,129,0.35)] text-lg px-10 py-5 font-black uppercase tracking-wide hover:scale-105 transition-transform duration-300"
                                                >
                            Agendar Llamada de Asesoría <ArrowRight className="w-6 h-6 ml-2" />
                        </button>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-12 border-t border-white/10 bg-black/80 text-zinc-500 text-sm z-10 relative">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="FitLeader Logo" className="w-6 h-6 object-contain" />
                        <span className="font-bold text-white">FitLeader</span>
                    </div>
                    <div className="flex gap-6">
                        <a href="/terminos" className="hover:text-white transition-colors">Términos</a>
                        <a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a>
                        <a href="mailto:fitleader@fitleaderapp.com" className="hover:text-white transition-colors">Soporte</a>
                    </div>
                    <p>© {new Date().getFullYear()} FitLeader. Todos los derechos reservados.</p>
                </div>
            </footer>            
        </div>
    );
};

export default Landing;