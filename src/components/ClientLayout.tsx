import { Outlet, NavLink } from 'react-router-dom';
import { Home, ClipboardList, TrendingUp, User, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

const bottomNavItems = [
    { icon: Home, label: 'Inicio', path: '/client' },
    { icon: ClipboardList, label: 'Rutina', path: '/client/workout' },
    { icon: TrendingUp, label: 'Progreso', path: '/client/progress' },
    { icon: User, label: 'Perfil', path: '/client/profile' },
];

const ClientLayout = () => {
    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Container */}
            <div className="max-w-md mx-auto min-h-screen bg-background relative pb-20">
                {/* Top Bar - Sticky */}
                <header className="sticky top-0 z-40 bg-card border-b border-border">
                    <div className="flex items-center justify-between px-4 py-3">
                        <div className="flex-1"></div>
                        <div className="flex items-center justify-center">
                            <img src="/fitleader-logo.png" alt="FitLeader" className="h-12 object-contain" />
                        </div>
                        <div className="flex-1 flex justify-end">
                            <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
                                <Bell className="w-5 h-5 text-foreground" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="min-h-[calc(100vh-120px)]">
                    <Outlet />
                </main>

                {/* Bottom Navigation - Fixed */}
                <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center justify-around">
                            {bottomNavItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            cn(
                                                "flex flex-col items-center justify-center gap-1 py-3 px-4 min-h-[60px] flex-1 transition-colors",
                                                isActive
                                                    ? "text-accent"
                                                    : "text-muted-foreground"
                                            )
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
                                                <span className="text-[10px] font-medium">{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
};

export default ClientLayout;
