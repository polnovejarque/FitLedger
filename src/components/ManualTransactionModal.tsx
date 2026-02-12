import { useState, useEffect } from 'react';
import { X, Save, DollarSign, Calendar, CreditCard } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ManualTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: {
        description: string;
        amount: number;
        category: 'Ingreso' | 'Gasto';
        date: string;
        paymentMethod: string;
    }) => void;
}

const ManualTransactionModal = ({ isOpen, onClose, onSave }: ManualTransactionModalProps) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<'Ingreso' | 'Gasto'>('Ingreso');
    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (isOpen) {
            setDescription('');
            setAmount('');
            setCategory('Ingreso');
            setPaymentMethod('Efectivo');
            setDate(new Date().toISOString().split('T')[0]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            description,
            amount: parseFloat(amount) * (category === 'Gasto' ? -1 : 1),
            category,
            date,
            paymentMethod,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Añadir Transacción Manual</h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Descripción</label>
                        <Input
                            placeholder="Ej: Pago Mensualidad Juan"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Monto (€)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="pl-9"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Fecha</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="date"
                                    className="pl-9"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* CATEGORÍA: Ahora con colores fuertes */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Categoría</label>
                            <div className="flex bg-secondary/30 p-1 rounded-lg gap-1">
                                <button
                                    type="button"
                                    onClick={() => setCategory('Ingreso')}
                                    className={`flex-1 text-sm py-2 rounded-md transition-all font-medium ${
                                        category === 'Ingreso' 
                                        ? 'bg-green-600 text-white shadow-md scale-105' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                                >
                                    Ingreso 💰
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCategory('Gasto')}
                                    className={`flex-1 text-sm py-2 rounded-md transition-all font-medium ${
                                        category === 'Gasto' 
                                        ? 'bg-red-600 text-white shadow-md scale-105' 
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                                >
                                    Gasto 💸
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Método de Pago</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="Efectivo">Efectivo 💵</option>
                                    <option value="Tarjeta">Tarjeta 💳</option>
                                    <option value="Transferencia">Transferencia 🏦</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 gap-2">
                            <Save className="w-4 h-4" />
                            Guardar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualTransactionModal;