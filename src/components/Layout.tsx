import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background font-sans antialiased">
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-card border-b border-border h-16 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
                <h1 className="ml-4 text-lg font-semibold">FitLeader</h1>
            </div>

            {/* Mobile Overlay - Only show when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Wrapper - Controls visibility */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 z-50 transition-transform duration-300 ease-in-out",
                "bg-card border-r border-border shadow-2xl",
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
                "pt-16 md:pt-0", // Top padding on mobile for fixed header
                "md:pl-64" // Left padding on desktop for sidebar
            )}>
                <div className="container mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
