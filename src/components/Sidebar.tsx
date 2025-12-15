import { LayoutDashboard, Users, Dumbbell, Calendar, DollarSign, BarChart3, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Clientes', path: '/dashboard/clients' },
    { icon: Dumbbell, label: 'Entrenamientos', path: '/dashboard/workouts' },
    { icon: Calendar, label: 'Agenda', path: '/dashboard/agenda' },
    { icon: DollarSign, label: 'Finanzas', path: '/dashboard/finance' },
    { icon: BarChart3, label: 'Reportes', path: '/dashboard/reports' },
];

const Sidebar = () => {
    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-10 flex items-center px-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <span className="text-xl font-bold">FL</span>
                    </div>
                    <span className="ml-3 text-xl font-bold tracking-tight">FitLedger</span>
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
