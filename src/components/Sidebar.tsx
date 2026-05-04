import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Dumbbell, Calendar, DollarSign, BarChart3, Settings as SettingsIcon, LogOut, Shield, Box } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

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
    
    const [businessName, setBusinessName] = useState<string | null>(null);
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [userRole, setUserRole] = useState('admin');
    const [userPlan, setUserPlan] = useState('pro');

    useEffect(() => {
        const loadBusinessData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // SOLUCIÓN: Usamos select('*') igual que en Settings para evitar cuelgues por columnas faltantes
            const { data, error } = await supabase
                .from('profiles')
                .select('*') 
                .eq('id', user.id)
                .single();
            
            if (error) {
                console.error("Error al cargar el Sidebar:", error.message);
                return;
            }
            
            if (data) {
                setUserRole(data.role || 'admin');
                setUserPlan(data.plan || 'pro');

                if (data.role === 'staff' && data.studio_id) {
                    // Si es empleado, buscamos a su jefe con select('*') también
                    const { data: studioData } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.studio_id)
                        .single();
                        
                    if (studioData) {
                        setBusinessName(studioData.business_name);
                        setLogoUrl(studioData.logo_url);
                    }
                } else {
                    // Si es el dueño, pintamos sus datos
                    setBusinessName(data.business_name);
                    setLogoUrl(data.logo_url);
                }
            }
        };
        loadBusinessData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/'); 
    };

    const visibleNavItems = navItems.filter(item => {
        if (userRole === 'staff' && item.restricted) return false;
        if (item.studioOnly && userPlan !== 'studio') return false;
        return true;
    });

    // Filtro visual
    const displayName = businessName || 'FitLeader';

    return (
        <aside className="h-screen w-64 bg-background border-r border-border flex flex-col">
            <div className="flex h-full flex-col px-3 py-4">
                
                {/* --- LOGO Y MARCA DINÁMICOS --- */}
                <div className="mb-8 flex items-center px-2">
                    <Link to="/dashboard" className="flex items-center gap-3 w-full">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt={displayName} 
                                className="h-8 w-8 object-cover rounded-md bg-zinc-900 border border-zinc-800" 
                            />
                        ) : (
                            // Recuperamos el logo original de FitLeader por defecto
                            <img 
                                src="/logo.png" 
                                alt="FitLeader" 
                                className="h-8 w-8 object-contain" 
                            />
                        )}
                        <span 
                            className="text-xl font-bold tracking-tight text-white truncate" 
                            title={displayName}
                        >
                            {displayName}
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