import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Box, Plus, Trash2, Loader2, PackageOpen 
} from 'lucide-react';
import { Button } from '../components/ui/Button';

const Inventory = () => {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [studioId, setStudioId] = useState<string | null>(null);

    // Formulario
    const [newItemName, setNewItemName] = useState("");
    const [newItemQuantity, setNewItemQuantity] = useState<number | string>("");

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setStudioId(user.id);

        const { data, error } = await supabase
            .from('inventory')
            .select('*')
            .eq('studio_id', user.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setItems(data);
        }
        setIsLoading(false);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemName || !newItemQuantity || !studioId) return;

        setIsSaving(true);
        const { error } = await supabase.from('inventory').insert([{
            studio_id: studioId,
            name: newItemName,
            quantity: Number(newItemQuantity)
        }]);

        if (!error) {
            setNewItemName("");
            setNewItemQuantity("");
            await fetchInventory();
        } else {
            alert("Error al guardar el recurso.");
        }
        setIsSaving(false);
    };

    const handleDeleteItem = async (id: string, name: string) => {
        if (!confirm(`¿Seguro que quieres eliminar "${name}" del inventario? Esto podría afectar a las clases futuras que usen este material.`)) return;

        const { error } = await supabase.from('inventory').delete().eq('id', id);
        if (!error) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    return (
        <div className="p-8 w-full max-w-7xl mx-auto min-h-screen text-white font-sans animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Box className="w-8 h-8 text-emerald-500" /> 
                        Recursos Físicos
                    </h1>
                    <p className="text-zinc-400 mt-1">
                        Gestiona el material disponible de tu centro (esterillas, bicis, etc.) para limitar los aforos de forma inteligente.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario para añadir */}
                <div className="lg:col-span-1">
                    <div className="bg-[#111] border border-zinc-800 rounded-2xl p-6 shadow-xl sticky top-6">
                        <h2 className="text-lg font-bold text-white mb-4">Añadir Material</h2>
                        <form onSubmit={handleAddItem} className="space-y-4">
                            <div>
                                <label className="text-xs text-zinc-400 mb-1 block">Nombre del recurso</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors" 
                                    placeholder="Ej: Bicicleta Spinning" 
                                />
                            </div>
                            <div>
                                <label className="text-xs text-zinc-400 mb-1 block">Cantidad disponible en sala</label>
                                <input 
                                    type="number" 
                                    required
                                    min="1"
                                    value={newItemQuantity}
                                    onChange={(e) => setNewItemQuantity(e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors" 
                                    placeholder="Ej: 12" 
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full bg-emerald-500 text-black hover:bg-emerald-400 mt-2 font-bold"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2" /> Guardar en inventario</>}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Lista de inventario */}
                <div className="lg:col-span-2">
                    <div className="bg-[#111] border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-900/50 text-xs uppercase text-zinc-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Recurso</th>
                                    <th className="px-6 py-4 text-center">Unidades</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {isLoading ? (
                                    <tr><td colSpan={3} className="px-6 py-12 text-center text-zinc-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/>Cargando inventario...</td></tr>
                                ) : items.length > 0 ? (
                                    items.map((item) => (
                                        <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                                        <Box className="w-5 h-5 text-emerald-500" />
                                                    </div>
                                                    <p className="font-bold text-white">{item.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-white font-bold border border-zinc-700">
                                                    {item.quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => handleDeleteItem(item.id, item.name)}
                                                    className="p-2 text-zinc-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Eliminar recurso"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-16 text-center text-zinc-500">
                                            <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                            <p className="text-lg font-medium text-zinc-400">Tu inventario está vacío</p>
                                            <p className="text-sm mt-1">Añade el material de tu centro para poder crear clases grupales.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inventory;