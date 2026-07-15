import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
    User, Building2, CreditCard, Shield, Key, 
    Upload, Camera, Eye, EyeOff, LogOut,
    CheckCircle2, XCircle, Loader2,
    Sun, Moon, Store, Globe, MapPin, Instagram, ExternalLink as LinkIcon, ToggleLeft, ToggleRight,
    Phone, Building, X, Bell
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import CheckoutPaymentModal from '../components/CheckoutPaymentModal';

type TabType = 'profile' | 'business' | 'subscription' | 'security' | 'payments' | 'appearance' | 'marketplace' | 'notifications';

const tabs = [
    { id: 'profile' as TabType, label: 'Mi Perfil', icon: User, color: 'text-emerald-500' },
    { id: 'business' as TabType, label: 'Negocio', icon: Building2, color: 'text-blue-500' },
    { id: 'marketplace' as TabType, label: 'Marketplace', icon: Store, color: 'text-emerald-400' },
    { id: 'payments' as TabType, label: 'Pagos & Integraciones', icon: Key, color: 'text-orange-500' },
    { id: 'subscription' as TabType, label: 'Suscripción', icon: CreditCard, color: 'text-purple-500' },
    { id: 'notifications' as TabType, label: 'Notificaciones', icon: Bell, color: 'text-yellow-500' },
    { id: 'appearance' as TabType, label: 'Apariencia', icon: Sun, color: 'text-amber-400' },
    { id: 'security' as TabType, label: 'Seguridad', icon: Shield, color: 'text-red-500' },
];

const SPECIALTIES_OPTIONS = [
    'Pérdida de Grasa', 'Hipertrofia', 'Fuerza', 'Resistencia',
    'Rehabilitación', 'Nutrición', 'Yoga/Pilates', 'CrossFit',
    'Running', 'Deporte Específico', 'Movilidad', 'Embarazo'
];

const currencies = [
    { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
    { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'Dólar' },
    { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'Libra' },
];

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Profile state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    // Business state
    const [businessName, setBusinessName] = useState('');
    const [currency, setCurrency] = useState('EUR');
    const [logoUrl, setLogoUrl] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Payment integration state
    const [stripePublicKey, setStripePublicKey] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [paymentBizumPhone, setPaymentBizumPhone] = useState('');
    const [paymentIban, setPaymentIban] = useState('');
    const [showPublicKey, setShowPublicKey] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Billing and Appearance
    const [plan, setPlan] = useState('pro');
    const [role, setRole] = useState<'coach' | 'center' | 'admin' | ''>('');
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    // Marketplace state
    const [userId, setUserId] = useState<string | null>(null);
    const [isPublicMarketplace, setIsPublicMarketplace] = useState(false);
    const [isPromotedMarketplace, setIsPromotedMarketplace] = useState(false);
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [experienceDesc, setExperienceDesc] = useState('');
    const [biography, setBiography] = useState('');
    const [specialties, setSpecialties] = useState<string[]>([]);
    const [hourlyRate, setHourlyRate] = useState('');
    const [locationAddress, setLocationAddress] = useState('');
    const [modality, setModality] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [marketplaceSaved, setMarketplaceSaved] = useState(false);

    // Notifications (Resend API & Logs)
    const [resendApiKey, setResendApiKeyVar] = useState(localStorage.getItem('fitleader_resend_api_key') || '');
    const [emailLogs, setEmailLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        if (activeTab !== 'notifications') return;
        
        const fetchLogs = async () => {
            setIsLoadingLogs(true);
            const { data, error } = await supabase
                .from('email_logs')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) {
                console.error("Error fetching email logs:", error);
            } else if (data) {
                setEmailLogs(data);
            }
            setIsLoadingLogs(false);
        };
        fetchLogs();
    }, [activeTab]);

    const handleSaveResendKey = () => {
        if (resendApiKey.trim()) {
            localStorage.setItem('fitleader_resend_api_key', resendApiKey.trim());
            alert("Clave de API de Resend guardada de forma privada en tu navegador. ✅");
        } else {
            localStorage.removeItem('fitleader_resend_api_key');
            alert("Clave de API de Resend eliminada. El sistema simulará los envíos por consola. ✕");
        }
    };

    // Onboarding & Payment modals state
    const [onboardingOpen, setOnboardingOpen] = useState(false);
    const [onboardingStep, setOnboardingStep] = useState(1);
    const [onbAge, setOnbAge] = useState('');
    const [onbHeight, setOnbHeight] = useState('');
    const [onbExperience, setOnbExperience] = useState('');
    const [onbFirstName, setOnbFirstName] = useState('');
    const [onbLastName, setOnbLastName] = useState('');
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // --- 1. CARGAR DATOS DESDE SUPABASE ---
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                setEmail(user.email || '');
                setUserId(user.id);
                
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    setFirstName(data.first_name || '');
                    setLastName(data.last_name || '');
                    setAvatarUrl(data.avatar_url || '');
                    setBusinessName(data.business_name || '');
                    setCurrency(data.currency || 'EUR');
                    setLogoUrl(data.logo_url || ''); 
                    if (data.plan) setPlan(data.plan);
                    if (data.role) setRole(data.role);
                    setContactPhone(data.contact_phone || '');
                    setContactEmail(data.contact_email || '');
                    // Marketplace fields
                    setIsPublicMarketplace(data.is_public_marketplace || false);
                    setIsPromotedMarketplace(data.is_promoted_marketplace || false);
                    setBiography(data.biography || '');
                    setSpecialties(data.specialties || []);
                    setHourlyRate(data.hourly_rate ? String(data.hourly_rate) : '');
                    setLocationAddress(data.location_address || '');
                    setModality(data.modality || '');
                    setInstagramHandle(data.instagram_handle || '');
                    setAge(data.age ? String(data.age) : '');
                    setHeight(data.height ? String(data.height) : '');
                    setExperienceDesc(data.experience_desc || '');
                    // Stripe / Payment keys
                    setStripePublicKey(data.stripe_public_key || '');
                    setStripeSecretKey(data.stripe_secret_key || '');
                    setPaymentBizumPhone(data.payment_bizum_phone || '');
                    setPaymentIban(data.payment_iban || '');
                }
            }
            setIsLoading(false);
        };
        loadProfile();
    }, []);

    // --- MARKETPLACE HANDLERS ---
    const toggleSpecialty = (s: string) => {
        setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const handleSaveMarketplace = async () => {
        if (!userId) return;
        setIsSaving(true);
        setMarketplaceSaved(false);
        const { error } = await supabase.from('profiles').update({
            is_public_marketplace: isPublicMarketplace,
            biography: biography.trim() || null,
            specialties: specialties.length > 0 ? specialties : null,
            hourly_rate: hourlyRate ? parseFloat(hourlyRate) : null,
            location_address: locationAddress.trim() || null,
            modality: modality || null,
            instagram_handle: instagramHandle.trim() || null,
            first_name: firstName.trim() || null,
            last_name: lastName.trim() || null,
            age: age ? parseInt(age) : null,
            height: height ? parseFloat(height) : null,
            experience_desc: experienceDesc.trim() || null,
            marketplace_signup_date: isPublicMarketplace ? new Date().toISOString() : null,
        }).eq('id', userId);
        setIsSaving(false);
        if (!error) {
            setMarketplaceSaved(true);
            alert('¡Perfil del marketplace guardado correctamente! ✅');
        } else {
            alert('Error al guardar: ' + error.message);
        }
    };

    // --- HANDLERS ---

    const handleThemeChange = (newTheme: 'dark' | 'light') => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        window.dispatchEvent(new Event('theme-change'));
    };

    const handleUpgradePlan = async (newPlan: 'pro' | 'studio' | 'center' | 'elite') => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    plan: newPlan,
                    subscription_plan: newPlan 
                })
                .eq('id', user.id);
                
            if (error) {
                alert("Error al cambiar plan: " + error.message);
            } else {
                setPlan(newPlan);
                alert(`¡Plan actualizado con éxito a FitLeader ${newPlan.toUpperCase()}! ✅`);
                window.location.reload();
            }
        }
        setIsSaving(false);
    };

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const updates = {
                id: user.id,
                first_name: firstName,
                last_name: lastName,
                business_name: businessName,
                currency: currency,
                avatar_url: avatarUrl, 
                logo_url: logoUrl, 
                contact_phone: contactPhone.trim() || null,
                contact_email: contactEmail.trim() || null,
                updated_at: new Date().toISOString(), // Formato seguro
            };

            const { error } = await supabase.from('profiles').upsert(updates);
            if (error) {
                alert("Error al guardar: " + error.message);
            } else {
                // Forzamos recarga para que el Sidebar (que está fuera) vea el nuevo nombre
                window.location.reload(); 
            }
        }
        setIsSaving(false);
    };

    const uploadImageToStorage = async (file: File, prefix: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${prefix}_${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage.from('avatars').upload(fileName, file);
        if (error) throw error;

        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        return data.publicUrl;
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadImageToStorage(file, 'avatar');
            setAvatarUrl(url);
            
            // AUTO-GUARDAR EN BASE DE DATOS
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id);
            }
            // Recargamos para actualizar menús superiores si los hubiera
            window.location.reload();
        } catch (error: any) {
            alert("Error al subir imagen: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    // EL ARREGLO ESTRELLA: Guardado automático del logo
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const url = await uploadImageToStorage(file, 'logo');
            setLogoUrl(url);
            
            // AUTO-GUARDAR DIRECTO A LA BASE DE DATOS
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('profiles').update({ logo_url: url }).eq('id', user.id);
            }
            
            // Recargamos la página mágicamente para que el Sidebar se actualice al instante
            window.location.reload();
        } catch (error: any) {
            alert("Error al subir logo: " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) return alert("Rellena los campos de nueva contraseña.");
        if (newPassword !== confirmPassword) return alert("Las contraseñas no coinciden.");
        if (newPassword.length < 6) return alert("La contraseña debe tener al menos 6 caracteres.");

        setIsSaving(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        
        if (error) {
            alert("Error: " + error.message);
        } else {
            alert("Contraseña actualizada correctamente ✅");
            setNewPassword('');
            setConfirmPassword('');
            setCurrentPassword('');
        }
        setIsSaving(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const handleSavePayments = async () => {
        setIsSaving(true);
        setConnectionStatus('idle');
        setErrorMessage('');

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert('Sesión expirada. Por favor, vuelve a iniciar sesión.');
            setIsSaving(false);
            return;
        }

        if (stripePublicKey.trim() || stripeSecretKey.trim()) {
            const isValidPublic = stripePublicKey.trim().startsWith('pk_');
            const isValidSecret = stripeSecretKey.trim().startsWith('sk_');

            if (!isValidPublic || !isValidSecret) {
                setConnectionStatus('error');
                setErrorMessage('Formato de Stripe incorrecto. Deben empezar por "pk_" y "sk_".');
                setIsSaving(false);
                return;
            }
        }

        const { error } = await supabase
            .from('profiles')
            .update({
                stripe_public_key: stripePublicKey.trim() || null,
                stripe_secret_key: stripeSecretKey.trim() || null,
                payment_bizum_phone: paymentBizumPhone.trim() || null,
                payment_iban: paymentIban.trim() || null
            })
            .eq('id', user.id);

        setIsSaving(false);
        if (error) {
            setConnectionStatus('error');
            setErrorMessage('Error al guardar: ' + error.message);
        } else {
            setConnectionStatus('success');
            alert('¡Métodos de pago guardados correctamente! ✅');
        }
    };

    // Onboarding handlers
    const handleStartOnboarding = () => {
        setOnbFirstName(firstName);
        setOnbLastName(lastName);
        setOnbAge(age);
        setOnbHeight(height);
        setOnbExperience(experienceDesc);
        setOnboardingStep(1);
        setOnboardingOpen(true);
    };

    const handleOnboardingNext = () => {
        if (!onbFirstName.trim() || !onbLastName.trim() || !onbAge.trim() || !onbHeight.trim() || !onbExperience.trim()) {
            alert('Por favor, rellena todos los campos de tu ficha pública.');
            return;
        }
        setOnboardingStep(2);
        setIsCheckoutOpen(true);
    };

    const handlePromotionPaymentSuccess = async (_method: 'stripe' | 'bizum' | 'bank_transfer') => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { error } = await supabase.from('profiles').update({
                first_name: onbFirstName.trim(),
                last_name: onbLastName.trim(),
                age: parseInt(onbAge),
                height: parseFloat(onbHeight),
                experience_desc: onbExperience.trim(),
                is_promoted_marketplace: true,
                is_public_marketplace: true
            }).eq('id', user.id);

            if (error) {
                alert('Pago procesado, pero ocurrió un error al guardar tu perfil destacado: ' + error.message);
            } else {
                setIsPromotedMarketplace(true);
                setIsPublicMarketplace(true);
                setFirstName(onbFirstName);
                setLastName(onbLastName);
                setAge(onbAge);
                setHeight(onbHeight);
                setExperienceDesc(onbExperience);
                alert('¡Felicidades! Tu pago se ha completado. Tu perfil ya está destacado en el directorio de FitLeader 🌟');
                setOnboardingOpen(false);
                setIsCheckoutOpen(false);
            }
        }
        setIsSaving(false);
    };



    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin"/></div>;

    return (
        <div className="p-8 w-full max-w-6xl mx-auto min-h-screen text-white font-sans animate-in fade-in duration-500">
            
            {/* HEADER */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
                <p className="text-zinc-400">Administra tu cuenta, negocio y preferencias.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                
                {/* SIDEBAR DE NAVEGACIÓN */}
                <div className="lg:w-64 shrink-0 space-y-2">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                    isActive 
                                        ? 'bg-[#111] border border-zinc-800 text-white shadow-lg' 
                                        : 'text-zinc-400 hover:text-white hover:bg-[#111]/50'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-zinc-500'}`} />
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                    
                    <div className="pt-4 border-t border-zinc-800 mt-4">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Cerrar Sesión</span>
                        </button>
                    </div>
                </div>

                {/* ÁREA DE CONTENIDO */}
                <div className="flex-1 bg-[#111] border border-zinc-800 rounded-2xl p-8 min-h-[600px]">
                    
                    {/* --- 1. MI PERFIL --- */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Mi Perfil</h2>
                                <p className="text-sm text-zinc-400">Información personal visible en tu cuenta.</p>
                            </div>

                            <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-700 group-hover:border-emerald-500 transition-colors">
                                        {isUploading ? <Loader2 className="w-6 h-6 animate-spin text-zinc-500"/> : avatarUrl ? (
                                            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-10 h-10 text-zinc-500" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer hover:bg-emerald-400 transition-colors shadow-lg border-2 border-[#111]">
                                        <Camera className="w-4 h-4 text-black" />
                                        <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} className="hidden" />
                                    </label>
                                </div>
                                <div>
                                    <p className="font-medium text-white">Tu foto</p>
                                    <p className="text-xs text-zinc-500 mt-1">Se guarda automáticamente.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Nombre</label>
                                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Apellidos</label>
                                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-medium text-zinc-400">Email</label>
                                    <Input value={email} disabled className="bg-zinc-900/50 border-zinc-800 text-zinc-500 cursor-not-allowed" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSaveGeneral} disabled={isSaving || isUploading} className="bg-emerald-500 text-black font-bold hover:bg-emerald-600 min-w-[120px]">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* --- 2. NEGOCIO --- */}
                    {activeTab === 'business' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Datos del Negocio</h2>
                                <p className="text-sm text-zinc-400">Configura cómo ven tus clientes tu marca.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Nombre de la Empresa / Marca</label>
                                    <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="bg-zinc-900 border-zinc-800" placeholder="Ej: Iron Gym" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Teléfono de Contacto (Público)</label>
                                        <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="bg-zinc-900 border-zinc-800" placeholder="Ej: +34 600 000 000" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Email de Contacto (Público)</label>
                                        <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="bg-zinc-900 border-zinc-800" placeholder="Ej: contacto@gimnasio.com" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-zinc-400">Moneda Principal</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {currencies.map(curr => (
                                            <button
                                                key={curr.code}
                                                onClick={() => setCurrency(curr.code)}
                                                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                                                    currency === curr.code
                                                        ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                                                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                                                }`}
                                            >
                                                <span className="text-2xl">{curr.flag}</span>
                                                <div className="text-left">
                                                    <span className="block text-sm font-semibold">{curr.code}</span>
                                                    <span className="block text-[10px] opacity-70">{curr.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-medium text-zinc-400">Logo del Negocio</label>
                                    <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-zinc-900/50 transition-colors bg-zinc-900/20">
                                        {isUploading ? <Loader2 className="w-8 h-8 animate-spin text-zinc-500"/> : logoUrl ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <img src={logoUrl} alt="Logo" className="h-16 object-contain" />
                                                <label className="cursor-pointer text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-1.5 rounded-lg">
                                                    Cambiar logo (Se guarda automáticamente)
                                                    <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} className="hidden" />
                                                </label>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center gap-2 cursor-pointer w-full h-full">
                                                <div className="p-3 bg-zinc-800 rounded-full text-zinc-400"><Upload className="w-6 h-6" /></div>
                                                <div className="text-center">
                                                    <p className="text-sm font-medium text-zinc-300">Sube tu logo</p>
                                                    <p className="text-xs text-zinc-500">PNG o SVG (Fondo transparente)</p>
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} className="hidden" />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-800">
                                <Button onClick={handleSaveGeneral} disabled={isSaving || isUploading} className="bg-blue-500 text-white font-bold hover:bg-blue-600 min-w-[120px]">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Guardar Datos Empresa'}
                                </Button>
                            </div>
                        </div>
                    )}

                     {/* --- 3. PAGOS & INTEGRACIONES --- */}
                    {activeTab === 'payments' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Métodos de Pago & Cobros</h2>
                                <p className="text-sm text-zinc-400">Configura tus cuentas para recibir pagos de clientes o alquiler de salas.</p>
                            </div>

                            {connectionStatus === 'error' && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" /><p className="text-sm text-red-200">{errorMessage}</p>
                                </div>
                            )}

                            {connectionStatus === 'success' && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /><p className="text-sm text-emerald-200">¡Métodos de pago guardados correctamente!</p>
                                </div>
                            )}

                            {/* Pasarela Stripe */}
                            <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-6 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">Pasarela Automatizada: Stripe</h3>
                                        <p className="text-xs text-zinc-400">Procesa cobros automáticos de clientes o reservas con tarjeta.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">Clave Pública (Public Key)</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Key className="w-4 h-4" /></div>
                                            <Input type={showPublicKey ? 'text' : 'password'} value={stripePublicKey} onChange={(e) => { setStripePublicKey(e.target.value); if (connectionStatus !== 'idle') setConnectionStatus('idle'); }} placeholder="pk_live_..." className="bg-zinc-900 pl-10 pr-10 border-zinc-800" />
                                            <button onClick={() => setShowPublicKey(!showPublicKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showPublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">Clave Secreta (Secret Key)</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Shield className="w-4 h-4" /></div>
                                            <Input type={showSecretKey ? 'text' : 'password'} value={stripeSecretKey} onChange={(e) => { setStripeSecretKey(e.target.value); if (connectionStatus !== 'idle') setConnectionStatus('idle'); }} placeholder="sk_live_..." className="bg-zinc-900 pl-10 pr-10 border-zinc-800" />
                                            <button onClick={() => setShowSecretKey(!showSecretKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bizum e IBAN para Centros */}
                            {role === 'center' && (
                                <div className="bg-[#151518] border border-zinc-800 rounded-2xl p-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Pagos Directos para Alquiler de Salas</h3>
                                            <p className="text-xs text-zinc-400">Configura tu Bizum o IBAN para recibir transferencias de entrenadores externos.</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Número de Teléfono para Bizum</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Phone className="w-4 h-4" /></div>
                                                <Input type="text" value={paymentBizumPhone} onChange={(e) => { setPaymentBizumPhone(e.target.value); if (connectionStatus !== 'idle') setConnectionStatus('idle'); }} placeholder="600 000 000" className="bg-zinc-900 pl-10 border-zinc-800" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Cuenta Bancaria (IBAN)</label>
                                            <div className="relative">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Building className="w-4 h-4" /></div>
                                                <Input type="text" value={paymentIban} onChange={(e) => { setPaymentIban(e.target.value); if (connectionStatus !== 'idle') setConnectionStatus('idle'); }} placeholder="ES30 1234 5678 9012 3456 7890" className="bg-zinc-900 pl-10 border-zinc-800" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end pt-4 border-t border-zinc-800">
                                <Button onClick={handleSavePayments} disabled={isSaving} className="font-bold bg-emerald-500 text-black hover:bg-emerald-600 min-w-[150px]">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Guardar Métodos de Pago'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* --- 4. SUSCRIPCIÓN (Tu Plan) --- */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Tu Suscripción</h2>
                                <p className="text-sm text-zinc-400">Gestiona y cambia tu plan de FitLeader.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Plan Pro */}
                                <div className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                    plan === 'pro' 
                                        ? 'bg-zinc-900 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                                        : 'bg-[#151518] border-zinc-800'
                                }`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-white">Profesional</h3>
                                            {plan === 'pro' && <span className="bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>}
                                        </div>
                                        <p className="text-2xl font-black text-white mb-4">29,99€<span className="text-xs text-zinc-500 font-normal">/mes</span></p>
                                        <ul className="space-y-2 text-xs text-zinc-400">
                                            <li className="flex items-center gap-2">✓ Clientes Ilimitados</li>
                                            <li className="flex items-center gap-2">✓ Creador de Rutinas</li>
                                            <li className="flex items-center gap-2">✓ Pagos e Integraciones</li>
                                        </ul>
                                    </div>
                                    {plan !== 'pro' && (
                                        <Button onClick={() => handleUpgradePlan('pro')} className="w-full mt-6 bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-bold py-2">
                                            Bajar a Profesional
                                        </Button>
                                    )}
                                </div>

                                {/* Plan Studio */}
                                <div className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                    plan === 'studio' 
                                        ? 'bg-zinc-900 border-purple-500/50 shadow-lg shadow-purple-500/5' 
                                        : 'bg-[#151518] border-zinc-800'
                                }`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-white">Studio</h3>
                                            {plan === 'studio' && <span className="bg-purple-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>}
                                        </div>
                                        <p className="text-2xl font-black text-white mb-4">59,99€<span className="text-xs text-zinc-500 font-normal">/mes</span></p>
                                        <ul className="space-y-2 text-xs text-zinc-400">
                                            <li className="flex items-center gap-2">✓ Todo lo de Profesional</li>
                                            <li className="flex items-center gap-2">✓ Gestión de Equipo Staff</li>
                                            <li className="flex items-center gap-2">✓ Gestión de Inventario</li>
                                        </ul>
                                    </div>
                                    {plan !== 'studio' && (
                                        <Button onClick={() => handleUpgradePlan('studio')} className="w-full mt-6 bg-purple-500 hover:bg-purple-400 text-black text-xs font-bold py-2">
                                            Activar Plan Studio
                                        </Button>
                                    )}
                                </div>

                                {/* Plan Center */}
                                <div className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between ${
                                    plan === 'center' 
                                        ? 'bg-zinc-900 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                                        : 'bg-[#151518] border-zinc-800'
                                }`}>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-white">Center</h3>
                                            {plan === 'center' && <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>}
                                        </div>
                                        <p className="text-2xl font-black text-white mb-4">99,99€<span className="text-xs text-zinc-500 font-normal">/mes</span></p>
                                        <ul className="space-y-2 text-xs text-zinc-400">
                                            <li className="flex items-center gap-2">✓ Todo lo de Studio</li>
                                            <li className="flex items-center gap-2">✓ Gestión de Salas/Zonas</li>
                                            <li className="flex items-center gap-2">✓ Reservas de Entrenadores</li>
                                        </ul>
                                    </div>
                                    {plan !== 'center' && (
                                        <Button onClick={() => handleUpgradePlan('center')} className="w-full mt-6 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-2">
                                            Activar Plan Center
                                        </Button>
                                    )}
                                </div>

                                {/* Plan Elite */}
                                <div className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between overflow-hidden group ${
                                    plan === 'elite' 
                                        ? 'bg-zinc-900 border-transparent shadow-lg shadow-emerald-500/5' 
                                        : 'bg-[#151518] border-zinc-800'
                                }`}>
                                    {plan === 'elite' && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 opacity-100 pointer-events-none" />
                                    )}
                                    <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none transition-all duration-300 ${
                                        plan === 'elite' 
                                            ? 'border-emerald-500' 
                                            : 'border-transparent group-hover:border-zinc-700'
                                    }`} />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <h3 className="text-lg font-bold text-white">Elite</h3>
                                                <span className="bg-gradient-to-r from-emerald-400 to-blue-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">Top</span>
                                            </div>
                                            {plan === 'elite' && <span className="bg-emerald-500 text-black text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>}
                                        </div>
                                        <p className="text-2xl font-black text-white mb-4">59,99€<span className="text-xs text-zinc-500 font-normal">/mes</span></p>
                                        <ul className="space-y-2 text-xs text-zinc-400">
                                            <li className="flex items-center gap-2">✓ Todo lo de Studio/Center</li>
                                            <li className="flex items-center gap-2 text-emerald-400 font-semibold">✓ Nutrición Avanzada</li>
                                            <li className="flex items-center gap-2 text-blue-400 font-semibold">✓ Chat en Tiempo Real</li>
                                            <li className="flex items-center gap-2">✓ Destacados Gratis en Marketplace</li>
                                        </ul>
                                    </div>
                                    {plan !== 'elite' && (
                                        <Button onClick={() => handleUpgradePlan('elite')} className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-black text-xs font-black py-2 shadow-lg shadow-emerald-500/10 transition-all duration-300 relative z-10">
                                            Activar Plan Elite
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- 4.5 APARIENCIA (Tema) --- */}
                    {activeTab === 'appearance' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Apariencia del SaaS</h2>
                                <p className="text-sm text-zinc-400">Personaliza el aspecto del panel de control de entrenadores y centros.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Modo Oscuro */}
                                <button
                                    onClick={() => handleThemeChange('dark')}
                                    className={`p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-40 ${
                                        theme === 'dark'
                                            ? 'bg-zinc-900 border-emerald-500/50 text-white shadow-lg'
                                            : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:bg-zinc-900/50'
                                    }`}
                                >
                                    <Moon className={`w-8 h-8 ${theme === 'dark' ? 'text-emerald-500' : 'text-zinc-500'}`} />
                                    <div>
                                        <span className="block text-sm font-bold text-white">Modo Oscuro</span>
                                        <span className="block text-xs text-zinc-500 mt-1">El tema clásico inmersivo. Recomendado para entornos de poca luz.</span>
                                    </div>
                                </button>

                                {/* Modo Claro */}
                                <button
                                    onClick={() => handleThemeChange('light')}
                                    className={`p-6 rounded-2xl border transition-all text-left flex flex-col justify-between h-40 ${
                                        theme === 'light'
                                            ? 'bg-zinc-900 border-amber-500/50 text-white shadow-lg'
                                            : 'bg-zinc-900/30 border-zinc-800 text-zinc-400 hover:bg-zinc-900/50'
                                    }`}
                                >
                                    <Sun className={`w-8 h-8 ${theme === 'light' ? 'text-amber-400' : 'text-zinc-500'}`} />
                                    <div>
                                        <span className="block text-sm font-bold text-white">Modo Claro</span>
                                        <span className="block text-xs text-zinc-500 mt-1">Colores claros y nítidos. Ideal para trabajar en el día a día.</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* --- 5. SEGURIDAD --- */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Seguridad</h2>
                                <p className="text-sm text-zinc-400">Protege tu cuenta y actualiza tu contraseña.</p>
                            </div>

                            <div className="space-y-4 max-w-md">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Contraseña Actual</label>
                                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-900 border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Nueva Contraseña</label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-900 border-zinc-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Confirmar Nueva Contraseña</label>
                                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-900 border-zinc-800" />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-800">
                                <Button onClick={handleUpdatePassword} disabled={isSaving} className="bg-red-500 text-white font-bold hover:bg-red-600 min-w-[120px]">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Actualizar Contraseña'}
                                </Button>
                            </div>
                        </div>
                    )}

                     {/* --- MARKETPLACE TAB --- */}
                    {activeTab === 'marketplace' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Marketplace de Coaches</h2>
                                <p className="text-sm text-zinc-400">Promociona y destaca tu perfil público para conseguir más atletas.</p>
                            </div>

                            {!isPromotedMarketplace ? (
                                /* Promo card banner */
                                <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none" />
                                    <div className="space-y-4 max-w-md text-left">
                                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold tracking-widest uppercase rounded-full">PLAN PREMIUM MARKETPLACE</span>
                                        <h3 className="text-2xl font-black text-white leading-tight">Multiplica tus clientes destacando en el Marketplace 🌟</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed">
                                            Los entrenadores destacados aparecen en los primeros resultados de búsqueda de FitLeader, obtienen la insignia de verificación oficial y habilitan su ficha de contacto directo.
                                        </p>
                                        <div className="flex items-center gap-6 pt-2">
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Inversión mensual</p>
                                                <p className="text-3xl font-black text-emerald-400">10 €<span className="text-xs text-zinc-400 font-normal"> / mes</span></p>
                                            </div>
                                            <div className="h-10 w-[1px] bg-zinc-800" />
                                            <div className="text-xs text-zinc-400">
                                                <p>✔️ Posicionamiento prioritario</p>
                                                <p>✔️ Badge de Coach Verificado</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 w-full md:w-auto z-10">
                                        <Button onClick={handleStartOnboarding} className="w-full md:w-auto bg-emerald-500 text-black hover:bg-emerald-400 font-extrabold px-8 py-4 text-base rounded-2xl shadow-xl shadow-emerald-500/15">
                                            Destacar mi Perfil
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Success highlighted banner */}
                                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
                                        <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400 animate-pulse">
                                            <Store className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-extrabold text-white text-base">¡Tu perfil está Destacado en el Marketplace! 🌟</h4>
                                            <p className="text-xs text-emerald-300/80 leading-relaxed mt-1">
                                                Apareces en las posiciones prioritarias de búsqueda del directorio y dispones de tu ficha pública extendida activa.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Public data fields */}
                                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-4">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Ficha Pública Destacada</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400">Nombre Público</label>
                                                <Input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400">Apellidos Públicos</label>
                                                <Input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400">Edad (años)</label>
                                                <Input type="number" value={age} onChange={e => setAge(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-zinc-400">Altura (cm)</label>
                                                <Input type="number" value={height} onChange={e => setHeight(e.target.value)} className="bg-zinc-900 border-zinc-800" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Experiencia Profesional</label>
                                            <textarea
                                                value={experienceDesc}
                                                onChange={e => setExperienceDesc(e.target.value)}
                                                rows={3}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none placeholder-zinc-700"
                                                placeholder="Describe tu trayectoria profesional y años de experiencia..."
                                            />
                                        </div>
                                    </div>

                                    {/* Toggle activation */}
                                    <div className="flex items-start justify-between gap-6 pb-6 border-b border-zinc-800">
                                        <div>
                                            <p className="font-medium text-white mb-1">Activar perfil público</p>
                                            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
                                                Al activarlo, tu perfil aparecerá en el directorio público de coaches de FitLeader, visible para cualquier persona que busque entrenador.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsPublicMarketplace(v => !v)}
                                            className="flex-shrink-0 transition-colors"
                                        >
                                            {isPublicMarketplace
                                                ? <ToggleRight className="w-10 h-10 text-emerald-500" />
                                                : <ToggleLeft className="w-10 h-10 text-zinc-600" />}
                                        </button>
                                    </div>

                                    {/* Bio */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Biografía / Descripción profesional</label>
                                        <textarea
                                            value={biography}
                                            onChange={e => setBiography(e.target.value)}
                                            placeholder="Cuéntale a tus futuros clientes quién eres, tu metodología y qué te hace diferente..."
                                            rows={4}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                        />
                                        <p className="text-xs text-zinc-600">{biography.length}/500 caracteres</p>
                                    </div>

                                    {/* Specialties */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-zinc-400">Especialidades <span className="text-zinc-600">(selecciona las que apliquen)</span></label>
                                        <div className="flex flex-wrap gap-2">
                                            {SPECIALTIES_OPTIONS.map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => toggleSpecialty(s)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                                        specialties.includes(s)
                                                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Grid: rate + modality + location + instagram */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Precio desde (€/hora)</label>
                                            <input
                                                type="number"
                                                value={hourlyRate}
                                                onChange={e => setHourlyRate(e.target.value)}
                                                placeholder="Ej: 45"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Modalidad</label>
                                            <div className="flex gap-2">
                                                {['Presencial', 'Online', 'Híbrido'].map(m => (
                                                    <button
                                                        key={m}
                                                        type="button"
                                                        onClick={() => setModality(prev => prev === m ? '' : m)}
                                                        className={`flex-1 text-xs font-medium py-2.5 rounded-xl border transition-all ${
                                                            modality === m
                                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
                                                        }`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400"><MapPin className="w-3.5 h-3.5" />Ubicación / Ciudad</label>
                                            <input
                                                type="text"
                                                value={locationAddress}
                                                onChange={e => setLocationAddress(e.target.value)}
                                                placeholder="Ej: Madrid, España"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-400"><Instagram className="w-3.5 h-3.5" />Instagram</label>
                                            <input
                                                type="text"
                                                value={instagramHandle}
                                                onChange={e => setInstagramHandle(e.target.value)}
                                                placeholder="@tu_usuario"
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                            />
                                        </div>
                                    </div>

                                    {/* Preview link */}
                                    {isPublicMarketplace && userId && (
                                        <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-3">
                                            <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <p className="text-xs text-zinc-400 flex-1">Tu perfil público estará disponible en:</p>
                                            <button
                                                onClick={() => navigate(`/coaches/${userId}`)}
                                                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                                            >
                                                Ver mi perfil
                                                <LinkIcon className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Success message */}
                                    {marketplaceSaved && (
                                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <p className="text-emerald-400 text-xs">Perfil del marketplace guardado correctamente.</p>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4 border-t border-zinc-800">
                                        <button
                                            onClick={handleSaveMarketplace}
                                            disabled={isSaving}
                                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold px-6 py-2.5 rounded-xl transition-colors text-sm cursor-pointer"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Perfil Destacado'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-yellow-500" /> Notificaciones por Email
                                </h3>
                                <p className="text-xs text-zinc-400">Configura tus credenciales de Resend y revisa el historial de notificaciones automáticas.</p>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-400 block">Clave de API de Resend (Privada en este navegador)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="password"
                                            placeholder="re_123456789..."
                                            value={resendApiKey}
                                            onChange={(e) => setResendApiKeyVar(e.target.value)}
                                            className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-yellow-500/50 placeholder-zinc-700 font-mono"
                                        />
                                        <Button
                                            onClick={handleSaveResendKey}
                                            className="bg-yellow-500 text-black hover:bg-yellow-400 font-bold text-xs px-4 rounded-xl shrink-0"
                                        >
                                            Guardar Llave
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-zinc-550 leading-relaxed">
                                        La API Key se guarda de forma segura en tu navegador local (localStorage). Si no se proporciona una clave, el sistema funcionará en <strong>Modo de Simulación</strong>, registrando los emails en base de datos e imprimiéndolos en la consola de desarrollo para pruebas.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Historial de Emails Enviados</h4>
                                
                                {isLoadingLogs ? (
                                    <div className="py-8 text-center text-zinc-500 flex flex-col items-center justify-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-yellow-500 mb-2" />
                                        <span className="text-xs">Cargando logs...</span>
                                    </div>
                                ) : emailLogs.length === 0 ? (
                                    <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-900 text-zinc-500 text-xs">
                                        No hay registros de emails enviados todavía.
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                                        {emailLogs.map((log) => (
                                            <div key={log.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3.5 flex flex-col gap-2">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                                                            {log.type === 'welcome' ? 'Onboarding' : log.type === 'lead' ? 'Nuevo Lead' : log.type === 'booking_request' ? 'Petición Sala' : 'Estado Reserva'}
                                                        </span>
                                                        <p className="text-xs font-bold text-white truncate mt-2">{log.subject}</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black uppercase tracking-tight px-1.5 py-0.5 rounded shrink-0 ${
                                                        log.status === 'sent' 
                                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                            : log.status === 'simulated' 
                                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                                                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                        {log.status === 'sent' ? 'Enviado' : log.status === 'simulated' ? 'Simulado' : 'Error'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-zinc-500 border-t border-zinc-900 pt-2">
                                                    <span>Para: <strong className="text-zinc-400">{log.recipient_email}</strong></span>
                                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ONBOARDING MODAL: DATOS DESTACADOS */}
            {onboardingOpen && onboardingStep === 1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#111112] border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/30">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    Paso 1: Tu Ficha Pública 📝
                                </h2>
                                <p className="text-xs text-zinc-400 mt-1">Completa los datos de tu tarjeta pública de entrenador.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setOnboardingOpen(false)} className="text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nombre</label>
                                    <Input type="text" value={onbFirstName} onChange={(e) => setOnbFirstName(e.target.value)} placeholder="Ej. Juan" className="bg-zinc-900 border-zinc-800 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Apellidos</label>
                                    <Input type="text" value={onbLastName} onChange={(e) => setOnbLastName(e.target.value)} placeholder="Ej. Pérez" className="bg-zinc-900 border-zinc-800 text-white" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Edad (años)</label>
                                    <Input type="number" value={onbAge} onChange={(e) => setOnbAge(e.target.value)} placeholder="Ej. 28" className="bg-zinc-900 border-zinc-800 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Altura (cm)</label>
                                    <Input type="number" value={onbHeight} onChange={(e) => setOnbHeight(e.target.value)} placeholder="Ej. 178" className="bg-zinc-900 border-zinc-800 text-white" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Experiencia Profesional</label>
                                <textarea
                                    value={onbExperience}
                                    onChange={(e) => setOnbExperience(e.target.value)}
                                    placeholder="Ej. Más de 6 años entrenando atletas de alto rendimiento y asesorando en pérdida de grasa..."
                                    rows={3}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                />
                            </div>

                            <Button onClick={handleOnboardingNext} className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold py-3.5 rounded-xl mt-4">
                                Continuar al Pago (10 €/mes)
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* CHECKOUT MODAL PARA PROMO */}
            <CheckoutPaymentModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                amount={10}
                title="Suscripción de Promoción 🌟"
                description="Destaca tu perfil en las primeras posiciones del Marketplace de Coaches"
                stripePublicKey="pk_test_platform_key_simulated"
                onPaymentSuccess={handlePromotionPaymentSuccess}
            />

        </div>
    );
};

export default Settings;