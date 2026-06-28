import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, BadgeCheck, Dumbbell, Instagram,
    Send, CheckCircle2, AlertCircle, Loader2, Zap,
    Monitor, Users, Globe
} from 'lucide-react';

const EXPERIENCE_LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];

interface CoachProfile {
    id: string;
    first_name: string;
    last_name: string;
    business_name: string;
    avatar_url: string;
    biography: string;
    specialties: string[];
    hourly_rate: number;
    location_address: string;
    modality: string;
    instagram_handle: string;
    is_promoted_marketplace: boolean;
    plan: string;
}

const CoachProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [coach, setCoach] = useState<CoachProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Lead form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [goals, setGoals] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [sending, setSending] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchCoach = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, business_name, avatar_url, biography, specialties, hourly_rate, location_address, modality, instagram_handle, is_promoted_marketplace, plan')
                .eq('id', id)
                .eq('is_public_marketplace', true)
                .single();

            if (error || !data) {
                setNotFound(true);
            } else {
                setCoach(data as CoachProfile);
            }
            setLoading(false);
        };
        fetchCoach();
    }, [id]);

    const handleSendLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) {
            setFormError('El nombre y el email son obligatorios.');
            return;
        }
        setSending(true);
        setFormError('');
        try {
            const { error } = await supabase.from('marketplace_leads').insert([{
                coach_id: id,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim() || null,
                goals: goals.trim() || null,
                experience_level: experienceLevel || null,
                status: 'new',
            }]);

            if (error) throw error;
            setFormStatus('success');
            setName(''); setEmail(''); setPhone(''); setGoals(''); setExperienceLevel('');
        } catch (err: any) {
            setFormStatus('error');
            setFormError(err.message || 'Error al enviar. Inténtalo de nuevo.');
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    if (notFound || !coach) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
                <Dumbbell className="w-12 h-12 text-zinc-700" />
                <p className="text-zinc-400">Este perfil no existe o no está disponible.</p>
                <button onClick={() => navigate('/coaches')} className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors">
                    ← Volver al directorio
                </button>
            </div>
        );
    }

    const displayName = coach.business_name || `${coach.first_name} ${coach.last_name}`;
    const isPremium = coach.is_promoted_marketplace || coach.plan === 'studio' || coach.plan === 'center';

    return (
        <div className="min-h-screen bg-black text-white">
            {/* ── NAVBAR ── */}
            <nav className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/coaches')}
                        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Directorio de Coaches</span>
                    </button>
                    <span className="text-zinc-700">/</span>
                    <span className="text-sm text-white font-medium truncate">{displayName}</span>
                </div>
            </nav>

            {/* ── HERO HEADER ── */}
            <div className="relative pt-16 overflow-hidden">
                {/* Glow bg */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-emerald-500/6 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 pt-16 pb-10 relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-zinc-800 border-2 border-zinc-700 overflow-hidden flex items-center justify-center shadow-2xl">
                                {coach.avatar_url ? (
                                    <img src={coach.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-black text-zinc-500">
                                        {(coach.first_name?.[0] || coach.business_name?.[0] || '?').toUpperCase()}
                                    </span>
                                )}
                            </div>
                            {isPremium && (
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-black rounded-full p-1.5 shadow-lg shadow-emerald-500/40 border-2 border-black">
                                    <BadgeCheck className="w-4 h-4" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-white">{displayName}</h1>
                                {isPremium && (
                                    <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                                        <BadgeCheck className="w-3.5 h-3.5" /> Coach Verificado FitLeader
                                    </span>
                                )}
                            </div>

                            {coach.first_name && coach.business_name && (
                                <p className="text-zinc-400 text-sm mb-2">{coach.first_name} {coach.last_name}</p>
                            )}

                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                                {coach.location_address && (
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4 text-emerald-500" />
                                        {coach.location_address}
                                    </span>
                                )}
                                {coach.modality && (
                                    <span className="flex items-center gap-1.5">
                                        {coach.modality === 'Online' ? <Monitor className="w-4 h-4 text-blue-400" /> :
                                            coach.modality === 'Presencial' ? <Users className="w-4 h-4 text-amber-400" /> :
                                                <Globe className="w-4 h-4 text-purple-400" />}
                                        {coach.modality}
                                    </span>
                                )}
                                {coach.instagram_handle && (
                                    <a
                                        href={`https://instagram.com/${coach.instagram_handle.replace('@', '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
                                    >
                                        <Instagram className="w-4 h-4" />
                                        {coach.instagram_handle.startsWith('@') ? coach.instagram_handle : `@${coach.instagram_handle}`}
                                    </a>
                                )}
                            </div>

                            {coach.hourly_rate && (
                                <div className="mt-3 inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
                                    <Zap className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm text-zinc-400">Desde</span>
                                    <span className="text-xl font-black text-white">{coach.hourly_rate}€</span>
                                    <span className="text-sm text-zinc-400">/ hora</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Bio + Specialties */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Bio */}
                        {coach.biography && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Sobre mí</h2>
                                <p className="text-zinc-300 leading-relaxed text-sm whitespace-pre-line">{coach.biography}</p>
                            </div>
                        )}

                        {/* Specialties */}
                        {coach.specialties && coach.specialties.length > 0 && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Especialidades</h2>
                                <div className="flex flex-wrap gap-2">
                                    {coach.specialties.map(s => (
                                        <span
                                            key={s}
                                            className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-sm font-medium px-3 py-1.5 rounded-lg"
                                        >
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Trust banner */}
                        {isPremium && (
                            <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
                                <div className="bg-emerald-500/20 rounded-xl p-2.5 flex-shrink-0">
                                    <BadgeCheck className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-emerald-300 font-semibold text-sm">Coach Verificado por FitLeader</p>
                                    <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                                        Este entrenador gestiona sus clientes, rutinas y pagos a través de FitLeader, garantizando un seguimiento profesional y sistemático.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Contact form */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
                            <h2 className="text-base font-bold text-white mb-1">¿Te interesa trabajar con {coach.first_name || displayName}?</h2>
                            <p className="text-zinc-400 text-xs mb-5 leading-relaxed">Déjale un mensaje y te responderá en menos de 24 horas.</p>

                            {formStatus === 'success' ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                                    <div className="bg-emerald-500/10 rounded-full p-4 border border-emerald-500/20">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <p className="text-white font-semibold">¡Mensaje enviado!</p>
                                    <p className="text-zinc-400 text-xs">El entrenador recibirá tu consulta y te contactará pronto.</p>
                                    <button onClick={() => setFormStatus('idle')} className="mt-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                                        Enviar otro mensaje
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSendLead} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nombre completo *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Tu nombre"
                                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email *</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="tucorreo@email.com"
                                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Teléfono <span className="text-zinc-600">(opcional)</span></label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            placeholder="+34 600 000 000"
                                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Nivel de experiencia</label>
                                        <div className="flex gap-2">
                                            {EXPERIENCE_LEVELS.map(lvl => (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() => setExperienceLevel(prev => prev === lvl ? '' : lvl)}
                                                    className={`flex-1 text-[10px] font-medium py-2 rounded-lg border transition-all ${experienceLevel === lvl
                                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                                                            : 'bg-black border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600'
                                                        }`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">¿Cuál es tu objetivo? <span className="text-zinc-600">(opcional)</span></label>
                                        <textarea
                                            value={goals}
                                            onChange={e => setGoals(e.target.value)}
                                            placeholder="Ej: Perder 10kg, mejorar mi resistencia para una carrera..."
                                            rows={3}
                                            className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                        />
                                    </div>

                                    {(formError || formStatus === 'error') && (
                                        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                            <p className="text-red-400 text-xs">{formError || 'Error al enviar. Inténtalo de nuevo.'}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-colors text-sm"
                                    >
                                        {sending ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Enviar consulta
                                            </>
                                        )}
                                    </button>

                                    <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                                        Tu información será compartida únicamente con este entrenador y no se utilizará para ningún otro fin.
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoachProfile;
