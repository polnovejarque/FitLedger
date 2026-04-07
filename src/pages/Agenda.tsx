import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
    Clock, MapPin, X, Trash2, AlignLeft, Check, Loader2, Users, Box
} from 'lucide-react';
import { Button } from '../components/ui/Button';

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
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDates, setWeekDates] = useState<number[]>([]);
    const [weekDisplay, setWeekDisplay] = useState("");
    const [events, setEvents] = useState<AgendaEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Contexto del Studio (Inventario y Equipo)
    const [userRole, setUserRole] = useState('admin');
    const [studioId, setStudioId] = useState<string | null>(null);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [inventoryList, setInventoryList] = useState<any[]>([]);

    // Modales y Estados de Edición
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null); 
    const [draggedEventId, setDraggedEventId] = useState<number | null>(null);
    
    // Controlar el tipo de evento en tiempo real en el formulario
    const [formEventType, setFormEventType] = useState('training');

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

        // 1. Averiguar quién es el usuario
        const { data: profile } = await supabase.from('profiles').select('role, studio_id').eq('id', user.id).single();
        
        const role = profile?.role || 'admin';
        const currentStudioId = role === 'admin' ? user.id : profile?.studio_id;
        
        setUserRole(role);
        setStudioId(currentStudioId);

        // 2. Si es Admin, cargar su equipo y su inventario para los desplegables
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
                    attendees
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
            max_capacity
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

    return (
        <div className="p-8 w-full h-screen flex flex-col text-white font-sans overflow-hidden relative">
            <div className="flex justify-between items-end mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Agenda del Centro</h1>
                    <p className="text-zinc-400">Organiza las sesiones y gestiona tu equipo.</p>
                </div>
                <div className="flex items-center gap-4">
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
                        <div className="border-r border-zinc-800 bg-[#111]/50 sticky left-0 z-10">
                            {HOURS.map(hour => (<div key={hour} className="h-16 border-b border-zinc-800/50 text-xs text-zinc-500 flex items-start justify-center pt-2 font-mono">{hour}:00</div>))}
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
                                        
                                        {/* NUEVO: Mostrar el contador de reservas si es grupal */}
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
                                        </>
                                    )}

                                    {/* LISTA DE ASISTENTES (NUEVO) */}
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
        </div>
    );
};

export default Agenda;