import { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface WeightModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (weight: number) => void;
    currentWeight?: number;
}

const WeightModal = ({ isOpen, onClose, onSave, currentWeight = 68 }: WeightModalProps) => {
    const [weight, setWeight] = useState(currentWeight.toString());

    if (!isOpen) return null;

    const handleSave = () => {
        const weightValue = parseFloat(weight);
        if (weightValue > 0) {
            onSave(weightValue);
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop Overlay - Almost Opaque */}
            <div
                className="fixed inset-0 bg-black/80 z-40"
                onClick={onClose}
            />

            {/* Bottom Sheet - Solid Background */}
            <div className="fixed bottom-0 left-0 right-0 z-50">
                <div
                    className="bg-zinc-900 border-t border-white/10 rounded-t-3xl shadow-2xl max-w-md mx-auto"
                    style={{
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {/* Drag Handle Pill */}
                    <div className="flex justify-center pt-4 pb-2">
                        <div className="w-12 h-1 bg-zinc-700 rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-8 pt-4 space-y-6">
                        {/* Title */}
                        <h2 className="text-2xl font-bold text-center text-white">
                            Registrar Peso
                        </h2>

                        {/* Input */}
                        <div>
                            <label className="block text-sm font-medium mb-3 text-zinc-400">
                                Peso Corporal (kg)
                            </label>
                            <Input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="68.5"
                                step="0.1"
                                min="1"
                                className="text-3xl text-center h-20 font-bold bg-zinc-800 border-zinc-700 text-white"
                                autoFocus
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-14 text-base border-zinc-700 hover:bg-zinc-800"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex-1 h-14 text-base"
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default WeightModal;
