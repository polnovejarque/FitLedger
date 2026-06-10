import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Dumbbell, Calendar, DollarSign, BarChart3, Settings as SettingsIcon, LogOut, Shield, Box, Building2 } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
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
    { icon: Building2, label: 'Alquiler Espacios', path: '/dashboard/center', restricted: true },
    { icon: SettingsIcon, label: 'Configuración', path: '/dashboard/settings', restricted: true },
];

const Sidebar = () => {
    const navigate = useNavigate();
    
    const [businessName, setBusinessName] = useState('FitLeader');
    const [logoUrl, setLogoUrl] = useState('/logo.png');
    const [userRole, setUserRole] = useState('admin');
    const [userPlan, setUserPlan] = useState('pro');

    useEffect(() => {
        const loadBusinessData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
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

    const visibleNavItems = navItems.filter(item => {
        if (userRole === 'staff' && item.restricted) return false;
        if (item.studioOnly && userPlan !== 'studio' && userPlan !== 'center') return false;
        if (item.path === '/dashboard/center' && userPlan !== 'center') return false;
        return true;
    });

    return (
        <aside className="h-screen w-64 flex flex-col sidebar-shell">
            <div className="flex h-full flex-col px-3 py-5">

                {/* LOGO Y MARCA */}
                <div className="mb-5 px-2">
                    <Link to="/dashboard" className="flex items-center gap-3 w-full">
                        <div className="h-9 w-9 rounded-xl overflow-hidden flex items-center justify-center sidebar-logo-bg flex-shrink-0">
                            <img
                                src={logoUrl}
                                alt={businessName}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <span
                            className="text-lg font-bold tracking-tight sidebar-brand truncate"
                            title={businessName}
                        >
                            {businessName}
                        </span>
                    </Link>
                </div>

                {/* SEPARADOR */}
                <div className="sidebar-divider mb-3" />

                {/* NAV ITEMS — cada uno como pastilla individual */}
                <nav className="flex-1 space-y-1 overflow-y-auto">
                    {visibleNavItems.map((item) => {
                        const isLocked = item.path === '/dashboard/center' && userPlan !== 'center';

                        return (
                            <NavLink
                                key={item.path}
                                to={isLocked ? '/dashboard/settings' : item.path}
                                end={item.path === '/dashboard'}
                                onClick={() => {
                                    if (isLocked) {
                                        alert('¡El alquiler de espacios requiere el Plan Center! Te redirigimos a Ajustes para mejorar tu suscripción. 🚀');
                                    }
                                }}
                                className={({ isActive }) =>
                                    `flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                        isActive && !isLocked
                                            ? 'sidebar-item-active'
                                            : 'sidebar-item-inactive'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon
                                        className="flex-shrink-0"
                                        style={{ width: '1.0625rem', height: '1.0625rem' }}
                                    />
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

                {/* FOOTER — Cerrar sesión */}
                <div className="mt-3 pt-3 sidebar-divider-top">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 sidebar-logout"
                    >
                        <LogOut className="flex-shrink-0" style={{ width: '1.0625rem', height: '1.0625rem' }} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;