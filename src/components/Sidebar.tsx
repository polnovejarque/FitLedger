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
        <aside className="h-screen w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col rounded-r-3xl">
            <div className="flex h-full flex-col px-6 py-8">
                
                {/* --- LOGO Y MARCA DINÁMICOS --- */}
                <div className="mb-12 flex items-center">
                    <Link to="/dashboard" className="flex items-center gap-4 w-full">
                        {logoUrl ? (
                            <img 
                                src={logoUrl} 
                                alt={displayName} 
                                className="h-10 w-10 object-cover rounded-xl bg-zinc-800 border border-zinc-700" 
                            />
                        ) : (
                            // Recuperamos el logo original de FitLeader por defecto
                            <img 
                                src="/logo.png" 
                                alt="FitLeader" 
                                className="h-10 w-10 object-contain" 
                            />
                        )}
                        <span 
                            className="text-2xl font-bold tracking-tight text-white truncate" 
                            title={displayName}
                        >
                            {displayName}
                        </span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-2">
                    {visibleNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 backdrop-blur-xl",
                                    isActive
                                        ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
                                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent hover:border-zinc-700"
                                )
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto border-t border-zinc-800 pt-6">
                    <Button 
                        variant="ghost" 
                        onClick={handleLogout} 
                        className="w-full justify-start gap-4 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-2xl px-4 py-3 transition-all duration-200"
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