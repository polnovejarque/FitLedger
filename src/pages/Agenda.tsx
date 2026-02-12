import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
    Clock, MapPin, MoreVertical, X, Edit, Trash2, AlignLeft, Check, Loader2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface AgendaEvent {
    id: number;
    dbId?: number;
    title: string;
    type: 'training' | 'checkin' | 'call';
    day: number;      
    startHour: number; 
    duration: number;  
    location: string;
    notes?: string;    
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null); 
    const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
    const [draggedEventId, setDraggedEventId] = useState<number | null>(null);

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
        
        fetchEvents(monday, lastDay);
    }, [currentDate]);

    const fetchEvents = async (start: Date, end: Date) => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const startIso = start.toISOString();
        const endIso = new Date(end.setDate(end.getDate() + 1)).toISOString();

        // AQUÍ HE QUITADO 'error'
        const { data } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('coach_id', user.id)
            .gte('date', startIso)
            .lt('date', endIso);

        if (data) {
            const formattedEvents: AgendaEvent[] = data.map(ev => {
                const eventDate = new Date(ev.date);
                let dayIndex = eventDate.getDay() - 1;
                if (dayIndex === -1) dayIndex = 6;

                return {
                    id: ev.id,
                    dbId: ev.id,
                    title: ev.title,
                    type: ev.type as any,
                    day: dayIndex,
                    startHour: eventDate.getHours() + (eventDate.getMinutes() / 60),
                    duration: ev.duration || 1,
                    location: ev.location || "",
                    notes: ev.description || ""
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

        const title = formData.get('title') as string;
        const type = formData.get('type') as string;
        const day = parseInt(formData.get('day') as string);
        const startHour = parseFloat(formData.get('startHour') as string);
        const duration = parseFloat(formData.get('duration') as string);
        const location = formData.get('location') as string;
        const notes = formData.get('notes') as string;

        const monday = getMonday(currentDate);
        const eventDate = new Date(monday);
        eventDate.setDate(monday.getDate() + day);
        eventDate.setHours(Math.floor(startHour), (startHour % 1) * 60, 0, 0);

        const newEventData = {
            coach_id: user?.id,
            title, type, date: eventDate.toISOString(), duration, location, description: notes
        };

        if (!editingEvent || editingEvent.id === 0) {
            // AQUÍ HE QUITADO 'error'
            const { data } = await supabase.from('calendar_events').insert([newEventData]).select().single();
            if (data) {
                const monday = getMonday(currentDate);
                const lastDay = new Date(monday);
                lastDay.setDate(monday.getDate() + 6);
                fetchEvents(monday, lastDay);
            }
        } else {
            await supabase.from('calendar_events').update(newEventData).eq('id', editingEvent.dbId || editingEvent.id);
            setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, title, type: type as any, day, startHour, duration, location, notes } : ev));
        }
        setIsModalOpen(false);
        setEditingEvent(null);
    };

    const handleDeleteEvent = async (id: number) => {
        if (!confirm("¿Borrar evento?")) return;
        setEvents(events.filter(ev => ev.id !== id));
        setActiveMenuId(null);
        await supabase.from('calendar_events').delete().eq('id', id);
    };

    const changeWeek = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentDate(newDate);
    };

    const openNewEventModal = () => { setEditingEvent(null); setIsModalOpen(true); };
    const openEditModal = (event: AgendaEvent) => { setEditingEvent(event); setIsModalOpen(true); setActiveMenuId(null); };

    const getEventStyle = (startHour: number, duration: number) => {
        const startOffset = startHour - 6; 
        return { top: `${startOffset * 64}px`, height: `${duration * 64}px` };
    };

    const getEventColor = (type: string) => {
        switch(type) {
            case 'training': return 'bg-emerald-500/10 border-emerald-500 text-emerald-400';
            case 'checkin': return 'bg-blue-500/10 border-blue-500 text-blue-400';
            case 'call': return 'bg-orange-500/10 border-orange-500 text-orange-400';
            default: return 'bg-zinc-800 border-zinc-600 text-zinc-300';
        }
    };

    return (
        <div className="p-8 w-full h-screen flex flex-col text-white font-sans overflow-hidden relative" onClick={() => setActiveMenuId(null)}>
            <div className="flex justify-between items-end mb-6 flex-shrink-0">
                <div><h1 className="text-3xl font-bold text-white mb-1">Agenda Semanal</h1><p className="text-zinc-400">Organiza tus sesiones y revisiones.</p></div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#111] border border-zinc-800 rounded-lg p-1">
                        <button onClick={() => changeWeek('prev')} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="px-4 text-sm font-medium text-white min-w-[160px] text-center capitalize">{weekDisplay}</span>
                        <button onClick={() => changeWeek('next')} className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                    <Button onClick={openNewEventModal} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 gap-2"><Plus className="w-4 h-4" /> Nueva Cita</Button>
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
                                    <div key={hour} onClick={() => handleCellClick(dayIndex, hour)} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, dayIndex, hour)} className="h-16 border-b border-zinc-800/30 hover:bg-white/[0.02] transition-colors group cursor-pointer relative">
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"><Plus className="w-4 h-4 text-zinc-600" /></div>
                                    </div>
                                ))}
                                {events.filter(e => e.day === dayIndex).map(event => (
                                    <div key={event.id} draggable onDragStart={(e) => handleDragStart(e, event.id)} className={`absolute w-[94%] left-[3%] rounded-lg border-l-4 p-2 text-xs cursor-grab active:cursor-grabbing hover:brightness-110 transition-all shadow-lg overflow-hidden group z-10 flex flex-col justify-center ${getEventColor(event.type)}`} style={getEventStyle(event.startHour, event.duration)} onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold truncate">{event.title}</span>
                                            {event.type === 'checkin' && <CalendarIcon className="w-3 h-3 opacity-70" />}
                                            <button className="p-1 hover:bg-black/20 rounded transition-colors" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === event.id ? null : event.id); }}><MoreVertical className="w-3 h-3" /></button>
                                        </div>
                                        <div className="flex items-center gap-1 mt-1 opacity-70"><Clock className="w-3 h-3" /><span>{Math.floor(event.startHour)}:{((event.startHour % 1) * 60).toString().padStart(2, '0')}</span></div>
                                        {event.location && (<div className="flex items-center gap-1 mt-1 opacity-60 truncate"><MapPin className="w-3 h-3" /><span>{event.location}</span></div>)}
                                        {activeMenuId === event.id && (
                                            <div className="absolute top-6 right-2 w-32 bg-[#18181b] border border-zinc-700 rounded shadow-xl z-50 animate-in zoom-in-95">
                                                <button onClick={() => openEditModal(event)} className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-zinc-300 flex items-center gap-2"><Edit className="w-3 h-3" /> Editar</button>
                                                <button onClick={() => handleDeleteEvent(event.id)} className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 flex items-center gap-2"><Trash2 className="w-3 h-3" /> Eliminar</button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-5 h-5" /></button>
                        <h2 className="text-xl font-bold text-white mb-6">{(editingEvent && editingEvent.id !== 0) ? 'Editar Cita' : 'Nueva Cita'}</h2>
                        <form onSubmit={handleSaveEvent} className="space-y-4">
                            <div><label className="text-xs text-zinc-400 mb-1 block">Título</label><input name="title" defaultValue={editingEvent?.title} required placeholder="Ej: Entrenamiento Juan" className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-zinc-400 mb-1 block">Día</label><select name="day" defaultValue={editingEvent?.day ?? 0} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none">{DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}</select></div>
                                <div><label className="text-xs text-zinc-400 mb-1 block">Hora Inicio</label><select name="startHour" defaultValue={editingEvent?.startHour ?? 9} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none">{HOURS.map(h => <option key={h} value={h}>{h}:00</option>)}</select></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs text-zinc-400 mb-1 block">Duración (h)</label><input name="duration" type="number" step="0.5" defaultValue={editingEvent?.duration ?? 1} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" /></div>
                                <div><label className="text-xs text-zinc-400 mb-1 block">Tipo</label><select name="type" defaultValue={editingEvent?.type ?? 'training'} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"><option value="training">Entrenamiento</option><option value="checkin">Revisión</option><option value="call">Llamada</option></select></div>
                            </div>
                            <div><label className="text-xs text-zinc-400 mb-1 block">Ubicación</label><input name="location" defaultValue={editingEvent?.location} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none" /></div>
                            <div><label className="text-xs text-zinc-400 mb-1 block flex items-center gap-1"><AlignLeft className="w-3 h-3" /> Notas</label><textarea name="notes" defaultValue={editingEvent?.notes} placeholder="Apuntes..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none min-h-[80px]" /></div>
                            <Button type="submit" className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-400 mt-2"><Check className="w-4 h-4 mr-2" /> Guardar Cita</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Agenda;