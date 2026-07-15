import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Building2, MapPin, Users, Calendar, Clock, 
    Plus, Trash2, Loader2, User, Globe, Phone, Mail
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import ToastContainer from '../components/ui/ToastContainer';
import type { ToastProps } from '../components/ui/Toast';
import { sendBookingStatusEmail } from '../services/emailService';

const CenterSpaces = () => {
    // --- ESTADOS ---
    const [spaces, setSpaces] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [staffList, setStaffList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingSpace, setIsSavingSpace] = useState(false);
    const [isSavingBooking, setIsSavingBooking] = useState(false);
    
    // UI
    const [showNewSpaceModal, setShowNewSpaceModal] = useState(false);
    const [showNewBookingModal, setShowNewBookingModal] = useState(false);
    const [toasts, setToasts] = useState<ToastProps[]>([]);
    
    // Formulario Espacio
    const [spaceName, setSpaceName] = useState("");
    const [spaceCapacity, setSpaceCapacity] = useState(1);
    const [spaceDesc, setSpaceDesc] = useState("");

    // Formulario Reserva
    const [selectedSpaceId, setSelectedSpaceId] = useState("");
    const [selectedCoachId, setSelectedCoachId] = useState("");
    const [bookingClientName, setBookingClientName] = useState("");
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingStartTime, setBookingStartTime] = useState("10:00");
    const [bookingEndTime, setBookingEndTime] = useState("11:00");

    // Marketplace Space attributes
    const [isPublicMarketplace, setIsPublicMarketplace] = useState(false);
    const [pricePerHour, setPricePerHour] = useState(0);
    const [rules, setRules] = useState("");
    const [activeTab, setActiveTab] = useState<'agenda' | 'marketplace'>('agenda');

    const [studioId, setStudioId] = useState<string | null>(null);
    const [centerName, setCenterName] = useState("Centro Deportivo");
    const [centerPhone, setCenterPhone] = useState<string | null>(null);

    // --- CARGAR DATOS ---
    useEffect(() => {
        loadData();
    }, []);

    const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const idToast = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id: idToast, message, type, onClose: (id: string) => setToasts(p => p.filter(t => t.id !== id)) }]);
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('id, role, studio_id, business_name, contact_phone')
                .eq('id', user.id)
                .single();

            if (profile) {
                setCenterName(profile.business_name || "Centro Deportivo");
                setCenterPhone(profile.contact_phone || null);
            }

            const currentStudioId = profile?.studio_id || user.id;
            setStudioId(currentStudioId);

            // 1. Cargar Espacios
            const { data: spacesData, error: spacesError } = await supabase
                .from('spaces')
                .select('*')
                .eq('center_id', currentStudioId)
                .order('created_at', { ascending: false });

            if (spacesError) throw spacesError;
            setSpaces(spacesData || []);

            // 2. Cargar Reservas con detalles del espacio y del coach
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('space_bookings')
                .select(`
                    *,
                    spaces (name, capacity),
                    profiles:coach_id (first_name, last_name, business_name, email, contact_phone, contact_email)
                `)
                .order('booking_date', { ascending: true })
                .order('start_time', { ascending: true });

            if (bookingsError) throw bookingsError;
            
            // Filtrar bookings que correspondan a los espacios de este centro
            const spaceIds = (spacesData || []).map(s => s.id);
            const filteredBookings = (bookingsData || []).filter(b => spaceIds.includes(b.space_id));
            setBookings(filteredBookings);

            // 3. Cargar Coaches/Staff para asignar reservas
            const { data: staffData } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, business_name, email')
                .or(`studio_id.eq.${currentStudioId},id.eq.${currentStudioId}`);
            
            if (staffData) {
                setStaffList(staffData);
            }
        } catch (err: any) {
            console.error(err);
            addToast("Error al cargar datos: " + err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // --- ACCIONES ESPACIO ---
    const handleCreateSpace = async () => {
        if (!spaceName.trim()) {
            alert("El nombre de la zona es obligatorio.");
            return;
        }
        setIsSavingSpace(true);
        try {
            const { error } = await supabase.from('spaces').insert([{
                center_id: studioId,
                name: spaceName,
                capacity: spaceCapacity,
                description: spaceDesc,
                is_public_marketplace: isPublicMarketplace,
                price_per_hour: pricePerHour,
                rules: rules
            }]);

            if (error) throw error;

            addToast("Espacio creado correctamente ✅", "success");
            setShowNewSpaceModal(false);
            setSpaceName("");
            setSpaceCapacity(1);
            setSpaceDesc("");
            setIsPublicMarketplace(false);
            setPricePerHour(0);
            setRules("");
            await loadData();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsSavingSpace(false);
        }
    };

    const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'approved' | 'rejected') => {
        try {
            const { error } = await supabase
                .from('space_bookings')
                .update({ status: newStatus })
                .eq('id', bookingId);

            if (error) throw error;

            // Enviar email de notificación al coach freelance
            const bookingObj = bookings.find(b => b.id === bookingId);
            if (bookingObj && bookingObj.profiles) {
                const coachEmail = bookingObj.profiles.email || bookingObj.profiles.contact_email;
                if (coachEmail) {
                    sendBookingStatusEmail(
                        coachEmail,
                        bookingObj.spaces?.name || "Sala de entrenamiento",
                        newStatus,
                        bookingObj.booking_date,
                        bookingObj.start_time,
                        bookingObj.end_time,
                        centerName,
                        centerPhone
                    ).catch(console.error);
                }
            }

            addToast(`Reserva ${newStatus === 'approved' ? 'aprobada' : 'rechazada'} correctamente`, "success");
            await loadData();
        } catch (err: any) {
            alert("Error al actualizar reserva: " + err.message);
        }
    };

    const handleVerifyPayment = async (bookingId: string, confirm: boolean) => {
        try {
            const nextStatus = confirm ? 'paid' : 'pending';
            const updatePayload: any = {
                payment_status: nextStatus
            };
            if (!confirm) {
                updatePayload.payment_method = null;
            }
            const { error } = await supabase
                .from('space_bookings')
                .update(updatePayload)
                .eq('id', bookingId);

            if (error) throw error;
            addToast(confirm ? "Pago verificado y confirmado 🎉" : "Pago marcado como no recibido ✕", "success");
            await loadData();
        } catch (err: any) {
            alert("Error al verificar el pago: " + err.message);
        }
    };

    const handleDeleteSpace = async (id: string, name: string) => {
        if (!confirm(`¿Seguro que deseas eliminar el espacio "${name}"? Se eliminarán todas sus reservas.`)) return;

        try {
            const { error } = await supabase.from('spaces').delete().eq('id', id);
            if (error) throw error;

            addToast(`Espacio "${name}" eliminado`, "info");
            await loadData();
        } catch (err: any) {
            alert("Error al eliminar espacio: " + err.message);
        }
    };

    // --- ACCIONES RESERVAS ---
    const handleCreateBooking = async () => {
        if (!selectedSpaceId) {
            alert("Debes seleccionar un espacio/zona.");
            return;
        }
        if (!selectedCoachId) {
            alert("Debes asignar un entrenador.");
            return;
        }
        if (!bookingDate) {
            alert("Debes seleccionar una fecha.");
            return;
        }

        setIsSavingBooking(true);
        try {
            const { error } = await supabase.from('space_bookings').insert([{
                space_id: selectedSpaceId,
                coach_id: selectedCoachId,
                client_name: bookingClientName || "Entrenamiento libre",
                booking_date: bookingDate,
                start_time: bookingStartTime,
                end_time: bookingEndTime
            }]);

            if (error) throw error;

            addToast("Reserva programada correctamente ✅", "success");
            setShowNewBookingModal(false);
            setBookingClientName("");
            setSelectedSpaceId("");
            setSelectedCoachId("");
            await loadData();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setIsSavingBooking(false);
        }
    };

    const handleDeleteBooking = async (id: string) => {
        if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;

        try {
            const { error } = await supabase.from('space_bookings').delete().eq('id', id);
            if (error) throw error;

            addToast("Reserva cancelada correctamente", "info");
            await loadData();
        } catch (err: any) {
            alert("Error al cancelar reserva: " + err.message);
        }
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans space-y-8 animate-in fade-in duration-500">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-8 h-8 text-blue-400" />
                        <h1 className="text-3xl font-bold text-white">Alquiler de Espacios</h1>
                    </div>
                    <p className="text-zinc-400">Administra las zonas de entrenamiento del centro y controla las reservas de los entrenadores.</p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setShowNewSpaceModal(true)} className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 font-bold text-xs gap-1.5 py-2.5">
                        <Plus className="w-4 h-4" /> Nueva Zona
                    </Button>
                    <Button onClick={() => setShowNewBookingModal(true)} className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs gap-1.5 py-2.5 shadow-lg shadow-blue-500/10">
                        <Calendar className="w-4 h-4" /> Programar Reserva
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLUMNA IZQUIERDA: ZONAS Y ESPACIOS */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-zinc-400" /> Zonas del Local ({spaces.length})
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {spaces.length > 0 ? (
                                spaces.map((space) => (
                                    <div 
                                        key={space.id} 
                                        className="bg-[#111] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 relative overflow-hidden transition-all group shadow-md"
                                    >
                                        <div className="absolute top-0 right-0 p-16 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
                                        
                                        {space.is_public_marketplace && (
                                            <span className="absolute top-3 right-12 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                                                Público • {space.price_per_hour}€/h
                                            </span>
                                        )}

                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{space.name}</h3>
                                                <p className="text-xs text-zinc-400 leading-relaxed">{space.description || "Sin descripción."}</p>
                                                {space.rules && (
                                                    <p className="text-[10px] text-zinc-500 italic mt-1 truncate max-w-[200px]">Normas: {space.rules}</p>
                                                )}
                                                <div className="flex items-center gap-1 text-[11px] text-zinc-500 pt-2 font-medium">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>Capacidad máx: {space.capacity} atleta(s)</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteSpace(space.id, space.name)}
                                                className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Eliminar zona"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center text-zinc-500">
                                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Aún no has creado ninguna zona o espacio físico.</p>
                                    <p className="text-xs text-zinc-600 mt-1">Crea zonas como "Rack 1", "Zona Funcional", etc. para poder reservarlas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUMNA CENTRAL/DERECHA: CALENDARIO DE RESERVAS */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Selector de Pestaña */}
                        <div className="flex justify-between items-center">
                            <div className="flex gap-1 bg-[#111] border border-zinc-800 rounded-lg p-1">
                                <button
                                    onClick={() => setActiveTab('agenda')}
                                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                                        activeTab === 'agenda' ? 'bg-blue-500 text-white' : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    Agenda Ocupación ({bookings.filter(b => b.booking_type !== 'external').length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('marketplace')}
                                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                                        activeTab === 'marketplace' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    Reservas Marketplace ({bookings.filter(b => b.booking_type === 'external' && b.status === 'pending').length} pendientes)
                                </button>
                            </div>
                        </div>

                        <div className="bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                            {activeTab === 'agenda' ? (
                                <>
                                    <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                                        <span>Espacio / Cliente</span>
                                        <span>Fecha & Horario</span>
                                    </div>

                                    <div className="divide-y divide-zinc-800">
                                        {bookings.filter(b => b.booking_type !== 'external').length > 0 ? (
                                            bookings.filter(b => b.booking_type !== 'external').map((booking) => {
                                                const coachName = booking.profiles 
                                                    ? (booking.profiles.first_name ? `${booking.profiles.first_name} ${booking.profiles.last_name || ''}` : (booking.profiles.business_name || booking.profiles.email))
                                                    : "Desconocido";

                                                return (
                                                    <div 
                                                        key={booking.id} 
                                                        className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-900/30 transition-all group"
                                                    >
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold rounded-full">
                                                                    {booking.spaces?.name || "Espacio eliminado"}
                                                                </span>
                                                                <span className="text-zinc-600 text-xs">•</span>
                                                                <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                                                                    <User className="w-3.5 h-3.5" /> Entrenador: <strong className="text-zinc-300 font-bold">{coachName}</strong>
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-white">Atleta: {booking.client_name || "Entrenamiento libre"}</p>
                                                        </div>

                                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                            <div className="text-right">
                                                                <p className="text-xs text-zinc-400 font-medium flex items-center gap-1 sm:justify-end">
                                                                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                                                                    {new Date(booking.booking_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                                                </p>
                                                                <p className="text-sm font-bold text-white flex items-center gap-1 mt-0.5 sm:justify-end">
                                                                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                                    {booking.start_time} - {booking.end_time}
                                                                </p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleDeleteBooking(booking.id)}
                                                                className="text-zinc-600 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                                title="Cancelar reserva"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-20 text-center text-zinc-500">
                                                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-25 text-blue-400" />
                                                <p className="text-sm">No hay reservas programadas.</p>
                                                <p className="text-xs text-zinc-600 mt-1">Pulsa en "Programar Reserva" para empezar a gestionar la ocupación.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="divide-y divide-zinc-800">
                                    {bookings.filter(b => b.booking_type === 'external').length > 0 ? (
                                        bookings.filter(b => b.booking_type === 'external').map((booking) => {
                                            const coachObj = booking.profiles;
                                            const coachName = coachObj
                                                ? (coachObj.first_name ? `${coachObj.first_name} ${coachObj.last_name || ''}` : (coachObj.business_name || coachObj.email))
                                                : "Entrenador Freelance";
                                            const contactPhone = coachObj?.contact_phone || null;
                                            const contactEmail = coachObj?.contact_email || coachObj?.email;

                                            const paymentLabels: Record<string, string> = {
                                                pending: 'Pago Pendiente ⏳',
                                                pending_verification: 'Verificar Pago Manual 🔍',
                                                paid: 'Pagado ✅',
                                                free: 'Gratuito'
                                            };

                                            const paymentBadgeColors: Record<string, string> = {
                                                pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                                                pending_verification: 'bg-amber-500/10 text-amber-400 border-amber-500/20 font-extrabold animate-pulse',
                                                paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                                free: 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                            };

                                            return (
                                                <div key={booking.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-zinc-900/30 transition-all border-b border-zinc-850">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                                                                {booking.spaces?.name || "Espacio eliminado"}
                                                            </span>
                                                            <span className="text-zinc-600 text-xs">•</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                                                booking.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                                booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                                {booking.status === 'approved' ? 'Aprobada' : booking.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                                                            </span>
                                                            {booking.status === 'approved' && (
                                                                <>
                                                                    <span className="text-zinc-600 text-xs">•</span>
                                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${paymentBadgeColors[booking.payment_status || 'pending']}`}>
                                                                        {paymentLabels[booking.payment_status || 'pending']}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white">Freelance: {coachName}</p>
                                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 mt-1">
                                                                {contactEmail && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-zinc-500" /> {contactEmail}</span>}
                                                                {contactPhone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-zinc-500" /> {contactPhone}</span>}
                                                            </div>
                                                            <p className="text-xs text-zinc-500 mt-1 italic">Notas/Cliente: {booking.client_name || "N/A"}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex md:flex-col items-end gap-3 w-full md:w-auto justify-between md:justify-center border-t border-zinc-800 md:border-none pt-3 md:pt-0">
                                                        <div className="text-left md:text-right">
                                                            <p className="text-xs text-zinc-400 font-medium">{booking.booking_date}</p>
                                                            <p className="text-sm font-bold text-white mt-0.5">{booking.start_time} - {booking.end_time}</p>
                                                            {booking.total_amount > 0 && <p className="text-xs font-bold text-emerald-400 mt-0.5">{booking.total_amount} €</p>}
                                                        </div>
                                                        {booking.status === 'pending' && (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateBookingStatus(booking.id, 'approved')}
                                                                    className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                                >
                                                                    Aceptar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateBookingStatus(booking.id, 'rejected')}
                                                                    className="bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 border border-zinc-700 hover:border-red-500/20 text-zinc-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                                >
                                                                    Rechazar
                                                                </button>
                                                            </div>
                                                        )}
                                                        {booking.status === 'approved' && booking.payment_status === 'pending_verification' && (
                                                            <div className="flex flex-col gap-2">
                                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider text-right">¿Recibiste {booking.total_amount} € vía {booking.payment_method === 'bizum' ? 'Bizum' : 'Transferencia'}?</p>
                                                                <div className="flex gap-2 justify-end">
                                                                    <button
                                                                        onClick={() => handleVerifyPayment(booking.id, true)}
                                                                        className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        Confirmar Pago
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleVerifyPayment(booking.id, false)}
                                                                        className="bg-zinc-800 hover:bg-red-500/10 hover:text-red-400 border border-zinc-700 text-zinc-400 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                                                    >
                                                                        No Recibido
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="py-20 text-center text-zinc-500">
                                            <Globe className="w-10 h-10 mx-auto mb-2 opacity-25 text-emerald-400" />
                                            <p className="text-sm">No hay solicitudes del Marketplace.</p>
                                            <p className="text-xs text-zinc-600 mt-1">Los entrenadores externos que reserven tus salas públicas saldrán aquí.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL NUEVA ZONA / ESPACIO --- */}
            {showNewSpaceModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setShowNewSpaceModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold">✕</button>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-blue-400" /> Añadir Nueva Zona
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Nombre del Espacio</label>
                                <input 
                                    autoFocus
                                    required
                                    type="text" 
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm" 
                                    placeholder="Ej: Rack 1, Sala de Boxeo, Zona de Peso Libre" 
                                    value={spaceName} 
                                    onChange={(e) => setSpaceName(e.target.value)} 
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Capacidad máxima (Atletas simultáneos)</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm" 
                                        value={spaceCapacity} 
                                        onChange={(e) => setSpaceCapacity(parseInt(e.target.value) || 1)} 
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Descripción corta (Opcional)</label>
                                <textarea 
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm resize-none h-20" 
                                    placeholder="Ej: Equipado con barra olímpica, discos de competencia y mancuernas."
                                    value={spaceDesc}
                                    onChange={(e) => setSpaceDesc(e.target.value)}
                                />
                            </div>

                            {/* Marketplace B2B Public Listing configuration */}
                            <div className="pt-4 border-t border-zinc-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <label className="text-sm font-bold text-white block">Publicar en el Marketplace</label>
                                        <span className="text-xs text-zinc-500">Permite alquilar esta sala a entrenadores freelance</span>
                                    </div>
                                    <input 
                                        type="checkbox"
                                        checked={isPublicMarketplace}
                                        onChange={(e) => setIsPublicMarketplace(e.target.checked)}
                                        className="w-4 h-4 text-blue-500 bg-black border-zinc-850 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                </div>

                                {isPublicMarketplace && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1.5 block">Precio por hora (€/h)</label>
                                            <input 
                                                type="number"
                                                min="0"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm"
                                                value={pricePerHour}
                                                onChange={(e) => setPricePerHour(parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-zinc-400 mb-1.5 block">Normas del espacio / Equipamiento destacado</label>
                                            <textarea 
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm resize-none h-20"
                                                placeholder="Ej: Obligatorio traer toalla. Manillar doble polea incluido. Aforo máximo 4 entrenadores externos."
                                                value={rules}
                                                onChange={(e) => setRules(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button 
                                className="w-full bg-blue-500 text-white hover:bg-blue-600 font-bold text-sm py-3 mt-4" 
                                onClick={handleCreateSpace}
                                disabled={isSavingSpace}
                            >
                                {isSavingSpace ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Crear Espacio"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL PROGRAMAR RESERVA --- */}
            {showNewBookingModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setShowNewBookingModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold">✕</button>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-400" /> Programar Reserva de Espacio
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Seleccionar Zona</label>
                                <select 
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm"
                                    value={selectedSpaceId}
                                    onChange={(e) => setSelectedSpaceId(e.target.value)}
                                >
                                    <option value="" className="bg-zinc-950 text-zinc-500">-- Selecciona una zona --</option>
                                    {spaces.map(s => (
                                        <option key={s.id} value={s.id} className="bg-zinc-950 text-white">{s.name} (Capacidad: {s.capacity})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Entrenador Responsable</label>
                                <select 
                                    required
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm"
                                    value={selectedCoachId}
                                    onChange={(e) => setSelectedCoachId(e.target.value)}
                                >
                                    <option value="" className="bg-zinc-950 text-zinc-500">-- Selecciona un entrenador --</option>
                                    {staffList.map(c => (
                                        <option key={c.id} value={c.id} className="bg-zinc-950 text-white">
                                            {c.first_name ? `${c.first_name} ${c.last_name || ''}` : (c.business_name || c.email)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Nombre del Cliente / Notas</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm" 
                                    placeholder="Ej: Carlos Gómez (Entrenamiento Funcional)"
                                    value={bookingClientName}
                                    onChange={(e) => setBookingClientName(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-3">
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Fecha de Reserva</label>
                                    <input 
                                        required
                                        type="date" 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm"
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1.5">
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Inicio</label>
                                    <input 
                                        required
                                        type="time" 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm"
                                        value={bookingStartTime}
                                        onChange={(e) => setBookingStartTime(e.target.value)}
                                    />
                                </div>
                                <div className="col-span-1.5">
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Fin</label>
                                    <input 
                                        required
                                        type="time" 
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-blue-500 outline-none text-sm"
                                        value={bookingEndTime}
                                        onChange={(e) => setBookingEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button 
                                className="w-full bg-blue-500 text-white hover:bg-blue-600 font-bold text-sm py-3 mt-4" 
                                onClick={handleCreateBooking}
                                disabled={isSavingBooking}
                            >
                                {isSavingBooking ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Programar Reserva"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} onClose={() => {}} />
        </div>
    );
};

export default CenterSpaces;
