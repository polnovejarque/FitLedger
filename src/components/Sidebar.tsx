import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Dumbbell, Calendar, DollarSign, BarChart3, Settings as SettingsIcon, LogOut, Shield, Box } from 'lucide-react';
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
                // 1. Buscamos el perfil y ahora también pedimos el "plan"
                const { data } = await supabase
                    .from('profiles')
                    .select('business_name, logo_url, role, studio_id, plan') 
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    setUserRole(data.role || 'admin');
                    setUserPlan(data.plan || 'pro'); // Guardamos el plan que paga

                    // 2. LÓGICA DE MARCA BLANCA INTELIGENTE
                    if (data.role === 'staff' && data.studio_id) {
                        // Si es empleado, buscamos cómo se llama el centro de su jefe
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
        
        // 2. Si es una función exclusiva de Studio, ocultarla a los demás planes
        if (item.studioOnly && userPlan !== 'studio') {
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
                    {visibleNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-accent text-accent-foreground"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </NavLink>
                    ))}
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