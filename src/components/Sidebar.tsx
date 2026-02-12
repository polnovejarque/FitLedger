import { LayoutDashboard, Users, Dumbbell, Calendar, DollarSign, BarChart3, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/dashboard/clients' },
    { icon: Dumbbell, label: 'Entrenamientos', path: '/dashboard/workouts' },
    { icon: Calendar, label: 'Agenda', path: '/dashboard/agenda' },
    { icon: DollarSign, label: 'Finanzas', path: '/dashboard/finance' },
    { icon: BarChart3, label: 'Reportes', path: '/dashboard/reports' },
    { icon: SettingsIcon, label: 'Configuración', path: '/dashboard/settings' },
];

const Sidebar = () => {
    return (
        <aside className="h-screen w-64 bg-background border-r border-border">
            <div className="flex h-full flex-col px-3 py-4">
                {/* --- LOGO ACTUALIZADO --- */}
                <div className="mb-8 flex items-center px-2">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <img src="/logo.png" alt="FitLeader" className="h-8 w-8 object-contain" />
                        <span className="text-xl font-bold tracking-tight text-foreground">FitLeader</span>
                    </Link>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
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
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive">
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;