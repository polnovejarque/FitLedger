import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import ToastContainer from '../components/ui/ToastContainer';
import { sendBookingRequestEmail } from '../services/emailService';
import { 
    Building2, Search, MapPin, Calendar, Clock, 
    BookOpen, Phone, Mail, Loader2, ShieldAlert
} from 'lucide-react';
import CheckoutPaymentModal from '../components/CheckoutPaymentModal';

interface CenterProfile {
    id: string;
    business_name: string;
    email: string;
    contact_phone: string | null;
    contact_email: string | null;
    logo_url: string | null;
}

interface GymSpace {
    id: string;
    center_id: string;
    name: string;
    capacity: number;
    description: string | null;
    is_public_marketplace: boolean;
    price_per_hour: number;
    rules: string | null;
    center: CenterProfile;
}

interface SpaceBooking {
    id: string;
    space_id: string;
    coach_id: string;
    client_name: string | null;
    booking_date: string;
    start_time: string;
    end_time: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    payment_status: 'pending' | 'pending_verification' | 'paid' | 'free';
    payment_method: string | null;
    total_amount: number;
    spaces: {
        name: string;
        price_per_hour: number;
        center: {
            business_name: string;
            contact_phone: string | null;
            contact_email: string | null;
            stripe_public_key: string | null;
            payment_bizum_phone: string | null;
            payment_iban: string | null;
        };
    };
}

const SearchCenters = () => {
    const [toasts, setToasts] = useState<any[]>([]);
    
    const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        const idToast = `toast-${Date.now()}`;
        setToasts((prev) => [...prev, { id: idToast, message, type, onClose: (id: string) => setToasts(p => p.filter(t => t.id !== id)) }]);
    };

    const [spaces, setSpaces] = useState<GymSpace[]>([]);
    const [myBookings, setMyBookings] = useState<SpaceBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'explore' | 'bookings'>('explore');

    // Filtros de búsqueda
    const [searchQuery, setSearchQuery] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [coachName, setCoachName] = useState("Entrenador");

    // Modal de reserva
    const [selectedSpace, setSelectedSpace] = useState<GymSpace | null>(null);
    const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookingStartTime, setBookingStartTime] = useState("10:00");
    const [bookingEndTime, setBookingEndTime] = useState("11:00");
    const [clientNotes, setClientNotes] = useState("");
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

    // Payment states
    const [activePaymentBooking, setActivePaymentBooking] = useState<SpaceBooking | null>(null);
    const [isBookingCheckoutOpen, setIsBookingCheckoutOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
                // Cargar nombre del coach
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, business_name')
                    .eq('id', user.id)
                    .single();
                if (profile) {
                    setCoachName(profile.business_name || `${profile.first_name} ${profile.last_name}` || "Entrenador");
                }
                await loadData(user.id);
            }
        };
        fetchUser();
    }, []);

    const loadData = async (userId: string) => {
        setIsLoading(true);
        try {
            // 1. Cargar salas públicas
            const { data: spacesData, error: spacesError } = await supabase
                .from('spaces')
                .select(`
                    *,
                    center:center_id (id, business_name, email, contact_phone, contact_email, logo_url)
                `)
                .eq('is_public_marketplace', true);

            if (spacesError) throw spacesError;
            setSpaces((spacesData as any) || []);

            // 2. Cargar mis reservas
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('space_bookings')
                .select(`
                    *,
                    spaces (
                        name, 
                        price_per_hour,
                        center:center_id (
                            business_name, 
                            contact_phone, 
                            contact_email,
                            stripe_public_key,
                            payment_bizum_phone,
                            payment_iban
                        )
                    )
                `)
                .eq('coach_id', userId)
                .order('booking_date', { ascending: false });

            if (bookingsError) throw bookingsError;
            setMyBookings((bookingsData as any) || []);

        } catch (err: any) {
            console.error(err);
            addToast("Error al cargar datos: " + err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Calcular coste estimado de reserva
    const calculateEstimatedCost = (price: number) => {
        const [hStart, mStart] = bookingStartTime.split(':').map(Number);
        const [hEnd, mEnd] = bookingEndTime.split(':').map(Number);
        if (isNaN(hStart) || isNaN(hEnd)) return 0;
        
        const mins = (hEnd * 60 + mEnd) - (hStart * 60 + mStart);
        if (mins <= 0) return 0;
        
        const hours = mins / 60;
        return parseFloat((price * hours).toFixed(2));
    };

    const handleCreateBooking = async () => {
        if (!selectedSpace || !currentUserId) return;
        
        const cost = calculateEstimatedCost(selectedSpace.price_per_hour);
        if (cost <= 0) {
            alert("La hora de finalización debe ser posterior a la de inicio.");
            return;
        }

        setIsSubmittingBooking(true);
        try {
            const { error } = await supabase.from('space_bookings').insert([{
                space_id: selectedSpace.id,
                coach_id: currentUserId,
                client_name: clientNotes || "Entrenamiento libre",
                booking_date: bookingDate,
                start_time: bookingStartTime,
                end_time: bookingEndTime,
                booking_type: 'external',
                status: 'pending',
                total_amount: cost,
                payment_status: 'pending'
            }]);

            if (error) throw error;

            // Enviar email de notificación al centro deportivo
            const centerEmail = selectedSpace.center?.contact_email || selectedSpace.center?.email;
            if (centerEmail) {
                sendBookingRequestEmail(
                    centerEmail,
                    coachName,
                    selectedSpace.name,
                    bookingDate,
                    bookingStartTime,
                    bookingEndTime,
                    cost
                ).catch(console.error);
            }

            addToast("Solicitud de reserva enviada correctamente 🚀", "success");
            setSelectedSpace(null);
            setClientNotes("");
            await loadData(currentUserId);
        } catch (err: any) {
            alert("Error al procesar reserva: " + err.message);
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    const handleBookingPaymentSuccess = async (method: 'stripe' | 'bizum' | 'bank_transfer') => {
        if (!activePaymentBooking || !currentUserId) return;
        const nextPaymentStatus = method === 'stripe' ? 'paid' : 'pending_verification';

        try {
            const { error } = await supabase
                .from('space_bookings')
                .update({
                    payment_status: nextPaymentStatus,
                    payment_method: method
                })
                .eq('id', activePaymentBooking.id);

            if (error) throw error;

            addToast(
                method === 'stripe'
                    ? "¡Pago por tarjeta recibido con éxito! ✅"
                    : "¡Pago enviado para verificación del gimnasio! 🔍",
                "success"
            );
            await loadData(currentUserId);
        } catch (err: any) {
            alert("Error al guardar estado de pago: " + err.message);
        } finally {
            setIsBookingCheckoutOpen(false);
            setActivePaymentBooking(null);
        }
    };

    const filteredSpaces = spaces.filter(space => {
        const matchesQuery = 
            space.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (space.description && space.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (space.center.business_name && space.center.business_name.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesPrice = !maxPrice || space.price_per_hour <= parseFloat(maxPrice);
        
        return matchesQuery && matchesPrice;
    });

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans space-y-8 animate-in fade-in duration-500">
            {/* CABECERA */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-8 h-8 text-emerald-400" />
                        <h1 className="text-3xl font-bold text-white">Buscar Salas y Centros</h1>
                    </div>
                    <p className="text-zinc-400">Encuentra y alquila espacios de entrenamiento por horas para entrenar a tus clientes.</p>
                </div>
                
                <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveTab('explore')}
                        className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                            activeTab === 'explore' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Explorar Centros ({filteredSpaces.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                            activeTab === 'bookings' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Mis Alquileres ({myBookings.length})
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="min-h-[400px] flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
            ) : (
                <>
                    {activeTab === 'explore' ? (
                        <div className="space-y-6">
                            {/* BARRA DE FILTROS */}
                            <div className="flex flex-col sm:flex-row gap-4 bg-zinc-900/50 p-4 border border-zinc-800 rounded-2xl">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                    <Input 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-zinc-950 border-zinc-800 focus:border-emerald-500"
                                        placeholder="Buscar por zona, equipamiento o nombre del centro..."
                                    />
                                </div>
                                <div className="sm:w-60">
                                    <Input 
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="bg-zinc-950 border-zinc-800 focus:border-emerald-500"
                                        placeholder="Tarifa máxima (€/h)"
                                    />
                                </div>
                            </div>

                            {/* GRID DE SALAS */}
                            {filteredSpaces.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSpaces.map(space => (
                                        <div 
                                            key={space.id}
                                            className="bg-[#111] border border-zinc-800 hover:border-zinc-700 rounded-3xl p-6 relative overflow-hidden transition-all group flex flex-col justify-between"
                                        >
                                            <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 blur-[60px] rounded-full pointer-events-none" />
                                            
                                            <div>
                                                <div className="flex justify-between items-start gap-4 mb-4">
                                                    <div>
                                                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                            {space.center.business_name || "Centro Asociado"}
                                                        </span>
                                                        <h3 className="text-xl font-bold text-white mt-1 group-hover:text-emerald-400 transition-colors">
                                                            {space.name}
                                                        </h3>
                                                    </div>
                                                    <span className="text-lg font-black text-emerald-400 whitespace-nowrap bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-xl">
                                                        {space.price_per_hour}€<span className="text-xs font-normal text-zinc-500">/h</span>
                                                    </span>
                                                </div>

                                                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                                                    {space.description || "Espacio polivalente listo para entrenamiento personal."}
                                                </p>

                                                {/* CONTACTO DEL CENTRO */}
                                                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 mb-4 text-xs">
                                                    <p className="font-bold text-zinc-300 flex items-center gap-1.5 mb-2">
                                                        <Building2 className="w-3.5 h-3.5 text-zinc-500" /> Datos de Contacto Directo:
                                                    </p>
                                                    <p className="flex items-center gap-2 text-zinc-400">
                                                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                        <span className="truncate">{space.center.contact_email || space.center.email}</span>
                                                    </p>
                                                    {space.center.contact_phone && (
                                                        <p className="flex items-center gap-2 text-zinc-400">
                                                            <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                                                            <span>{space.center.contact_phone}</span>
                                                        </p>
                                                    )}
                                                </div>

                                                {space.rules && (
                                                    <div className="text-[11px] text-zinc-500 leading-relaxed border-t border-zinc-900 pt-3 mb-4">
                                                        <strong className="text-zinc-400">Normas del centro: </strong> {space.rules}
                                                    </div>
                                                )}
                                            </div>

                                            <Button 
                                                onClick={() => {
                                                    setSelectedSpace(space);
                                                    setBookingDate(new Date().toISOString().split('T')[0]);
                                                }}
                                                className="w-full bg-zinc-900 hover:bg-emerald-500 hover:text-black border border-zinc-800 hover:border-emerald-500 font-bold text-xs py-3 mt-2 rounded-xl transition-all"
                                            >
                                                Reservar por Horas
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-zinc-800 rounded-3xl p-16 text-center text-zinc-500">
                                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-25 text-emerald-400" />
                                    <p className="text-base font-semibold">No se encontraron espacios.</p>
                                    <p className="text-xs text-zinc-600 mt-1">Prueba a ajustar tus filtros de búsqueda o precio.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* LISTADO DE MIS RESERVAS */
                        <div className="bg-[#111] border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                            <div className="p-4 bg-zinc-900/40 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400 uppercase tracking-wider font-semibold">
                                <span>Espacio / Gimnasio</span>
                                <span>Fecha & Horas</span>
                            </div>

                            <div className="divide-y divide-zinc-800">
                                {myBookings.length > 0 ? (
                                    myBookings.map(booking => {
                                        const statusColors = {
                                            pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                                            approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                            rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
                                            cancelled: 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                        };

                                        const statusLabels = {
                                            pending: 'Pendiente Aprobación',
                                            approved: 'Aprobada ✅',
                                            rejected: 'Rechazada ✕',
                                            cancelled: 'Cancelada'
                                        };

                                        const paymentStatusColors = {
                                            pending: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                                            pending_verification: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                                            paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                                            free: 'bg-zinc-800 text-zinc-500 border-zinc-700'
                                        };

                                        const paymentStatusLabels = {
                                            pending: 'Pago Pendiente ⏳',
                                            pending_verification: 'Verificando Pago 🔍',
                                            paid: 'Pagado ✅',
                                            free: 'Gratuito'
                                        };

                                        return (
                                            <div key={booking.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-zinc-900/20 transition-all border-b border-zinc-900/50">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full">
                                                            {booking.spaces?.name || "Espacio eliminado"}
                                                        </span>
                                                        <span className="text-zinc-600 text-xs">•</span>
                                                        <span className="text-xs text-zinc-400 font-bold">
                                                            {booking.spaces?.center?.business_name || "Gimnasio"}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 italic">Notas: {booking.client_name || "Ninguna"}</p>
                                                    
                                                    {/* Contacto del gimnasio */}
                                                    <div className="flex gap-4 text-[11px] text-zinc-400">
                                                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-zinc-600" /> {booking.spaces?.center?.contact_email}</span>
                                                        {booking.spaces?.center?.contact_phone && (
                                                            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-zinc-600" /> {booking.spaces?.center?.contact_phone}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-end gap-6 justify-between w-full md:w-auto border-t border-zinc-900 md:border-none pt-4 md:pt-0">
                                                    <div className="text-left md:text-right space-y-1">
                                                        <p className="text-xs text-zinc-400 font-medium flex items-center gap-1 md:justify-end">
                                                            <Calendar className="w-3.5 h-3.5 text-zinc-500" /> {booking.booking_date}
                                                        </p>
                                                        <p className="text-sm font-bold text-white flex items-center gap-1 md:justify-end">
                                                            <Clock className="w-3.5 h-3.5 text-zinc-500" /> {booking.start_time} - {booking.end_time}
                                                        </p>
                                                        <p className="text-xs font-bold text-emerald-400">{booking.total_amount} €</p>
                                                    </div>
                                                    <div className="flex flex-col gap-2 items-end">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status]}`}>
                                                            {statusLabels[booking.status]}
                                                        </span>
                                                        {booking.status === 'approved' && (
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${paymentStatusColors[booking.payment_status || 'pending']}`}>
                                                                {paymentStatusLabels[booking.payment_status || 'pending']}
                                                            </span>
                                                        )}
                                                        {booking.status === 'approved' && (booking.payment_status === 'pending' || !booking.payment_status) && (
                                                            <Button
                                                                onClick={() => {
                                                                    setActivePaymentBooking(booking);
                                                                    setIsBookingCheckoutOpen(true);
                                                                }}
                                                                className="bg-emerald-500 text-black hover:bg-emerald-400 text-xs font-bold py-1.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 cursor-pointer"
                                                            >
                                                                Pagar Alquiler
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-20 text-center text-zinc-500">
                                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-25 text-emerald-400" />
                                        <p className="text-sm">Aún no has solicitado ningún alquiler.</p>
                                        <p className="text-xs text-zinc-600 mt-1">Explora los centros y envía tu primera propuesta de reserva.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* CHECKOUT MODAL PARA ALQUILERES */}
            {activePaymentBooking && (
                <CheckoutPaymentModal
                    isOpen={isBookingCheckoutOpen}
                    onClose={() => { setIsBookingCheckoutOpen(false); setActivePaymentBooking(null); }}
                    amount={activePaymentBooking.total_amount}
                    title={`Pagar Alquiler: ${activePaymentBooking.spaces?.name || "Espacio"}`}
                    description={`Centro: ${activePaymentBooking.spaces?.center?.business_name || "Gimnasio"}`}
                    stripePublicKey={activePaymentBooking.spaces?.center?.stripe_public_key || undefined}
                    bizumPhone={activePaymentBooking.spaces?.center?.payment_bizum_phone || undefined}
                    bankIban={activePaymentBooking.spaces?.center?.payment_iban || undefined}
                    onPaymentSuccess={handleBookingPaymentSuccess}
                />
            )}

            {/* --- MODAL RESERVAR SALA --- */}
            {selectedSpace && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#111] border border-zinc-800 w-full max-w-md rounded-2xl p-6 relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setSelectedSpace(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white text-lg font-bold">✕</button>
                        
                        <div className="mb-6">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                                Alquiler B2B
                            </span>
                            <h2 className="text-2xl font-bold text-white mt-2">Reservar {selectedSpace.name}</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">{selectedSpace.center.business_name}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Fecha del Entrenamiento</label>
                                <input 
                                    required
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none text-sm"
                                    value={bookingDate}
                                    onChange={(e) => setBookingDate(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Hora Inicio</label>
                                    <input 
                                        required
                                        type="time"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none text-sm"
                                        value={bookingStartTime}
                                        onChange={(e) => setBookingStartTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1.5 block">Hora Fin</label>
                                    <input 
                                        required
                                        type="time"
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none text-sm"
                                        value={bookingEndTime}
                                        onChange={(e) => setBookingEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-zinc-400 mb-1.5 block">Atleta / Notas (Opcional)</label>
                                <input 
                                    type="text"
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:border-emerald-500 outline-none text-sm"
                                    placeholder="Ej: Juan Pérez - Sesión Pierna"
                                    value={clientNotes}
                                    onChange={(e) => setClientNotes(e.target.value)}
                                />
                            </div>

                            {/* COST CALCULATION */}
                            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex justify-between items-center mt-6">
                                <div>
                                    <span className="text-xs text-zinc-500 block">Tarifa por hora</span>
                                    <span className="text-sm font-bold text-white">{selectedSpace.price_per_hour} €/h</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-zinc-500 block">Total Estimado</span>
                                    <span className="text-xl font-black text-emerald-400">
                                        {calculateEstimatedCost(selectedSpace.price_per_hour)} €
                                    </span>
                                </div>
                            </div>

                            {selectedSpace.rules && (
                                <div className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex gap-2 text-[10px] text-zinc-400">
                                    <ShieldAlert className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                    <span>
                                        Al solicitar confirmas cumplir las normas: <strong>{selectedSpace.rules}</strong>
                                    </span>
                                </div>
                            )}

                            <Button 
                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm py-3.5 mt-4 rounded-xl shadow-lg shadow-emerald-500/10"
                                onClick={handleCreateBooking}
                                disabled={isSubmittingBooking}
                            >
                                {isSubmittingBooking ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "Enviar Solicitud de Reserva"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer toasts={toasts} onClose={() => {}} />
        </div>
    );
};

export default SearchCenters;
