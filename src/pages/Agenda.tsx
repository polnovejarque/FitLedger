import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
    Clock, MapPin, X, Trash2, AlignLeft, Check, Loader2, Users, Box, Copy,
    Sparkles, Lock, Settings, Wand2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface AgendaEvent {
    id: number;
    dbId?: number;
    title: string;
    type: 'training' | 'checkin' | 'call' | 'group';
    day: number;      
    startHour: number; 
    duration: number;  
    location: string;
    notes?: string;    
    max_capacity?: number;
    assigned_staff_id?: string;
    bookedCount?: number;
    attendees?: { name: string; status: string }[];
    is_public?: boolean;
    dropin_price?: number;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 a 22:00
const DAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const getMonday = (d: Date) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    return new Date(d.setDate(diff));
};

const Agenda = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState<number[]>([]);
    const [weekDisplay, setWeekDisplay] = useState("");
    const [events, setEvents] = useState<AgendaEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Contexto del Coach / Studio
    const [userRole, setUserRole] = useState('admin');
    const [userPlan, setUserPlan] = useState('pro');
    const [studioId, setStudioId] = useState<string | null>(null);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [inventoryList, setInventoryList] = useState<any[]>([]);
    const [clientsList, setClientsList] = useState<any[]>([]);

    // Horarios laborales del Coach
    const [workingHours, setWorkingHours] = useState<any>({
        monday: { active: true, start: "08:00", end: "20:00" },
        tuesday: { active: true, start: "08:00", end: "20:00" },
        wednesday: { active: true, start: "08:00", end: "20:00" },
        thursday: { active: true, start: "08:00", end: "20:00" },
        friday: { active: true, start: "08:00", end: "20:00" },
        saturday: { active: false, start: "09:00", end: "14:00" },
        sunday: { active: false, start: "09:00", end: "14:00" }
    });
    const [defaultSessionDuration, setDefaultSessionDuration] = useState(60);

    // Modales y Estados
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSmartModalOpen, setIsSmartModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationSummary, setGenerationSummary] = useState<string | null>(null);

    const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null); 
    const [draggedEventId, setDraggedEventId] = useState<number | null>(null);
    
    // Controlar el tipo de evento en tiempo real en el formulario
    const [formEventType, setFormEventType] = useState('training');
    
    // Estado para el feedback visual al copiar el enlace
    const [copiedLink, setCopiedLink] = useState(false);

    useEffect(() => {
        const monday = getMonday(currentDate);
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const nextDay = new Date(monday);
            nextDay.setDate(monday.getDate() + i);
            dates.push(nextDay.getDate());
        }
        setWeekDates(dates);
        
        const lastDay = new Date(monday);
        lastDay.setDate(monday.getDate() + 6);
        
        const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
        setWeekDisplay(`${monday.getDate()} - ${lastDay.getDate()} ${lastDay.toLocaleDateString('es-ES', options)}`);
        
        loadInitialData(monday, lastDay);
    }, [currentDate]);

    const loadInitialData = async (start: Date, end: Date) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Averiguar quién es el usuario y su plan
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, studio_id, plan, working_hours, default_session_duration')
            .eq('id', user.id)
            .single();
        
        const role = profile?.role || 'admin';
        const currentStudioId = role === 'admin' ? user.id : profile?.studio_id;
        
        setUserRole(role);
        setStudioId(currentStudioId);
        if (profile?.plan) setUserPlan(profile.plan);
        if (profile?.working_hours) setWorkingHours(profile.working_hours);
        if (profile?.default_session_duration) setDefaultSessionDuration(profile.default_session_duration);

        // 2. Cargar clientes del coach para la asignación inteligente
        const { data: clientsData } = await supabase
            .from('clients')
            .select('id, name, service_type, sessions_per_week, checkin_frequency, preferred_time_slots')
            .eq('coach_id', user.id)
            .eq('status', 'Active');
        if (clientsData) setClientsList(clientsData);

        // 2.1 Si es Admin, cargar su equipo y su inventario para los desplegables
        if (role === 'admin') {
            const { data: staff } = await supabase.from('profiles').select('id, business_name, email').eq('studio_id', currentStudioId).eq('role', 'staff');
            setStaffList(staff || []);

            const { data: inv } = await supabase.from('inventory').select('*').eq('studio_id', currentStudioId);
            setInventoryList(inv || []);
        }

        // 3. Cargar Eventos
        const startIso = start.toISOString();
        const endIso = new Date(end.setDate(end.getDate() + 1)).toISOString();

        let query = supabase.from('calendar_events').select('*').gte('date', startIso).lt('date', endIso);

        // Si es admin ve todas las clases del centro. Si es staff, solo las que se le han asignado.
        if (role === 'admin') {
            query = query.eq('studio_id', currentStudioId);
        } else {
            query = query.eq('assigned_staff_id', user.id);
        }

        const { data } = await query;

        if (data) {
            // 4. Traer las reservas de estos eventos para ver los asistentes
            const eventIds = data.map(ev => ev.id);
            let bookingsData: any[] = [];
            
            if (eventIds.length > 0) {
                const { data: bData } = await supabase
                    .from('class_bookings')
                    .select('event_id, status, clients(name)')
                    .in('event_id', eventIds);
                if (bData) bookingsData = bData;
            }

            const formattedEvents: AgendaEvent[] = data.map(ev => {
                const eventDate = new Date(ev.date);
                let dayIndex = eventDate.getDay() - 1;
                if (dayIndex === -1) dayIndex = 6;

                // Calculamos reservas para este evento
                const evBookings = bookingsData.filter(b => b.event_id === ev.id);
                const bookedCount = evBookings.filter(b => b.status === 'booked').length;
                const attendees = evBookings.map(b => ({
                    name: (b.clients as any)?.name || 'Atleta',
                    status: b.status
                }));

                return {
                    id: ev.id,
                    dbId: ev.id,
                    title: ev.title,
                    type: ev.type as any,
                    day: dayIndex,
                    startHour: eventDate.getHours() + (eventDate.getMinutes() / 60),
                    duration: ev.duration || 1,
                    location: ev.location || "",
                    notes: ev.description || "",
                    max_capacity: ev.max_capacity,
                    assigned_staff_id: ev.assigned_staff_id,
                    bookedCount,
                    attendees,
                    is_public: ev.is_public,
                    dropin_price: ev.dropin_price
                };
            });
            setEvents(formattedEvents);
        }
        setLoading(false);
    };

    const handleCellClick = (dayIndex: number, hour: number) => {
        setEditingEvent({
            id: 0, title: "", type: "training", day: dayIndex, startHour: hour, duration: 1, location: "", notes: ""
        });
        setFormEventType("training");
        setIsModalOpen(true);
    };

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedEventId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

    const handleDrop = async (e: React.DragEvent, dayIndex: number, hour: number) => {
        e.preventDefault();
        if (draggedEventId === null) return;

        const eventToUpdate = events.find(ev => ev.id === draggedEventId);
        if (!eventToUpdate) return;

        const updatedEvents = events.map(ev => {
            if (ev.id === draggedEventId) return { ...ev, day: dayIndex, startHour: hour };
            return ev;
        });
        setEvents(updatedEvents);
        setDraggedEventId(null);

        const monday = getMonday(currentDate);
        const newDate = new Date(monday);
        newDate.setDate(monday.getDate() + dayIndex);
        newDate.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

        await supabase.from('calendar_events').update({ date: newDate.toISOString() }).eq('id', eventToUpdate.dbId || eventToUpdate.id);
    };
    
    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const day = parseInt(formData.get('day') as string);
        const startHour = parseFloat(formData.get('startHour') as string);
        const duration = parseFloat(formData.get('duration') as string);
        const location = formData.get('location') as string;
        const notes = formData.get('notes') as string;

        // Nuevos campos para clases públicas
        const is_public = formData.get('is_public') === 'on';
        const dropin_price = is_public ? parseFloat(formData.get('dropin_price') as string) || 0 : null;

        // Nuevos campos para Studio
        let assigned_staff_id = user.id; 
        let inventory_id = null;
        let max_capacity = 1; 

        if (type === 'group' && userRole === 'admin') {
            assigned_staff_id = formData.get('assigned_staff_id') as string || user.id;
            const selectedInvId = formData.get('inventory_id') as string;
            if (selectedInvId) {
                inventory_id = selectedInvId;
                const invItem = inventoryList.find(i => i.id === selectedInvId);
                if (invItem) max_capacity = invItem.quantity;
            } else {
                max_capacity = parseInt(formData.get('manual_capacity') as string) || 15; 
            }
        }

        const monday = getMonday(currentDate);
        const eventDate = new Date(monday);
        eventDate.setDate(monday.getDate() + day);
        eventDate.setHours(Math.floor(startHour), (startHour % 1) * 60, 0, 0);

        const newEventData = {
            coach_id: user.id, 
            studio_id: studioId, 
            title, 
            type, 
            date: eventDate.toISOString(), 
            duration, 
            location, 
            description: notes,
            assigned_staff_id,
            inventory_id,
            max_capacity,
            is_public,
            dropin_price
        };

        if (!editingEvent || editingEvent.id === 0) {
            const { data } = await supabase.from('calendar_events').insert([newEventData]).select().single();
            if (data) {
                const monday = getMonday(currentDate);
                const lastDay = new Date(monday);
                lastDay.setDate(monday.getDate() + 6);
                loadInitialData(monday, lastDay);
            }
        } else {
            await supabase.from('calendar_events').update(newEventData).eq('id', editingEvent.dbId || editingEvent.id);
            const monday = getMonday(currentDate);
            const lastDay = new Date(monday);
            lastDay.setDate(monday.getDate() + 6);
            loadInitialData(monday, lastDay);
        }
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = async (id: number) => {
        if (!confirm("¿Borrar evento? Se cancelarán las reservas de los clientes.")) return;
        setEvents(events.filter(ev => ev.id !== id));
        setIsModalOpen(false);
        await supabase.from('calendar_events').delete().eq('id', id);
    };

    const changeWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentDate(newDate);
    };

    // --- MOTOR DE AUTO-PROGRAMACIÓN INTELIGENTE (PLAN ELITE) ---
    const handleSmartAutoSchedule = async () => {
        setIsGenerating(true);
        setGenerationSummary(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setIsGenerating(false);
            return;
        }

        const monday = getMonday(currentDate);
        const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        let createdCount = 0;
        let checkinCount = 0;
        const newDbEvents: any[] = [];

        // Obtener eventos ya existentes esta semana para evitar colisiones
        const occupiedSlots = new Set<string>();
        events.forEach(ev => {
            occupiedSlots.add(`${ev.day}-${ev.startHour}`);
        });

        // Iterar clientes activos con servicio configurado
        for (const client of clientsList) {
            const sessionsWanted = client.sessions_per_week || 2;
            let scheduledForClient = 0;

            // Intentar agendar días preferentes si existen
            let preferredDaysIndices: number[] = [];
            let preferredHourStart = 9;
            let preferredHourEnd = 13;

            if (client.preferred_time_slots) {
                const prefStr = typeof client.preferred_time_slots === 'string' 
                    ? client.preferred_time_slots.toLowerCase() 
                    : JSON.stringify(client.preferred_time_slots).toLowerCase();

                if (prefStr.includes('lun')) preferredDaysIndices.push(0);
                if (prefStr.includes('mar')) preferredDaysIndices.push(1);
                if (prefStr.includes('mié') || prefStr.includes('mie')) preferredDaysIndices.push(2);
                if (prefStr.includes('jue')) preferredDaysIndices.push(3);
                if (prefStr.includes('vie')) preferredDaysIndices.push(4);
                if (prefStr.includes('sáb') || prefStr.includes('sab')) preferredDaysIndices.push(5);
            }

            // Si no tiene días preferidos, repartir en días alternos (Lun, Mié, Vie o Mar, Jue)
            if (preferredDaysIndices.length === 0) {
                preferredDaysIndices = sessionsWanted <= 2 ? [1, 3] : [0, 2, 4];
            }

            // Buscar huecos libres para cada sesión requerida
            for (const dayIdx of preferredDaysIndices) {
                if (scheduledForClient >= sessionsWanted) break;

                const dayKey = dayNames[dayIdx];
                const dayConfig = workingHours[dayKey];
                if (!dayConfig || !dayConfig.active) continue;

                const startLimit = parseInt(dayConfig.start.split(':')[0]) || 8;
                const endLimit = parseInt(dayConfig.end.split(':')[0]) || 20;

                // Buscar primer slot libre dentro de las horas laborables
                for (let h = Math.max(startLimit, preferredHourStart); h < Math.min(endLimit, preferredHourEnd + 1); h++) {
                    const slotKey = `${dayIdx}-${h}`;
                    if (!occupiedSlots.has(slotKey)) {
                        // Slot encontrado
                        occupiedSlots.add(slotKey);
                        scheduledForClient++;
                        createdCount++;

                        const eventDate = new Date(monday);
                        eventDate.setDate(monday.getDate() + dayIdx);
                        eventDate.setHours(h, 0, 0, 0);

                        newDbEvents.push({
                            coach_id: user.id,
                            studio_id: studioId,
                            title: `Entrenamiento: ${client.name}`,
                            type: 'training',
                            date: eventDate.toISOString(),
                            duration: defaultSessionDuration / 60,
                            location: client.service_type === 'online' ? 'Online / Zoom' : 'Studio / Sala Principal',
                            description: `Auto-programado por Agenda Inteligente (${client.service_type || 'Presencial'})`
                        });
                        break;
                    }
                }
            }

            // Programar Revisión si corresponde (ej. semanal o mensual)
            if (client.checkin_frequency && client.checkin_frequency !== 'none') {
                const checkinDayIdx = 4; // Viernes por defecto
                const checkinHour = 12;
                const checkinSlotKey = `${checkinDayIdx}-${checkinHour}`;

                if (!occupiedSlots.has(checkinSlotKey)) {
                    occupiedSlots.add(checkinSlotKey);
                    checkinCount++;

                    const checkinDate = new Date(monday);
                    checkinDate.setDate(monday.getDate() + checkinDayIdx);
                    checkinDate.setHours(checkinHour, 0, 0, 0);

                    newDbEvents.push({
                        coach_id: user.id,
                        studio_id: studioId,
                        title: `Revisión & Métricas: ${client.name}`,
                        type: 'checkin',
                        date: checkinDate.toISOString(),
                        duration: 0.5,
                        location: 'Online / App',
                        description: `Check-in de evolución (${client.checkin_frequency})`
                    });
                }
            }
        }

        if (newDbEvents.length > 0) {
            const { error } = await supabase.from('calendar_events').insert(newDbEvents);
            if (error) {
                alert("Error al auto-programar: " + error.message);
            } else {
                setGenerationSummary(`¡Éxito! Se han generado automáticamente ${createdCount} sesiones de entrenamiento y ${checkinCount} revisiones sin colisiones.`);
                const lastDay = new Date(monday);
                lastDay.setDate(monday.getDate() + 6);
                loadInitialData(monday, lastDay);
            }
        } else {
            setGenerationSummary("No se encontraron clientes activos con sesiones pendientes o la agenda ya está completa en las franjas indicadas.");
        }

        setIsGenerating(false);
    };

    const handleSaveWorkingHours = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({
                working_hours: workingHours,
                default_session_duration: defaultSessionDuration
            })
            .eq('id', user.id);

        if (error) {
            alert("Error al guardar horario: " + error.message);
        } else {
            alert("¡Horario laboral actualizado correctamente! ✅");
            setIsSettingsModalOpen(false);
        }
    };

    const openNewEventModal = () => { 
        setEditingEvent(null); 
        setFormEventType('training');
        setIsModalOpen(true); 
    };
    
    const openEditModal = (event: AgendaEvent) => { 
        setEditingEvent(event); 
        setFormEventType(event.type);
        setIsModalOpen(true); 
    };

    const getEventStyle = (startHour: number, duration: number) => {
        const startOffset = startHour - 6; 
        return { top: `${startOffset * 64}px`, height: `${duration * 64}px` };
    };

    const getEventColor = (type: string) => {
        switch(type) {
            case 'training': return 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
            case 'group': return 'bg-purple-500/10 border-purple-500 text-purple-400';
            case 'checkin': return 'bg-blue-500/10 border-blue-500 text-blue-400';
            case 'call': return 'bg-orange-500/10 border-orange-500 text-orange-400';
            default: return 'bg-zinc-800 border-zinc-600 text-zinc-300';
        }
    };

    const handleCopyLink = (id: number) => {
        const link = `${window.location.origin}/join/${id}`;
        navigator.clipboard.writeText(link);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <div className="p-8 w-full h-screen flex flex-col text-white font-sans overflow-hidden relative">
            <div className="flex justify-between items-end mb-6 flex-shrink-0">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-3xl font-bold text-white mb-1">Agenda del Centro</h1>
                        {userPlan === 'elite' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Smart Scheduler Activo
                            </span>
                        ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Agenda Manual
                            </span>
                        )}
                    </div>
                    <p className="text-zinc-400 text-sm">Organiza las sesiones, automatiza horarios y gestiona tu equipo.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Botón de Ajustes de Horario */}
                    <button
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="p-2.5 bg-[#151518] hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white transition-all flex items-center gap-2 text-xs font-semibold"
                        title="Configurar Horarios Laborales"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">Mis Horarios</span>
                    </button>

                    {/* Botón de Auto-Programación Inteligente */}
                    {userPlan === 'elite' ? (
                        <Button
                            onClick={() => setIsSmartModalOpen(true)}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold hover:opacity-90 gap-2 text-xs shadow-lg shadow-emerald-500/10"
                        >
                            <Sparkles className="w-4 h-4" /> Auto-Programar Semana
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsSmartModalOpen(true)}
                            className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700/50 gap-2 text-xs"
                        >
                            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Agenda Inteligente
                            <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Elite</span>
                        </Button>
                    )}

                    <div className="flex items-center bg-[#111] border border-zinc-800 rounded-lg p-1">
                        <button onClick={() => changeWeek('prev')} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="px-4 text-sm font-medium text-white min-w-[160px] text-center capitalize">{weekDisplay}</span>
                        <button onClick={() => changeWeek('next')} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>

                    {userRole === 'admin' && (
                        <Button onClick={openNewEventModal} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 gap-2"><Plus className="w-4 h-4" /> Nueva Clase</Button>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-[#111] border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                <div className="grid grid-cols-8 border-b border-zinc-800 bg-[#111] z-20 pr-[6px]">
                    <div className="p-4 border-r border-zinc-800/50 flex items-center justify-center"><Clock className="w-5 h-5 text-zinc-500" /></div>
                    {DAYS.map((day, i) => {
                        const isToday = new Date().getDate() === weekDates[i] && new Date().getMonth() === currentDate.getMonth();
                        return (
                            <div key={day} className={`p-4 text-center border-r border-zinc-800/50 relative ${i === 6 ? 'border-r-0' : ''}`}>
                                <span className={`text-xs font-bold block mb-1 ${isToday ? 'text-emerald-500' : 'text-zinc-500'}`}>{day}</span>
                                <span className={`text-xl font-bold ${isToday ? 'text-emerald-500 bg-emerald-500/10 w-8 h-8 rounded-full inline-flex items-center justify-center' : 'text-white'}`}>{weekDates[i]}</span>
                                {isToday && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500" />}
                            </div>
                        );
                    })}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {loading && <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500"/></div>}
                    <div className="grid grid-cols-8 relative min-h-[1088px]">
                        <div className="border-r border-zinc-800 bg-[#111]/50 sticky left-0 z-10 agenda-time-column">
                            {HOURS.map(hour => (<div key={hour} className="h-16 border-b border-zinc-800/50 text-xs text-zinc-500 flex items-start justify-center pt-2 font-mono agenda-time-cell">{hour}:00</div>))}
                        </div>
                        {DAYS.map((_, dayIndex) => (
                            <div key={dayIndex} className="relative border-r border-zinc-800/30">
                                {HOURS.map(hour => (
                                    <div key={hour} onClick={() => userRole === 'admin' && handleCellClick(dayIndex, hour)} onDragOver={handleDragOver} onDrop={(e) => userRole === 'admin' && handleDrop(e, dayIndex, hour)} className={`h-16 border-b border-zinc-800/30 transition-colors group relative ${userRole === 'admin' ? 'hover:bg-white/[0.02] cursor-pointer' : ''}`}>
                                        {userRole === 'admin' && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"><Plus className="w-4 h-4 text-zinc-600" /></div>}
                                    </div>
                                ))}
                                {events.filter(e => e.day === dayIndex).map(event => (
                                    <div key={event.id} draggable={userRole === 'admin'} onDragStart={(e) => handleDragStart(e, event.id)} className={`absolute w-[94%] left-[3%] rounded-lg border-l-4 p-2 text-xs cursor-pointer ${userRole === 'admin' ? 'active:cursor-grabbing hover:brightness-110' : ''} transition-all shadow-lg overflow-hidden group z-10 flex flex-col justify-center ${getEventColor(event.type)}`} style={getEventStyle(event.startHour, event.duration)} onClick={(e) => { e.stopPropagation(); openEditModal(event); }}>
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold truncate">{event.title}</span>
                                            {event.type === 'checkin' && <CalendarIcon className="w-3 h-3 opacity-70" />}
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 opacity-70"><Clock className="w-3 h-3" /><span>{Math.floor(event.startHour)}:{((event.startHour % 1) * 60).toString().padStart(2, '0')}</span></div>
                                        {event.location && (<div className="flex items-center gap-1 mt-1 opacity-60 truncate"><MapPin className="w-3 h-3" /><span>{event.location}</span></div>)}
                                        
                                        {/* Mostrar el contador de reservas si es grupal */}
                                        {event.type === 'group' && (
                                            <div className="flex items-center gap-1 mt-1 font-bold text-purple-300">
                                                <Users className="w-3 h-3" />
                                                <span>{event.bookedCount || 0} / {event.max_capacity || 15}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL DE CREACIÓN/EDICIÓN */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        <div className="flex justify-between items-center mb-6 pr-8">
                            <h2 className="text-xl font-bold text-white">{(editingEvent && editingEvent.id !== 0) ? 'Editar Cita' : 'Nueva Cita'}</h2>
                            {(editingEvent && editingEvent.id !== 0) && userRole === 'admin' && (
                                <button type="button" onClick={() => handleDeleteEvent(editingEvent.id)} className="text-red-500 hover:text-red-400 p-2 bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        <form onSubmit={handleSaveEvent} className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1 block">Título</label>
                                <input name="title" defaultValue={editingEvent?.title} required placeholder="Ej: Clase Antigravity Básico" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-zinc-400 mb-1 block">Día</label><select name="day" defaultValue={editingEvent?.day ?? 0} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none">{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
                                <div><label className="text-xs text-zinc-400 mb-1 block">Hora Inicio</label><select name="startHour" defaultValue={editingEvent?.startHour ?? 9} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none">{HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}</select></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-zinc-400 mb-1 block">Duración (h)</label><input name="duration" type="number" step="0.5" defaultValue={editingEvent?.duration ?? 1} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" /></div>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block">Tipo de Cita</label>
                                    <select 
                                        name="type" 
                                        value={formEventType} 
                                        onChange={(e) => setFormEventType(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                                        disabled={userRole !== 'admin'}
                                    >
                                        <option value="training">Entreno Personal</option>
                                        <option value="group">Clase Grupal</option>
                                        <option value="checkin">Revisión</option>
                                        <option value="call">Llamada</option>
                                    </select>
                                </div>
                            </div>

                            {/* ZONA EXCLUSIVA PARA CLASES GRUPALES (STUDIO) */}
                            {formEventType === 'group' && (
                                <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-4 mb-4">
                                    {userRole === 'admin' && (
                                        <>
                                            <div>
                                                <label className="text-xs text-purple-400 mb-1 block flex items-center gap-1"><Users className="w-3 h-3" /> Entrenador Asignado</label>
                                                <select name="assigned_staff_id" defaultValue={editingEvent?.assigned_staff_id || studioId || ""} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none">
                                                    <option value={studioId || ""}>Yo (Dueño)</option>
                                                    {staffList.map(staff => (
                                                        <option key={staff.id} value={staff.id}>{staff.business_name || staff.email}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs text-purple-400 mb-1 block flex items-center gap-1"><Box className="w-3 h-3" /> Limitar por Material</label>
                                                    <select name="inventory_id" defaultValue="" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none">
                                                        <option value="">Aforo Manual</option>
                                                        {inventoryList.map(item => (
                                                            <option key={item.id} value={item.id}>{item.name} (Max: {item.quantity})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-purple-400 mb-1 block">Aforo Manual</label>
                                                    <input name="manual_capacity" type="number" defaultValue={editingEvent?.max_capacity || 15} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" placeholder="15" />
                                                </div>
                                            </div>

                                            {/* Clase Pública */}
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="checkbox" 
                                                    name="is_public" 
                                                    defaultChecked={editingEvent?.is_public} 
                                                    className="rounded border-zinc-600" 
                                                />
                                                <label className="text-sm text-purple-400">Permitir Invitados (Clase Pública)</label>
                                            </div>

                                            <div>
                                                <label className="text-xs text-purple-400 mb-1 block">Precio Drop-in (€)</label>
                                                <input 
                                                    name="dropin_price" 
                                                    type="number" 
                                                    step="0.1" 
                                                    defaultValue={editingEvent?.dropin_price || ''} 
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" 
                                                    placeholder="0.00" 
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* MÓDULO DE INVITACIÓN (CÓDIGO QR Y LINK) */}
                                    {(editingEvent && editingEvent.id !== 0 && editingEvent.is_public) && (
                                        <div className="mt-4 pt-4 border-t border-purple-500/20 flex flex-col items-center text-center space-y-3">
                                            <h3 className="text-sm font-bold text-white">🎟️ Invitación Pública</h3>
                                            <p className="text-xs text-zinc-400 mb-2">Comparte este QR o enlace para que se inscriban los invitados.</p>
                                            
                                            {/* Generador dinámico de QR usando la API gratuita de QR Server */}
                                            <div className="p-2 bg-white rounded-xl shadow-lg inline-block">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/join/' + editingEvent.id)}`} 
                                                    alt="QR Code" 
                                                    className="w-28 h-28"
                                                />
                                            </div>

                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => handleCopyLink(editingEvent.id)}
                                                className={`w-full font-bold transition-all ${copiedLink ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'bg-purple-500/10 text-purple-400 border-purple-500/50 hover:bg-purple-500/20'}`}
                                            >
                                                {copiedLink ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                                {copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}
                                            </Button>
                                        </div>
                                    )}

                                    {/* LISTA DE ASISTENTES */}
                                    {(editingEvent && editingEvent.id !== 0) && (
                                        <div className="mt-4 pt-4 border-t border-purple-500/20">
                                            <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                                                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-400"/> Lista de Asistentes</span>
                                                <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">{editingEvent.bookedCount} / {editingEvent.max_capacity}</span>
                                            </h3>
                                            
                                            {editingEvent.attendees && editingEvent.attendees.length > 0 ? (
                                                <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                                    {editingEvent.attendees.map((att, i) => (
                                                        <li key={i} className="flex justify-between items-center text-sm p-2 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                                                            <span className="text-zinc-300 font-medium">{att.name}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${att.status === 'booked' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                                {att.status === 'booked' ? 'Confirmado' : 'En Espera'}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-center py-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                                                    <p className="text-xs text-zinc-500">Nadie se ha apuntado aún a esta clase.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div><label className="text-xs text-zinc-400 mb-1 block">Ubicación</label><input name="location" defaultValue={editingEvent?.location} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" /></div>
                            <div><label className="text-xs text-zinc-400 mb-1 block flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Notas</label><textarea name="notes" defaultValue={editingEvent?.notes} placeholder="Apuntes..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none min-h-[80px]" /></div>
                            
                            {userRole === 'admin' && (
                                <Button type="submit" className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400 mt-2 h-12">
                                    <Check className="w-4 h-4 mr-2" /> Guardar Evento
                                </Button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* --- MODAL 1: AUTO-PROGRAMACIÓN INTELIGENTE (SMART SCHEDULER) --- */}
            {isSmartModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-[#151518] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
                        <button
                            onClick={() => { setIsSmartModalOpen(false); setGenerationSummary(null); }}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {userPlan === 'elite' ? (
                            <div className="space-y-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-white">Auto-Programador Inteligente</h2>
                                        <p className="text-xs text-zinc-400">Organiza toda la semana en base a los servicios y horarios de tus atletas.</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5 text-xs text-zinc-300">
                                    <div className="flex items-center justify-between font-semibold text-white">
                                        <span>Atletas Activos Detectados:</span>
                                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{clientsList.length} clientes</span>
                                    </div>
                                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                                        El sistema cruzará tus horas de trabajo con los días y franjas preferentes de cada atleta para agendar sus sesiones y revisiones sin colisiones.
                                    </p>
                                </div>

                                {generationSummary && (
                                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-start gap-2 animate-in fade-in">
                                        <Check className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{generationSummary}</span>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => { setIsSmartModalOpen(false); setGenerationSummary(null); }}
                                        className="flex-1 border-zinc-800 text-zinc-400 hover:text-white"
                                    >
                                        Cerrar
                                    </Button>
                                    <Button
                                        onClick={handleSmartAutoSchedule}
                                        disabled={isGenerating || clientsList.length === 0}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold hover:opacity-90 gap-2 shadow-lg shadow-emerald-500/10"
                                    >
                                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                        {isGenerating ? 'Auto-agendando...' : 'Generar Semana'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* CANDADO DE PLAN ELITE */
                            <div className="text-center space-y-4 py-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                                    <Sparkles className="w-7 h-7 animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                        Exclusivo Plan Elite
                                    </span>
                                    <h2 className="text-xl font-black text-white pt-2">Desbloquea la Agenda Inteligente</h2>
                                    <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                                        Ahorra más de 4 horas a la semana dejando que FitLeader auto-programe las sesiones, clases y revisiones de todos tus atletas sin colisiones.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-left space-y-2 text-xs text-zinc-300">
                                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                        <Check className="w-4 h-4" /> Detección de huecos libres y horas de trabajo
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                        <Check className="w-4 h-4" /> Asignación según franjas preferentes del atleta
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                        <Check className="w-4 h-4" /> Auto-programación de revisiones periódicas
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsSmartModalOpen(false)}
                                        className="flex-1 border-zinc-800 text-zinc-400"
                                    >
                                        Quizás luego
                                    </Button>
                                    <Button
                                        onClick={() => navigate('/dashboard/settings')}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-black font-extrabold hover:opacity-90 shadow-lg shadow-emerald-500/10"
                                    >
                                        Mejorar a Elite →
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- MODAL 2: AJUSTES DE HORARIO LABORAL DEL COACH --- */}
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-[#151518] border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
                        <button
                            onClick={() => setIsSettingsModalOpen(false)}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full bg-zinc-900 border border-zinc-800"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Tus Horarios Laborales</h2>
                                <p className="text-xs text-zinc-400">Define tus franjas activas para el auto-agendamiento.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveWorkingHours} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-zinc-300">Duración estándar de sesión (min)</label>
                                <select
                                    value={defaultSessionDuration}
                                    onChange={(e) => setDefaultSessionDuration(Number(e.target.value))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:border-emerald-500 outline-none"
                                >
                                    <option value={30}>30 minutos</option>
                                    <option value={45}>45 minutos</option>
                                    <option value={60}>60 minutos (1 hora)</option>
                                    <option value={90}>90 minutos (1.5 horas)</option>
                                </select>
                            </div>

                            <div className="space-y-2.5 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {[
                                    { key: 'monday', label: 'Lunes' },
                                    { key: 'tuesday', label: 'Martes' },
                                    { key: 'wednesday', label: 'Miércoles' },
                                    { key: 'thursday', label: 'Jueves' },
                                    { key: 'friday', label: 'Viernes' },
                                    { key: 'saturday', label: 'Sábado' },
                                    { key: 'sunday', label: 'Domingo' }
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center justify-between p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl text-xs">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={workingHours[key]?.active || false}
                                                onChange={(e) => setWorkingHours({
                                                    ...workingHours,
                                                    [key]: { ...workingHours[key], active: e.target.checked }
                                                })}
                                                className="rounded border-zinc-700 text-emerald-500"
                                            />
                                            <span className="font-semibold text-white">{label}</span>
                                        </div>
                                        {workingHours[key]?.active && (
                                            <div className="flex items-center gap-1.5 text-zinc-400">
                                                <input
                                                    type="time"
                                                    value={workingHours[key]?.start || "08:00"}
                                                    onChange={(e) => setWorkingHours({
                                                        ...workingHours,
                                                        [key]: { ...workingHours[key], start: e.target.value }
                                                    })}
                                                    className="bg-black/60 border border-zinc-700/80 rounded px-1.5 py-0.5 text-white text-[11px]"
                                                />
                                                <span>-</span>
                                                <input
                                                    type="time"
                                                    value={workingHours[key]?.end || "20:00"}
                                                    onChange={(e) => setWorkingHours({
                                                        ...workingHours,
                                                        [key]: { ...workingHours[key], end: e.target.value }
                                                    })}
                                                    className="bg-black/60 border border-zinc-700/80 rounded px-1.5 py-0.5 text-white text-[11px]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsSettingsModalOpen(false)}
                                    className="flex-1 border-zinc-800 text-zinc-400"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-emerald-500 text-black font-bold hover:bg-emerald-400"
                                >
                                    Guardar Horario
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agenda;