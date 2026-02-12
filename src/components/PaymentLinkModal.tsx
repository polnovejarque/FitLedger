import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface PaymentLinkModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
    defaultAmount: number;
}

const PaymentLinkModal = ({ isOpen, onClose, clientName, defaultAmount }: PaymentLinkModalProps) => {
    const [amount, setAmount] = useState(defaultAmount.toString());
    const [paymentLink, setPaymentLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleGenerateLink = () => {
        // Check if Stripe keys are configured
        const publicKey = localStorage.getItem('stripe_public_key');
        const secretKey = localStorage.getItem('stripe_secret_key');
        const currency = localStorage.getItem('payment_currency') || 'EUR';

        if (!publicKey || !secretKey) {
            setError('Por favor, configura tu cuenta de Stripe en Ajustes → Pagos & Integraciones primero');
            return;
        }

        // Mock payment link generation (in production, this would call Stripe API)
        setError('');
        const mockLink = `https://buy.stripe.com/test_${Date.now()}_${amount}${currency}`;
        setPaymentLink(mockLink);
    };

    const handleCopy = () => {
        if (paymentLink) {
            navigator.clipboard.writeText(paymentLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleClose = () => {
        setAmount(defaultAmount.toString());
        setPaymentLink('');
        setCopied(false);
        setError('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">Generar Link de Pago</h2>
                        <p className="text-sm text-muted-foreground mt-1">Cliente: {clientName}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleClose}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                    {/* Amount Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Monto
                        </label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="pr-8"
                                placeholder="150.00"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                €
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-3 text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Generate Link Button */}
                    {!paymentLink && (
                        <Button
                            onClick={handleGenerateLink}
                            className="w-full"
                            disabled={!amount || parseFloat(amount) <= 0}
                        >
                            Generar Link de Pago
                        </Button>
                    )}

                    {/* Payment Link Display */}
                    {paymentLink && (
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Link de Pago Generado
                            </label>
                            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
                                <p className="text-xs text-muted-foreground break-all">
                                    {paymentLink}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border flex gap-3">
                    <Button variant="outline" onClick={handleClose} className="flex-1">
                        Cancelar
                    </Button>
                    {paymentLink && (
                        <Button
                            onClick={handleCopy}
                            className="flex-1 gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    ¡Copiado!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copiar & Enviar
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentLinkModal;
