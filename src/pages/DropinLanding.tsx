import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Check, Loader2, MapPin, Clock, Users, Euro } from 'lucide-react';
import { Button } from '../components/ui/Button';

const DropinLanding = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [coach, setCoach] = useState<any>(null);
    const [availableSpots, setAvailableSpots] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        const fetchEventData = async () => {
            if (!eventId) return;

            try {
                // Fetch event with coach info
                const { data: eventData, error: eventError } = await supabase
                    .from('calendar_events')
                    .select(`
                        *,
                        profiles!calendar_events_assigned_staff_id_fkey (
                            business_name,
                            logo_url
                        )
                    `)
                    .eq('id', eventId)
                    .eq('is_public', true)
                    .single();

                if (eventError || !eventData) {
                    console.error('Event not found or not public');
                    return;
                }

                setEvent(eventData);
                setCoach(eventData.profiles);

                // Fetch bookings to calculate available spots
                const { data: bookings } = await supabase
                    .from('class_bookings')
                    .select('status')
                    .eq('event_id', eventId);

                const bookedCount = bookings?.filter(b => b.status === 'booked').length || 0;
                setAvailableSpots((eventData.max_capacity || 15) - bookedCount);

            } catch (err) {
                console.error('Error fetching event:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event || !formData.name || !formData.email) return;

        setSubmitting(true);

        try {
            // Check if client exists
            const { data: existingClient } = await supabase
                .from('clients')
                .select('id')
                .eq('email', formData.email)
                .eq('studio_id', event.studio_id)
                .maybeSingle();

            let clientId = existingClient?.id;

            // If not exists, create as lead
            if (!clientId) {
                const { data: newClient, error: clientError } = await supabase
                    .from('clients')
                    .insert({
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                        studio_id: event.studio_id,
                        status: 'lead'
                    })
                    .select('id')
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            // Create booking
            const { error: bookingError } = await supabase
                .from('class_bookings')
                .insert({
                    event_id: event.id,
                    client_id: clientId,
                    status: 'booked'
                });

            if (bookingError) throw bookingError;

            setSuccess(true);

        } catch (err) {
            console.error('Error booking:', err);
            alert('Error al realizar la reserva. Inténtalo de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Clase no encontrada</h1>
                    <p className="text-zinc-400">Esta clase podría no estar disponible o no ser pública.</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">¡Reserva Confirmada!</h1>
                    <p className="text-zinc-400 mb-6">
                        Tu plaza para <strong>{event.title}</strong> está reservada.
                        {event.dropin_price ? ` El pago de ${event.dropin_price}€ se realizará en el centro.` : ' La clase es gratuita.'}
                    </p>
                    <p className="text-sm text-zinc-500">
                        Recibirás más información por email si es necesario.
                    </p>
                </div>
            </div>
        );
    }

    const eventDate = new Date(event.date);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Header */}
            <div className="bg-zinc-900 border-b border-zinc-800">
                <div className="max-w-md mx-auto px-4 py-6">
                    {coach?.logo_url && (
                        <img 
                            src={coach.logo_url} 
                            alt={coach.business_name} 
                            className="w-12 h-12 rounded-full mx-auto mb-4 object-cover" 
                        />
                    )}
                    <h1 className="text-xl font-bold text-center">{coach?.business_name || 'Centro Deportivo'}</h1>
                </div>
            </div>

            {/* Event Details */}
            <div className="max-w-md mx-auto p-4 space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h2 className="text-2xl font-bold mb-4">{event.title}</h2>
                    
                    <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-zinc-300">
                            <Clock className="w-4 h-4" />
                            <span>{eventDate.toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })} a las {eventDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        
                        {event.location && (
                            <div className="flex items-center gap-2 text-zinc-300">
                                <MapPin className="w-4 h-4" />
                                <span>{event.location}</span>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-zinc-300">
                            <Users className="w-4 h-4" />
                            <span>{availableSpots} plazas disponibles</span>
                        </div>

                        {event.dropin_price && (
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                                <Euro className="w-4 h-4" />
                                <span>{event.dropin_price}€ por sesión</span>
                            </div>
                        )}
                    </div>

                    {event.description && (
                        <div className="mt-4 pt-4 border-t border-zinc-800">
                            <p className="text-zinc-400 text-sm">{event.description}</p>
                        </div>
                    )}
                </div>

                {/* Booking Form */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-4">Reservar mi plaza</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Nombre completo *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                placeholder="Tu nombre completo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                placeholder="+34 600 000 000"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={submitting || availableSpots <= 0}
                            className="w-full bg-emerald-500 text-black font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 
                             availableSpots <= 0 ? 'Clase completa' : 'Reservar plaza'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DropinLanding;