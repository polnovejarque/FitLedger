import { useState } from 'react';
import { X, UserPlus, Mail, CheckCircle2, XCircle } from 'lucide-react'; // Iconos nuevos
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddClient: (client: { name: string; email: string; status: 'Active' | 'Inactive' }) => void;
}

const AddClientModal = ({ isOpen, onClose, onAddClient }: AddClientModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Evita recargas raras
        if (name.trim() && email.trim()) {
            onAddClient({ name, email, status });
            // Reset form
            setName('');
            setEmail('');
            setStatus('Active');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            {/* Modal Container con fondo SÓLIDO */}
            <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200 relative">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-accent" />
                        Añadir Nuevo Cliente
                    </h2>
                    <button 
                        onClick={onClose} 
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Juan García"
                            autoFocus
                            className="bg-background" // Asegura contraste
                        />
                    </div>

                    {/* Email Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="juan@ejemplo.com"
                                className="pl-9 bg-background"
                            />
                        </div>
                    </div>

                    {/* Status Selection (Botones en vez de lista fea) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Estado Inicial</label>
                        <div className="flex gap-2 p-1 bg-secondary/30 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setStatus('Active')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                                    status === 'Active' 
                                    ? 'bg-green-600 text-white shadow-md' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                            >
                                <CheckCircle2 className="w-4 h-4" /> Activo
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatus('Inactive')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                                    status === 'Inactive' 
                                    ? 'bg-red-500/80 text-white shadow-md' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                                }`}
                            >
                                <XCircle className="w-4 h-4" /> Inactivo
                            </button>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border/50">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={!name.trim() || !email.trim()}
                        >
                            Guardar Cliente
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddClientModal;