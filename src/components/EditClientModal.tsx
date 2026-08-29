import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, CreditCard, Save, Calendar, Clock, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface EditClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client: any;
    onUpdate: (updatedData: any) => void;
}

const DAYS_LIST = [
    { key: 'monday', label: 'Lunes', short: 'Lun' },
    { key: 'tuesday', label: 'Martes', short: 'Mar' },
    { key: 'wednesday', label: 'Miércoles', short: 'Mié' },
    { key: 'thursday', label: 'Jueves', short: 'Jue' },
    { key: 'friday', label: 'Viernes', short: 'Vie' },
    { key: 'saturday', label: 'Sábado', short: 'Sáb' },
    { key: 'sunday', label: 'Domingo', short: 'Dom' }
];

const AVAILABLE_HOURS = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', 
    '19:00', '20:00', '21:00'
];

const EditClientModal = ({ isOpen, onClose, client, onUpdate }: EditClientModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [plan, setPlan] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    
    // Objetivos y Limitaciones
    const [goals, setGoals] = useState('');
    const [limitations, setLimitations] = useState('');

    // Estados para Agenda Inteligente
    const [serviceType, setServiceType] = useState('presencial');
    const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
    const [checkinFrequency, setCheckinFrequency] = useState('monthly');
    const [checkinDuration, setCheckinDuration] = useState(30);
    
    // Selector interactivo de horarios
    const [activeDayKey, setActiveDayKey] = useState('monday');
    const [slotsByDay, setSlotsByDay] = useState<{ [day: string]: string[] }>({});

    useEffect(() => {
        if (isOpen && client) {
            setName(client.name || '');
            setEmail(client.email || '');
            setPhone(client.phone || '');
            setPlan(client.plan || '');
            setStatus(client.status ? client.status.toLowerCase() : 'active');
            
            // Cargar objetivos y limitaciones (tolerando array o texto)
            const initialGoals = client.goals 
                ? (Array.isArray(client.goals) ? client.goals.join('\n') : client.goals)
                : (client.objective || '');
            setGoals(initialGoals);

            const initialLim = client.limitations 
                ? (Array.isArray(client.limitations) ? client.limitations.join('\n') : client.limitations)
                : '';
            setLimitations(initialLim);

            // Cargar datos de servicio inteligente
            setServiceType(client.service_type || 'presencial');
            setSessionsPerWeek(client.sessions_per_week || 2);
            setCheckinFrequency(client.checkin_frequency || 'monthly');
            setCheckinDuration(client.checkin_duration || 30);

            // Cargar franjas horarias
            if (client.preferred_time_slots) {
                if (typeof client.preferred_time_slots === 'object' && !Array.isArray(client.preferred_time_slots)) {
                    setSlotsByDay(client.preferred_time_slots);
                } else if (typeof client.preferred_time_slots === 'string') {
                    try {
                        const parsed = JSON.parse(client.preferred_time_slots);
                        if (typeof parsed === 'object') setSlotsByDay(parsed);
                    } catch {
                        setSlotsByDay({});
                    }
                }
            } else {
                setSlotsByDay({});
            }
        }
    }, [isOpen, client]);

    if (!isOpen) return null;

    const toggleHour = (hour: string) => {
        setSlotsByDay(prev => {
            const currentHours = prev[activeDayKey] || [];
            const exists = currentHours.includes(hour);
            const newHours = exists 
                ? currentHours.filter(h => h !== hour)
                : [...currentHours, hour].sort();
            
            if (newHours.length === 0) {
                const copy = { ...prev };
                delete copy[activeDayKey];
                return copy;
            }
            return { ...prev, [activeDayKey]: newHours };
        });
    };

    const applyPreset = (preset: 'morning' | 'afternoon' | 'all' | 'clear') => {
        setSlotsByDay(prev => {
            if (preset === 'clear') {
                const copy = { ...prev };
                delete copy[activeDayKey];
                return copy;
            }
            let targetHours: string[] = [];
            if (preset === 'morning') targetHours = ['09:00', '10:00', '11:00', '12:00', '13:00'];
            if (preset === 'afternoon') targetHours = ['16:00', '17:00', '18:00', '19:00', '20:00'];
            if (preset === 'all') targetHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

            return { ...prev, [activeDayKey]: targetHours };
        });
    };

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
            sessions_per_week: serviceType === 'online' ? 0 : Number(sessionsPerWeek),
            checkin_frequency: checkinFrequency,
            checkin_duration: Number(checkinDuration),
            preferred_time_slots: serviceType !== 'online' && Object.keys(slotsByDay).length > 0 ? slotsByDay : null,
            objective: goals,
            limitations: limitations
        });
        onClose();
    };

    const selectedHoursForActiveDay = slotsByDay[activeDayKey] || [];
    const activeDaysCount = Object.keys(slotsByDay).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
                
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <User className="w-5 h-5 text-emerald-400" />
                        Editar Perfil del Atleta
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Nombre Completo</label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9 bg-background" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-9 bg-background" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Plan Contratado</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input value={plan} onChange={(e) => setPlan(e.target.value)} className="pl-9 bg-background" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Estado del Atleta</label>
                            <div className="flex bg-secondary/40 p-1 rounded-lg border border-border">
                                <button
                                    type="button"
                                    onClick={() => setStatus('active')}
                                    className={`flex-1 flex justify-center items-center rounded-md text-xs font-bold transition-all py-1.5 ${status === 'active' ? 'bg-emerald-500 text-black shadow' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    Activo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatus('inactive')}
                                    className={`flex-1 flex justify-center items-center rounded-md text-xs font-bold transition-all py-1.5 ${status === 'inactive' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-secondary'}`}
                                >
                                    Inactivo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN: SERVICIO Y HORARIOS INTELIGENTES */}
                    <div className="p-4 rounded-xl bg-secondary/20 border border-border/60 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-emerald-400" /> Servicio y Agenda Inteligente
                            </h3>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Opcional
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">Tipo de Servicio</label>
                                <select
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                                >
                                    <option value="presencial">📍 Presencial (1 a 1)</option>
                                    <option value="online">🌐 Online (Asesoría)</option>
                                    <option value="hibrido">⚡ Híbrido (Mixto)</option>
                                </select>
                            </div>

                            {serviceType !== 'online' && (
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">
                                        {serviceType === 'hibrido' ? 'Presenciales / sem' : 'Sesiones / sem'}
                                    </label>
                                    <select
                                        value={sessionsPerWeek}
                                        onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                                        className="w-full h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value={1}>1 sesión / sem</option>
                                        <option value={2}>2 sesiones / sem</option>
                                        <option value={3}>3 sesiones / sem</option>
                                        <option value={4}>4 sesiones / sem</option>
                                        <option value={5}>5 sesiones / sem</option>
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[11px] font-medium text-muted-foreground">Frecuencia Revisiones</label>
                                <select
                                    value={checkinFrequency}
                                    onChange={(e) => setCheckinFrequency(e.target.value)}
                                    className="w-full h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    <option value="none">Sin revisión</option>
                                    <option value="weekly">Semanal</option>
                                    <option value="biweekly">Quincenal</option>
                                    <option value="monthly">Mensual</option>
                                </select>
                            </div>

                            {checkinFrequency !== 'none' && (
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-muted-foreground">Duración Videollamada</label>
                                    <select
                                        value={checkinDuration}
                                        onChange={(e) => setCheckinDuration(Number(e.target.value))}
                                        className="w-full h-9 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value={15}>15 minutos</option>
                                        <option value={30}>30 minutos (Estándar)</option>
                                        <option value={45}>45 minutos</option>
                                        <option value={60}>60 minutos (1 hora)</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* MENSAJE EXPLICATIVO PARA ONLINE */}
                        {serviceType === 'online' && (
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-zinc-300 flex items-start gap-2">
                                <span className="text-base">🌐</span>
                                <div>
                                    <p className="font-semibold text-emerald-400">Atleta 100% Online</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        El atleta entrena de forma autónoma siguiendo su <strong>Plan Semanal</strong>. La Agenda Inteligente solo programará sus <strong>videollamadas de revisión ({checkinDuration} min)</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* SELECTOR INTERACTIVO DE FRANJAS HORARIAS (SÓLO PRESENCIAL E HÍBRIDO) */}
                        {serviceType !== 'online' && (
                            <div className="space-y-3 pt-2 border-t border-border/40">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-emerald-400" /> Franjas preferentes {serviceType === 'hibrido' ? 'para sesiones presenciales' : 'del atleta'}:
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">
                                        {activeDaysCount > 0 ? `${activeDaysCount} días configurados` : 'Disponibilidad abierta'}
                                    </span>
                                </div>

                                {/* Selector de Día */}
                                <div className="flex flex-wrap gap-1.5">
                                    {DAYS_LIST.map(d => {
                                        const hasHours = slotsByDay[d.key] && slotsByDay[d.key].length > 0;
                                        const isSelected = activeDayKey === d.key;
                                        return (
                                            <button
                                                key={d.key}
                                                type="button"
                                                onClick={() => setActiveDayKey(d.key)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                                                    isSelected 
                                                        ? 'bg-emerald-500 text-black shadow' 
                                                        : hasHours 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                                            : 'bg-background text-muted-foreground hover:bg-secondary border border-border'
                                                }`}
                                            >
                                                {d.label}
                                                {hasHours && !isSelected && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Checklist de horas para el día seleccionado */}
                                <div className="p-3 bg-background/80 rounded-xl border border-border space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-foreground">
                                            Horas disponibles el <span className="text-emerald-400">{DAYS_LIST.find(d => d.key === activeDayKey)?.label}</span>:
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => applyPreset('morning')}
                                                className="text-[10px] px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                                            >
                                                09-13h
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => applyPreset('afternoon')}
                                                className="text-[10px] px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                                            >
                                                16-20h
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => applyPreset('clear')}
                                                className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                                        {AVAILABLE_HOURS.map(hour => {
                                            const isChecked = selectedHoursForActiveDay.includes(hour);
                                            return (
                                                <button
                                                    key={hour}
                                                    type="button"
                                                    onClick={() => toggleHour(hour)}
                                                    className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all text-center flex items-center justify-center gap-1 ${
                                                        isChecked
                                                            ? 'bg-emerald-500 text-black font-bold shadow'
                                                            : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50'
                                                    }`}
                                                >
                                                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                                    {hour}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* OBJETIVOS Y LIMITACIONES */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Objetivos del Atleta</label>
                        <textarea
                            value={goals}
                            onChange={(e) => setGoals(e.target.value)}
                            className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                            placeholder="Ganar masa muscular, Perder grasa..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-muted-foreground">Limitaciones / Lesiones</label>
                        <textarea
                            value={limitations}
                            onChange={(e) => setLimitations(e.target.value)}
                            className="flex min-h-[50px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                            placeholder="Tendinitis hombro derecho, dolor lumbar..."
                        />
                    </div>

                    <div className="pt-3 flex gap-3 border-t border-border">
                        <Button type="button" variant="outline" onClick={onClose} className="flex-1 text-xs">
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 gap-2 bg-emerald-500 text-black font-bold hover:bg-emerald-400 text-xs">
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