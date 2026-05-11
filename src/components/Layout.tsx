import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '../lib/utils';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-black font-sans antialiased text-white">
            {/* Mobile Header with Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-900 border-b border-zinc-800 h-16 flex items-center px-4">
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-white"
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Menu className="w-6 h-6" />
                    )}
                </button>
                <h1 className="ml-4 text-lg font-semibold text-white">FitLeader</h1>
            </div>

            {/* Mobile Overlay - Only show when sidebar is open */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Wrapper - Controls visibility */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-64 z-50 transition-transform duration-300 ease-in-out",
                "bg-zinc-900 border-r border-zinc-800 shadow-2xl rounded-r-3xl",
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
