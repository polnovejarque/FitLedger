import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const handleThemeChange = () => {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            setTheme(currentTheme);
            if (currentTheme === 'light') {
                document.documentElement.classList.add('light');
                document.documentElement.classList.remove('dark');
            } else {
                document.documentElement.classList.add('dark');
                document.documentElement.classList.remove('light');
            }
        };
        
        handleThemeChange();
        
        window.addEventListener('storage', handleThemeChange);
        window.addEventListener('theme-change', handleThemeChange);
        return () => {
            window.removeEventListener('storage', handleThemeChange);
            window.removeEventListener('theme-change', handleThemeChange);
            document.documentElement.classList.remove('light', 'dark');
        };
    }, []);

    return (
        <div className={cn(
            "min-h-screen bg-background font-sans antialiased text-foreground transition-colors duration-200",
            theme === 'light' ? 'light' : ''
        )}>
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-16 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors text-foreground"
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
                <h1 className="ml-4 text-lg font-semibold text-foreground">FitLeader</h1>
            </div>

            {/* Mobile Overlay - Only show when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Wrapper - Controls visibility */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 z-50 transition-transform duration-300 ease-in-out",
                "bg-card border-r border-border",
                // Mobile: slide in/out
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible
                "md:translate-x-0"
            )}>
                <Sidebar />
            </aside>

            {/* Main Content - Responsive padding */}
            <main className={cn(
                "min-h-screen transition-all duration-300 ease-in-out",
                // Mobile: account for header
                "pt-16 md:pt-0",
                // Desktop: account for sidebar
                "md:ml-64"
            )}>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
