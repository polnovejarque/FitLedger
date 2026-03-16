import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Dumbbell, Calendar, DollarSign, BarChart3, Settings as SettingsIcon, LogOut, Shield } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

// Añadimos una propiedad "restricted: true" a los botones sensibles
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/dashboard/clients' },
    { icon: Dumbbell, label: 'Entrenamientos', path: '/dashboard/workouts' },
    { icon: Calendar, label: 'Agenda', path: '/dashboard/agenda' },
    { icon: DollarSign, label: 'Finanzas', path: '/dashboard/finance', restricted: true },
    { icon: BarChart3, label: 'Reportes', path: '/dashboard/reports', restricted: true },
    { icon: Shield, label: 'Mi Equipo', path: '/dashboard/team', restricted: true },
    { icon: SettingsIcon, label: 'Configuración', path: '/dashboard/settings', restricted: true },
];

const Sidebar = () => {
    const navigate = useNavigate();
    
    // Estados para la marca blanca
    const [businessName, setBusinessName] = useState('FitLeader');
    const [logoUrl, setLogoUrl] = useState('/logo.png');

    // NUEVO: Estado para guardar el rol (jefe o empleado)
    const [userRole, setUserRole] = useState('admin');

    // Cargar los datos del negocio y el ROL al iniciar
    useEffect(() => {
        const loadBusinessData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('business_name, logo_url, role') // <- Pedimos el rol a la base de datos
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    if (data.business_name) setBusinessName(data.business_name);
                    if (data.logo_url) setLogoUrl(data.logo_url);
                    if (data.role) setUserRole(data.role); // <- Guardamos el rol en la memoria
                }
            }
        };
        loadBusinessData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/'); 
    };

    // EL PORTERO: Filtramos el menú. Si es 'staff', le ocultamos los restringidos
    const visibleNavItems = navItems.filter(item => {
        if (userRole === 'staff' && item.restricted) {
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
                    {/* Imprimimos la lista filtrada, no la original */}
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