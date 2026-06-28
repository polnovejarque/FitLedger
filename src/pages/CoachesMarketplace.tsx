import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    Search, MapPin, BadgeCheck, ChevronRight,
    Dumbbell, SlidersHorizontal, X, Zap, Clock, Users
} from 'lucide-react';

const SPECIALTIES_LIST = [
    'Pérdida de Grasa', 'Hipertrofia', 'Fuerza', 'Resistencia',
    'Rehabilitación', 'Nutrición', 'Yoga/Pilates', 'CrossFit',
    'Running', 'Deporte Específico', 'Movilidad', 'Embarazo'
];

const MODALITIES = ['Presencial', 'Online', 'Híbrido'];

interface CoachCard {
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
    marketplace_signup_date: string;
}

const CoachesMarketplace = () => {
    const navigate = useNavigate();
    const [coaches, setCoaches] = useState<CoachCard[]>([]);
    const [filtered, setFiltered] = useState<CoachCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
    const [selectedModality, setSelectedModality] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchCoaches = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, business_name, avatar_url, biography, specialties, hourly_rate, location_address, modality, instagram_handle, is_promoted_marketplace, plan, marketplace_signup_date')
                .eq('is_public_marketplace', true)
                .order('is_promoted_marketplace', { ascending: false });

            if (!error && data) {
                // Sort: promoted + higher plan + older signup
                const planOrder: Record<string, number> = { center: 3, studio: 2, pro: 1 };
                const sorted = [...data].sort((a, b) => {
                    if (a.is_promoted_marketplace !== b.is_promoted_marketplace) {
                        return a.is_promoted_marketplace ? -1 : 1;
                    }
                    const planDiff = (planOrder[b.plan] || 0) - (planOrder[a.plan] || 0);
                    if (planDiff !== 0) return planDiff;
                    return new Date(a.marketplace_signup_date || 0).getTime() - new Date(b.marketplace_signup_date || 0).getTime();
                });
                setCoaches(sorted as CoachCard[]);
                setFiltered(sorted as CoachCard[]);
            }
            setLoading(false);
        };
        fetchCoaches();
    }, []);

    useEffect(() => {
        let result = [...coaches];
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                `${c.first_name} ${c.last_name}`.toLowerCase().includes(q) ||
                c.business_name?.toLowerCase().includes(q) ||
                c.biography?.toLowerCase().includes(q) ||
                c.location_address?.toLowerCase().includes(q) ||
                c.specialties?.some(s => s.toLowerCase().includes(q))
            );
        }
        if (selectedSpecialties.length > 0) {
            result = result.filter(c =>
                selectedSpecialties.every(s => c.specialties?.includes(s))
            );
        }
        if (selectedModality) {
            result = result.filter(c => c.modality === selectedModality);
        }
        setFiltered(result);
    }, [searchQuery, selectedSpecialties, selectedModality, coaches]);

    const toggleSpecialty = (s: string) => {
        setSelectedSpecialties(prev =>
            prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedSpecialties([]);
        setSelectedModality('');
    };

    const activeFiltersCount = selectedSpecialties.length + (selectedModality ? 1 : 0);

    return (
        <div className="min-h-screen bg-black text-white">
            {/* ── NAVBAR ── */}
            <nav className="fixed top-0 z-50 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-400 transition-colors">
                            <Dumbbell className="w-4 h-4 text-black" />
                        </div>
                        <span className="font-bold text-white text-lg">FitLeader</span>
                        <span className="text-zinc-500 text-sm ml-1">/ Coaches</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/auth')} className="text-zinc-400 hover:text-white text-sm transition-colors">
                            Acceso Coaches
                        </button>
                        <button
                            onClick={() => navigate('/auth?mode=register')}
                            className="bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold px-4 py-2 rounded-lg transition-colors"
                        >
                            Empezar Gratis
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section className="pt-32 pb-16 px-6 relative overflow-hidden">
                {/* Decorative glows */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-500/6 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Directorio de Entrenadores</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                        Encuentra tu
                        <span className="text-emerald-400"> Entrenador Personal</span>
                    </h1>
                    <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
                        Conecta con entrenadores certificados, verificados por FitLeader, para alcanzar tus objetivos.
                    </p>

                    {/* Search bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Busca por nombre, ciudad, especialidad..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors text-lg shadow-xl"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-8 mt-8 text-sm text-zinc-500">
                        <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500" />{coaches.length} entrenadores activos</span>
                        <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-emerald-500" />Verificados por FitLeader</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-500" />Respuesta en 24h</span>
                    </div>
                </div>
            </section>

            {/* ── FILTERS + GRID ── */}
            <section className="max-w-7xl mx-auto px-6 pb-20">

                {/* Filter bar */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                    <button
                        onClick={() => setShowFilters(f => !f)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${showFilters || activeFiltersCount > 0
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filtros
                        {activeFiltersCount > 0 && (
                            <span className="bg-emerald-500 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFiltersCount}</span>
                        )}
                    </button>

                    {MODALITIES.map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedModality(prev => prev === m ? '' : m)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${selectedModality === m
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                                }`}
                        >
                            {m}
                        </button>
                    ))}

                    {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors ml-auto">
                            <X className="w-3.5 h-3.5" /> Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Specialty filter panel */}
                {showFilters && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-8 animate-in fade-in slide-in-from-top-2">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Especialidades</p>
                        <div className="flex flex-wrap gap-2">
                            {SPECIALTIES_LIST.map(s => (
                                <button
                                    key={s}
                                    onClick={() => toggleSpecialty(s)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedSpecialties.includes(s)
                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                            : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results count */}
                <p className="text-zinc-500 text-sm mb-6">
                    {loading ? 'Cargando entrenadores...' : `${filtered.length} entrenador${filtered.length !== 1 ? 'es' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
                </p>

                {/* Coach grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-pulse">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-800" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-zinc-800 rounded w-32" />
                                        <div className="h-3 bg-zinc-800 rounded w-24" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-zinc-800 rounded" />
                                    <div className="h-3 bg-zinc-800 rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-zinc-800 rounded-2xl">
                        <Dumbbell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-400 font-medium">No se encontraron entrenadores con esos filtros.</p>
                        <button onClick={clearFilters} className="mt-3 text-emerald-400 text-sm hover:text-emerald-300 transition-colors">
                            Limpiar filtros
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(coach => (
                            <CoachCardComponent key={coach.id} coach={coach} onClick={() => navigate(`/coaches/${coach.id}`)} />
                        ))}
                    </div>
                )}
            </section>

            {/* ── FOOTER CTA ── */}
            <section className="border-t border-zinc-800 bg-zinc-900/30">
                <div className="max-w-4xl mx-auto px-6 py-16 text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">¿Eres entrenador personal?</h2>
                    <p className="text-zinc-400 mb-6">Únete a FitLeader y consigue clientes a través del marketplace. Los primeros 30 días son gratis.</p>
                    <button
                        onClick={() => navigate('/auth?mode=register')}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-3.5 rounded-xl transition-colors text-sm"
                    >
                        Registrarme como Coach →
                    </button>
                </div>
            </section>
        </div>
    );
};

const CoachCardComponent = ({ coach, onClick }: { coach: CoachCard; onClick: () => void }) => {
    const isPremium = coach.is_promoted_marketplace || coach.plan === 'studio' || coach.plan === 'center';
    const displayName = coach.business_name || `${coach.first_name} ${coach.last_name}`;

    return (
        <div
            onClick={onClick}
            className={`group relative bg-zinc-900 border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isPremium
                    ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-emerald-500/10'
                    : 'border-zinc-800 hover:border-zinc-600 hover:shadow-black/50'
                }`}
        >
            {/* Premium badge */}
            {isPremium && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 bg-emerald-500 text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-500/30">
                    <BadgeCheck className="w-3 h-3" />
                    VERIFICADO
                </div>
            )}

            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-zinc-700 group-hover:border-emerald-500/50 transition-colors">
                    {coach.avatar_url ? (
                        <img src={coach.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-black text-zinc-500">
                            {(coach.first_name?.[0] || coach.business_name?.[0] || '?').toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base leading-tight truncate group-hover:text-emerald-400 transition-colors">
                        {displayName}
                    </h3>
                    {coach.first_name && coach.business_name && (
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">{coach.first_name} {coach.last_name}</p>
                    )}
                    {coach.location_address && (
                        <p className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{coach.location_address}</span>
                        </p>
                    )}
                </div>
            </div>

            {/* Bio */}
            {coach.biography && (
                <p className="text-zinc-400 text-xs leading-relaxed mb-4 line-clamp-2">{coach.biography}</p>
            )}

            {/* Specialties */}
            {coach.specialties && coach.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {coach.specialties.slice(0, 3).map(s => (
                        <span key={s} className="bg-zinc-800 text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-700">
                            {s}
                        </span>
                    ))}
                    {coach.specialties.length > 3 && (
                        <span className="text-zinc-500 text-[10px] px-1">+{coach.specialties.length - 3}</span>
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                <div className="flex items-center gap-3">
                    {coach.modality && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${coach.modality === 'Online'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : coach.modality === 'Presencial'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                            {coach.modality}
                        </span>
                    )}
                    {coach.hourly_rate && (
                        <span className="text-xs text-zinc-400 font-medium">
                            desde <span className="text-white font-bold">{coach.hourly_rate}€</span>/h
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1 text-emerald-500 group-hover:gap-2 transition-all">
                    <span className="text-xs font-semibold">Ver perfil</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </div>
            </div>
        </div>
    );
};

export default CoachesMarketplace;
