import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    User, Building2, CreditCard, Shield, Key, 
    Upload, Camera, Check, Eye, EyeOff, LogOut,
    ExternalLink, HelpCircle, AlertCircle, CheckCircle2, XCircle, Info, Loader2 
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

type TabType = 'profile' | 'business' | 'subscription' | 'security' | 'payments';

const tabs = [
    { id: 'profile' as TabType, label: 'Mi Perfil', icon: User, color: 'text-emerald-500' },
    { id: 'business' as TabType, label: 'Negocio', icon: Building2, color: 'text-blue-500' },
    { id: 'payments' as TabType, label: 'Pagos & Integraciones', icon: Key, color: 'text-orange-500' },
    { id: 'subscription' as TabType, label: 'Suscripción', icon: CreditCard, color: 'text-purple-500' },
    { id: 'security' as TabType, label: 'Seguridad', icon: Shield, color: 'text-red-500' },
];

const currencies = [
    { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
    { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'Dólar' },
    { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'Libra' },
];

const Settings = () => {
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

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Payment integration state
    const [stripePublicKey, setStripePublicKey] = useState('');
    const [stripeSecretKey, setStripeSecretKey] = useState('');
    const [showPublicKey, setShowPublicKey] = useState(false);
    const [showSecretKey, setShowSecretKey] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    // Billing
    const [billingMessage, setBillingMessage] = useState('');

    // --- 1. CARGAR DATOS DESDE SUPABASE ---
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                setEmail(user.email || ''); 
                
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    setFirstName(data.first_name || '');
                    setLastName(data.last_name || '');
                    setAvatarUrl(data.avatar_url || '');
                    setBusinessName(data.business_name || '');
                    setCurrency(data.currency || 'EUR');
                    setLogoUrl(data.logo_url || ''); 
                }
            }
            setIsLoading(false);
        };
        loadProfile();
    }, []);

    // --- HANDLERS ---

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

    const handleConnectStripe = () => {
        setIsSaving(true);
        setConnectionStatus('idle');
        setErrorMessage('');

        setTimeout(() => {
            setIsSaving(false);
            if (!stripePublicKey.trim() || !stripeSecretKey.trim()) {
                setConnectionStatus('error');
                setErrorMessage('Por favor, rellena ambos campos.');
                return;
            }
            const isValidPublic = stripePublicKey.trim().startsWith('pk_');
            const isValidSecret = stripeSecretKey.trim().startsWith('sk_');

            if (!isValidPublic || !isValidSecret) {
                setConnectionStatus('error');
                setErrorMessage('Formato incorrecto. Deben empezar por "pk_" y "sk_".');
                return;
            }
            setConnectionStatus('success');
        }, 1500);
    };

    const handleManageBilling = () => {
        setBillingMessage('De momento solo está disponible el Plan Profesional. ¡Pronto novedades!');
        setTimeout(() => setBillingMessage(''), 3000);
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
                                <h2 className="text-xl font-bold text-white mb-1">Integración Stripe</h2>
                                <p className="text-sm text-zinc-400">Conecta tu cuenta para recibir pagos automáticos.</p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-1"><HelpCircle className="w-5 h-5" /></div>
                                    <div>
                                        <h4 className="font-bold text-blue-100 text-sm mb-1">¿Por qué conectar Stripe?</h4>
                                        <p className="text-xs text-blue-200/80 leading-relaxed">FitLeader usa Stripe para procesar pagos seguros. Al conectar tu cuenta, el dinero llegará <strong>directamente a tu banco</strong>.</p>
                                    </div>
                                </div>
                                <div className="h-[1px] bg-blue-500/20 w-full" />
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Cómo obtener tus claves:</p>
                                    <ol className="text-xs text-blue-200/80 space-y-1 list-decimal list-inside pl-1">
                                        <li>Inicia sesión en <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">Stripe Dashboard <ExternalLink className="w-3 h-3"/></a>.</li>
                                        <li>Ve a <strong>Desarrolladores</strong> {'>'} <strong>Claves de API</strong>.</li>
                                        <li>Copia la "Clave publicable" (pk_...) y la "Clave secreta" (sk_...).</li>
                                    </ol>
                                </div>
                            </div>

                            {connectionStatus === 'error' && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" /><p className="text-sm text-red-200">{errorMessage}</p>
                                </div>
                            )}

                            {connectionStatus === 'success' && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 flex items-center gap-3 animate-in slide-in-from-top-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" /><p className="text-sm text-emerald-200">¡Conexión establecida correctamente! Ahora puedes recibir pagos.</p>
                                </div>
                            )}

                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">Clave Pública (Public Key)<span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Seguro</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Key className="w-4 h-4" /></div>
                                        <Input type={showPublicKey ? 'text' : 'password'} value={stripePublicKey} onChange={(e) => { setStripePublicKey(e.target.value); if (connectionStatus !== 'idle') setConnectionStatus('idle'); }} placeholder="pk_live_..." className={`bg-zinc-900 pl-10 pr-10 ${connectionStatus === 'error' ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800'}`} />
                                        <button onClick={() => setShowPublicKey(!showPublicKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showPublicKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">Clave Secreta (Secret Key)<span className="text-[10px] text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Privado</span></label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><Shield className="w-4 h-4" /></div>
                                        <Input type={showSecretKey ? 'text' : 'password'} value={stripeSecretKey} onChange={(e) => { setStripeSecretKey(e.target.value); if (connectionStatus !== 'idle') setConnectionStatus('idle'); }} placeholder="sk_live_..." className={`bg-zinc-900 pl-10 pr-10 ${connectionStatus === 'error' ? 'border-red-500/50 focus:border-red-500' : 'border-zinc-800'}`} />
                                        <button onClick={() => setShowSecretKey(!showSecretKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">{showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-800">
                                <Button onClick={handleConnectStripe} disabled={isSaving} className={`font-bold min-w-[120px] transition-colors ${connectionStatus === 'success' ? 'bg-emerald-500 text-black hover:bg-emerald-600' : 'bg-orange-500 text-black hover:bg-orange-600'}`}>
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : connectionStatus === 'success' ? 'Claves Guardadas' : 'Conectar Stripe'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* --- 4. SUSCRIPCIÓN (Tu Plan) --- */}
                    {activeTab === 'subscription' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">Tu Suscripción</h2>
                                <p className="text-sm text-zinc-400">Detalles de tu plan actual en FitLeader.</p>
                            </div>

                            <div className="bg-gradient-to-br from-purple-900/30 to-[#111] border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-24 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
                                <div className="flex justify-between items-start relative z-10">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-2xl font-bold text-white">Plan Profesional</h3>
                                            <span className="bg-purple-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Activo</span>
                                        </div>
                                        <ul className="space-y-1 text-sm text-zinc-300 mt-4">
                                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> Clientes Ilimitados</li>
                                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> Rutinas Avanzadas</li>
                                            <li className="flex items-center gap-2"><Check className="w-3 h-3 text-purple-400" /> Reportes Financieros</li>
                                        </ul>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-white">29.99€</p>
                                        <p className="text-zinc-500 text-xs">/mes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end pt-4 gap-2">
                                <Button variant="outline" onClick={handleManageBilling} className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
                                    Gestionar Facturación
                                </Button>
                                {billingMessage && (
                                    <div className="text-xs text-yellow-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                        <Info className="w-3 h-3" /> {billingMessage}
                                    </div>
                                )}
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

                </div>
            </div>
        </div>
    );
};

export default Settings;