import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ToastProps {
    id: string;
    message: string;
    type?: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
    onClose: (id: string) => void;
}

const Toast = ({ id, message, type = 'info', duration = 3000, onClose }: ToastProps) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: Info,
        warning: AlertCircle,
    };

    const Icon = icons[type];

    const styles = {
        success: 'bg-accent/10 text-accent border-accent/20',
        error: 'bg-destructive/10 text-destructive border-destructive/20',
        info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    };

    return (
        <div
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm animate-in slide-in-from-top-5 fade-in',
                styles[type]
            )}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{message}</p>
            <button
                onClick={() => onClose(id)}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Toast;
