import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, CreditCard, Save } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: any;
    onUpdate: (updatedData: any) => void;
}

const EditClientModal = ({ isOpen, onClose, client, onUpdate }: EditClientModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [plan, setPlan] = useState('');
    const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
    
    // Nuevos estados para Objetivos y Limitaciones
    const [goals, setGoals] = useState('');
    const [limitations, setLimitations] = useState('');

    // Estados para Agenda Inteligente
    const [serviceType, setServiceType] = useState('presencial');
    const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
    const [checkinFrequency, setCheckinFrequency] = useState('monthly');
    const [preferredTimeSlotsStr, setPreferredTimeSlotsStr] = useState('');

    useEffect(() => {
        if (isOpen && client) {
            setName(client.name || '');
            setEmail(client.email || '');
            setPhone(client.phone || '');
            setPlan(client.plan || '');
            setStatus(client.status || 'Active');
            
            // Convertimos la lista a texto (uno por línea) para poder editarlo
            setGoals(client.goals ? client.goals.join('\n') : '');
            setLimitations(client.limitations ? client.limitations.join('\n') : '');

            // Cargar datos de servicio inteligente
            setServiceType(client.service_type || 'presencial');
            setSessionsPerWeek(client.sessions_per_week || 2);
            setCheckinFrequency(client.checkin_frequency || 'monthly');
            setPreferredTimeSlotsStr(
                client.preferred_time_slots 
                    ? (typeof client.preferred_time_slots === 'string' 
                        ? client.preferred_time_slots 
                        : JSON.stringify(client.preferred_time_slots))
                    : ''
            );
        }
    }, [isOpen, client]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate({
            id: client?.id,
            name,
            email,
            phone,
            plan,
            status,
            service_type: serviceType,
            sessions_per_week: Number(sessionsPerWeek),
            checkin_frequency: checkinFrequency,
            preferred_time_slots: preferredTimeSlotsStr,
            // Convertimos el texto de vuelta a lista (separando por saltos de línea)
            goals: goals.split('\n').filter(line => line.trim() !== ''),
            limitations: limitations.split('\n').filter(line => line.trim() !== '')
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-accent" />
                        Editar Perfil
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 bg-background" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9 bg-background" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Plan</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={plan} onChange={(e) => setPlan(e.target.value)} className="pl-9 bg-background" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Estado</label>
                            <div className="flex bg-secondary/30 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setStatus('Active')}
                                    className={`flex-1 flex justify-center items-center rounded-md text-xs font-medium transition-all py-2 ${status === 'Active' ? 'bg-green-600 text-white shadow' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    Activo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('Inactive')}
                                    className={`flex-1 flex justify-center items-center rounded-md text-xs font-medium transition-all py-2 ${status === 'Inactive' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    Inactivo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* NUEVOS CAMPOS - PREFERENCIAS DE AGENDAMIENTO INTELIGENTE */}
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border/50 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                📅 Servicio y Agenda Inteligente
                            </h3>
                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Opcional
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Tipo de Servicio</label>
                                <select
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="presencial">Presencial</option>
                                    <option value="online">Online</option>
                                    <option value="hibrido">Híbrido</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Sesiones / semana</label>
                                <select
                                    value={sessionsPerWeek}
                                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value={1}>1 sesión / semana</option>
                                    <option value={2}>2 sesiones / semana</option>
                                    <option value={3}>3 sesiones / semana</option>
                                    <option value={4}>4 sesiones / semana</option>
                                    <option value={5}>5 sesiones / semana</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Frecuencia de Revisiones</label>
                                <select
                                    value={checkinFrequency}
                                    onChange={(e) => setCheckinFrequency(e.target.value)}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="none">Sin revisiones</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="biweekly">Quincenal (Cada 2 sem)</option>
                                    <option value="monthly">Mensual</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Franjas preferidas (opcional)</label>
                                <Input
                                    value={preferredTimeSlotsStr}
                                    onChange={(e) => setPreferredTimeSlotsStr(e.target.value)}
                                    placeholder="Ej: Lun 09-13, Jue 16-20"
                                    className="bg-background text-xs h-9"
                                />
                            </div>
                        </div>
                    </div>

                    {/* NUEVOS CAMPOS */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Objetivos (uno por línea)</label>
                        <textarea
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ganar masa muscular&#10;Perder grasa"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Limitaciones / Lesiones</label>
                        <textarea
                            value={limitations}
                            onChange={(e) => setLimitations(e.target.value)}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Dolor de espalda&#10;Asma"
                        />
                    </div>

                    <div className="pt-4 flex gap-3 border-t border-border/50">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 gap-2">
                            <Save className="w-4 h-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditClientModal;