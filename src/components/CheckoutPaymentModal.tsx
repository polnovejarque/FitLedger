import { useState } from 'react';
import { X, CreditCard, Phone, Building, ShieldCheck, Loader2, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface CheckoutPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    title: string;
    description: string;
    stripePublicKey?: string;
    bizumPhone?: string;
    bankIban?: string;
    onPaymentSuccess: (method: 'stripe' | 'bizum' | 'bank_transfer') => void;
}

const CheckoutPaymentModal = ({
    isOpen,
    onClose,
    amount,
    title,
    description,
    stripePublicKey,
    bizumPhone,
    bankIban,
    onPaymentSuccess
}: CheckoutPaymentModalProps) => {
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'bizum' | 'bank_transfer' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Stripe card form states
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardFocused, setCardFocused] = useState(false);

    if (!isOpen) return null;

    // Detect available methods based on what props are passed
    const hasStripe = !!stripePublicKey;
    const hasBizum = !!bizumPhone;
    const hasIban = !!bankIban;

    // Set default payment method if only one is available
    if (!paymentMethod) {
        if (hasStripe) setPaymentMethod('stripe');
        else if (hasBizum) setPaymentMethod('bizum');
        else if (hasIban) setPaymentMethod('bank_transfer');
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length > 0) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const formatExpiry = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
        }
        return v;
    };

    const handleStripePay = (e: React.FormEvent) => {
        e.preventDefault();
        if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvc.length < 3 || !cardName) {
            setError('Por favor, rellena todos los campos de la tarjeta.');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate secure Stripe Checkout transaction
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                onPaymentSuccess('stripe');
                handleClose();
            }, 1500);
        }, 2000);
    };

    const handleManualPay = (method: 'bizum' | 'bank_transfer') => {
        setIsLoading(true);
        setError('');

        // Simulate submitting verification request
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
            setTimeout(() => {
                onPaymentSuccess(method);
                handleClose();
            }, 1500);
        }, 1500);
    };

    const handleClose = () => {
        setPaymentMethod(null);
        setCardNumber('');
        setCardExpiry('');
        setCardCvc('');
        setCardName('');
        setCardFocused(false);
        setIsLoading(false);
        setIsSuccess(false);
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#111112] border border-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/30">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            {title}
                        </h2>
                        <p className="text-xs text-zinc-400 mt-1">{description}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose} className="text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Amount Section */}
                <div className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-zinc-800/50 flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-300">Total a pagar:</span>
                    <span className="text-3xl font-extrabold text-emerald-400">{amount.toFixed(2)} €</span>
                </div>

                {/* Tabs for payment selection (only if multiple methods exist) */}
                {(!hasStripe && !hasBizum && !hasIban) ? null : ((hasStripe ? 1 : 0) + (hasBizum ? 1 : 0) + (hasIban ? 1 : 0) > 1) && (
                    <div className="flex border-b border-zinc-800/80 bg-zinc-900/10">
                        {hasStripe && (
                            <button
                                onClick={() => { setPaymentMethod('stripe'); setError(''); }}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition-all ${
                                    paymentMethod === 'stripe'
                                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <CreditCard className="w-4 h-4" /> Tarjeta (Stripe)
                            </button>
                        )}
                        {hasBizum && (
                            <button
                                onClick={() => { setPaymentMethod('bizum'); setError(''); }}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition-all ${
                                    paymentMethod === 'bizum'
                                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <Phone className="w-4 h-4" /> Bizum
                            </button>
                        )}
                        {hasIban && (
                            <button
                                onClick={() => { setPaymentMethod('bank_transfer'); setError(''); }}
                                className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center justify-center gap-2 transition-all ${
                                    paymentMethod === 'bank_transfer'
                                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                <Building className="w-4 h-4" /> Transferencia
                            </button>
                        )}
                    </div>
                )}

                {/* Content Area */}
                <div className="p-6">
                    {!hasStripe && !hasBizum && !hasIban ? (
                        <div className="py-8 text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto">
                                <X className="w-6 h-6" />
                            </div>
                            <div className="max-w-xs mx-auto">
                                <h3 className="text-sm font-bold text-white">Sin Cuentas de Cobro</h3>
                                <p className="text-xs text-zinc-400 mt-2 leading-relaxed font-sans">
                                    Este gimnasio aún no ha guardado sus datos de facturación (Stripe, Bizum o IBAN) en FitLeader. Ponte en contacto directo para acordar el pago.
                                </p>
                            </div>
                        </div>
                    ) : isSuccess ? (
                        <div className="py-10 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in duration-300">
                            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center justify-center text-emerald-400 animate-bounce">
                                <Check className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">¡Pago Procesado!</h3>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {paymentMethod === 'stripe' 
                                        ? 'La transacción con tarjeta se ha completado.' 
                                        : 'Se ha enviado la solicitud de validación al Centro.'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* STRIPE CARD FLOW */}
                            {paymentMethod === 'stripe' && (
                                <form onSubmit={handleStripePay} className="space-y-4">
                                    {/* Credit Card Animation */}
                                    <div className="w-full h-44 bg-gradient-to-br from-zinc-800 to-zinc-950 rounded-2xl p-6 relative overflow-hidden border border-zinc-700 shadow-xl flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 p-24 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-7 bg-amber-400/80 rounded-md opacity-85" /> {/* Card Chip */}
                                            <span className="text-xs font-bold text-zinc-500 tracking-widest uppercase">FitLeader Secure</span>
                                        </div>
                                        <div>
                                            <p className="text-zinc-500 text-[10px] tracking-wider uppercase mb-1">Card Number</p>
                                            <p className="text-lg font-mono text-white tracking-widest">
                                                {cardNumber || '•••• •••• •••• ••••'}
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-zinc-500 text-[8px] tracking-wider uppercase">Holder Name</p>
                                                <p className="text-xs font-medium text-white tracking-wide uppercase truncate max-w-[180px]">
                                                    {cardName || 'Titular de la Tarjeta'}
                                                </p>
                                            </div>
                                            <div className="flex gap-4">
                                                <div>
                                                    <p className="text-zinc-500 text-[8px] tracking-wider uppercase">Expires</p>
                                                    <p className="text-xs font-mono text-white">{cardExpiry || 'MM/AA'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-zinc-500 text-[8px] tracking-wider uppercase">CVC</p>
                                                    <p className="text-xs font-mono text-white">{cardFocused ? cardCvc : '•••'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Inputs */}
                                    <div className="space-y-3 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Número de Tarjeta</label>
                                            <Input
                                                type="text"
                                                maxLength={19}
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                placeholder="4000 1234 5678 9010"
                                                className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Fecha Expiración</label>
                                                <Input
                                                    type="text"
                                                    maxLength={5}
                                                    value={cardExpiry}
                                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                    placeholder="MM/AA"
                                                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700 font-mono text-center"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">CVC</label>
                                                <Input
                                                    type="password"
                                                    maxLength={4}
                                                    value={cardCvc}
                                                    onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/gi, ''))}
                                                    onFocus={() => setCardFocused(true)}
                                                    onBlur={() => setCardFocused(false)}
                                                    placeholder="123"
                                                    className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700 font-mono text-center"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nombre del Titular</label>
                                            <Input
                                                type="text"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value)}
                                                placeholder="Ej. Juan Pérez"
                                                className="bg-zinc-900 border-zinc-800 text-white placeholder-zinc-700 uppercase"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 mt-4"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <ShieldCheck className="w-5 h-5" />
                                                Pagar {amount.toFixed(2)} €
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}

                            {/* BIZUM FLOW */}
                            {paymentMethod === 'bizum' && (
                                <div className="space-y-6">
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4 text-center">
                                        <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-wider font-bold">Instrucciones de Pago</p>
                                        <div className="py-4 px-6 bg-zinc-950/60 rounded-xl inline-block border border-zinc-800">
                                            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Enviar Bizum a:</p>
                                            <p className="text-2xl font-mono text-white font-extrabold tracking-widest">{bizumPhone}</p>
                                        </div>
                                        <div className="text-sm text-zinc-300 leading-relaxed space-y-2 text-left">
                                            <p className="flex gap-2"><span className="text-emerald-400 font-bold">1.</span> Abre la app de tu banco y realiza un Bizum de <span className="text-emerald-400 font-bold">{amount.toFixed(2)} €</span>.</p>
                                            <p className="flex gap-2"><span className="text-emerald-400 font-bold">2.</span> Indica en el concepto de Bizum tu nombre o el del atleta.</p>
                                            <p className="flex gap-2"><span className="text-emerald-400 font-bold">3.</span> Tras realizar el Bizum, pulsa el botón de abajo para notificar al Centro.</p>
                                        </div>
                                    </div>

                                    {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                                    <Button
                                        onClick={() => handleManualPay('bizum')}
                                        disabled={isLoading}
                                        className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Ya he realizado el Bizum
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* BANK TRANSFER FLOW */}
                            {paymentMethod === 'bank_transfer' && (
                                <div className="space-y-6">
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                                        <p className="text-xs text-zinc-400 leading-relaxed uppercase tracking-wider font-bold text-center">Instrucciones de Transferencia</p>
                                        
                                        <div className="space-y-3 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 text-left font-mono">
                                            <div>
                                                <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider">Número de Cuenta IBAN</p>
                                                <p className="text-xs text-white font-bold select-all break-all">{bankIban}</p>
                                            </div>
                                            <div className="h-[1px] bg-zinc-800 w-full" />
                                            <div>
                                                <p className="text-zinc-600 text-[9px] uppercase font-bold tracking-wider">Importe exacto</p>
                                                <p className="text-sm text-emerald-400 font-extrabold">{amount.toFixed(2)} €</p>
                                            </div>
                                        </div>

                                        <div className="text-sm text-zinc-300 leading-relaxed space-y-2">
                                            <p className="flex gap-2"><span className="text-emerald-400 font-bold">1.</span> Haz una transferencia por <span className="text-emerald-400 font-bold">{amount.toFixed(2)} €</span> a la cuenta anterior.</p>
                                            <p className="flex gap-2"><span className="text-emerald-400 font-bold">2.</span> Indica en el concepto de la transferencia tu nombre.</p>
                                            <p className="flex gap-2"><span className="text-emerald-400 font-bold">3.</span> Pulsa el botón de abajo para que el Centro valide la recepción.</p>
                                        </div>
                                    </div>

                                    {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}

                                    <Button
                                        onClick={() => handleManualPay('bank_transfer')}
                                        disabled={isLoading}
                                        className="w-full bg-emerald-500 text-black hover:bg-emerald-400 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-5 h-5" />
                                                Ya he realizado la transferencia
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CheckoutPaymentModal;
