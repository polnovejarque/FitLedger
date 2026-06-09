import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Dumbbell, Calendar, DollarSign, BarChart3, Settings as SettingsIcon, LogOut, Shield, Box, Building2 } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

// Añadimos "studioOnly: true" a las funciones exclusivas del plan más alto
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/dashboard/clients' },
    { icon: Dumbbell, label: 'Entrenamientos', path: '/dashboard/workouts' },
    { icon: Calendar, label: 'Agenda', path: '/dashboard/agenda' },
    { icon: DollarSign, label: 'Finanzas', path: '/dashboard/finance', restricted: true },
    { icon: BarChart3, label: 'Reportes', path: '/dashboard/reports', restricted: true },
    { icon: Shield, label: 'Mi Equipo', path: '/dashboard/team', restricted: true, studioOnly: true },
    { icon: Box, label: 'Inventario', path: '/dashboard/inventory', restricted: true, studioOnly: true },
    { icon: Building2, label: 'Alquiler Espacios', path: '/dashboard/center', restricted: true },
    { icon: SettingsIcon, label: 'Configuración', path: '/dashboard/settings', restricted: true },
];

const Sidebar = () => {
    const navigate = useNavigate();
    
    // Estados para la marca blanca
    const [businessName, setBusinessName] = useState('FitLeader');
    const [logoUrl, setLogoUrl] = useState('/logo.png');

    // Estado para guardar el rol y el plan
    const [userRole, setUserRole] = useState('admin');
    const [userPlan, setUserPlan] = useState('pro'); // Por defecto asumimos que no es studio

    // Cargar los datos del negocio, el ROL y el PLAN al iniciar
    useEffect(() => {
        const loadBusinessData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // SOLUCIÓN: select('*') para evitar errores si la base de datos cambia
                const { data } = await supabase
                    .from('profiles')
                    .select('role, plan, business_name, logo_url, studio_id')
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    setUserRole(data.role || 'admin');
                    setUserPlan(data.plan || 'pro');

                    if (data.role === 'staff' && data.studio_id) {
                        const { data: studioData } = await supabase
                            .from('profiles')
                            .select('business_name, logo_url')
                            .eq('id', data.studio_id)
                            .single();
                            
                        if (studioData) {
                            setBusinessName(studioData.business_name || 'FitLeader');
                            setLogoUrl(studioData.logo_url || '/logo.png');
                        }
                    } else {
                        // Si es el dueño, pintamos sus propios datos
                        if (data.business_name) setBusinessName(data.business_name);
                        if (data.logo_url) setLogoUrl(data.logo_url);
                    }
                }
            }
        };
        loadBusinessData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/'); 
    };

    // EL PORTERO INTELIGENTE: Filtramos el menú según el ROL y el PLAN
    const visibleNavItems = navItems.filter(item => {
        // 1. Si es empleado (staff), ocultamos las cosas de dueños (restricted)
        if (userRole === 'staff' && item.restricted) {
            return false;
        }
        
        // 2. Si es una función exclusiva de Studio, ocultarla si no tiene Studio ni Center
        if (item.studioOnly && userPlan !== 'studio' && userPlan !== 'center') {
            return false;
        }

        return true;
    });

    return (
        <aside className="h-screen w-64 bg-background border-r border-border flex flex-col">
            <div className="flex h-full flex-col px-3 py-4">
                
                {/* --- LOGO Y MARCA DINÁMICOS --- */}
                <div className="mb-8 flex items-center px-2">
                    <Link to="/dashboard" className="flex items-center gap-3 w-full">
                        <img 
                            src={logoUrl} 
                            alt={businessName} 
                            className="h-8 w-8 object-contain rounded-md bg-transparent" 
                        />
                        <span 
                            className="text-xl font-bold tracking-tight text-foreground truncate" 
                            title={businessName}
                        >
                            {businessName}
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-1">
                    {visibleNavItems.map((item) => {
                        const isCenterItem = item.path === '/dashboard/center';
                        const isLocked = isCenterItem && userPlan !== 'center';

                        return (
                            <NavLink
                                key={item.path}
                                to={isLocked ? '/dashboard/settings' : item.path}
                                end={item.path === '/dashboard'}
                                onClick={() => {
                                    if (isLocked) {
                                        alert("¡El alquiler de espacios requiere el Plan Center! Te redirigimos a Ajustes para mejorar tu suscripción. 🚀");
                                    }
                                }}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full",
                                        isActive && !isLocked
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    )
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </div>
                                {isLocked && (
                                    <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full animate-pulse shrink-0">
                                        Center ↑
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto border-t border-border pt-4">
                    <Button 
                        variant="ghost" 
                        onClick={handleLogout} 
                        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;