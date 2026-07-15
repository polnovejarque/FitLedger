import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { 
    Send, Search, MessageSquare, Lock, ArrowLeft, 
    Check, Sparkles, User, MessageCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { sendPushNotification } from '../services/pushNotificationService';

interface Client {
    id: number;
    name: string;
    email: string;
    image_url: string | null;
    unreadCount?: number;
    lastMessage?: string;
    lastMessageTime?: string;
}

interface Message {
    id: string;
    coach_id: string;
    client_id: number;
    sender: 'coach' | 'client';
    message: string;
    created_at: string;
    is_read: boolean;
}

const Chat = () => {
    const navigate = useNavigate();
    const [coachId, setCoachId] = useState<string | null>(null);
    const [coachName, setCoachName] = useState('Entrenador');
    const [userPlan, setUserPlan] = useState<string>('pro');
    const [isLoading, setIsLoading] = useState(true);

    const [clients, setClients] = useState<Client[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // 1. Cargar plan del coach y verificar nivel Elite
    useEffect(() => {
        const loadCoachInfo = async () => {
            setIsLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCoachId(user.id);
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('plan, business_name, first_name, last_name')
                    .eq('id', user.id)
                    .single();
                if (profile) {
                    setUserPlan(profile.plan || 'pro');
                    setCoachName(profile.business_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Entrenador');
                }
            }
            setIsLoading(false);
        };
        loadCoachInfo();
    }, []);

    // 2. Cargar clientes activos si el plan es Elite
    useEffect(() => {
        if (userPlan !== 'elite' || !coachId) return;

        const loadClients = async () => {
            // Cargar clientes del coach
            const { data: clientsData, error } = await supabase
                .from('clients')
                .select('id, name, email, image_url')
                .or(`assigned_coach_id.eq.${coachId},studio_id.eq.${coachId}`);

            if (error) {
                console.error("Error loading clients:", error);
                return;
            }

            if (clientsData) {
                const formattedClients: Client[] = await Promise.all(
                    clientsData.map(async (client) => {
                        // Cargar último mensaje para cada cliente
                        const { data: lastMsg } = await supabase
                            .from('chat_messages')
                            .select('message, created_at, is_read, sender')
                            .eq('coach_id', coachId)
                            .eq('client_id', client.id)
                            .order('created_at', { ascending: false })
                            .limit(1);

                        // Cargar conteo de mensajes no leídos
                        const { count } = await supabase
                            .from('chat_messages')
                            .select('*', { count: 'exact', head: true })
                            .eq('coach_id', coachId)
                            .eq('client_id', client.id)
                            .eq('sender', 'client')
                            .eq('is_read', false);

                        return {
                            id: client.id,
                            name: client.name,
                            email: client.email,
                            image_url: client.image_url,
                            unreadCount: count || 0,
                            lastMessage: lastMsg && lastMsg.length > 0 ? lastMsg[0].message : undefined,
                            lastMessageTime: lastMsg && lastMsg.length > 0 ? new Date(lastMsg[0].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
                        };
                    })
                );

                // Ordenar clientes: primero los que tienen no leídos, luego alfabéticamente
                formattedClients.sort((a, b) => {
                    if ((a.unreadCount || 0) > (b.unreadCount || 0)) return -1;
                    if ((a.unreadCount || 0) < (b.unreadCount || 0)) return 1;
                    return a.name.localeCompare(b.name);
                });

                setClients(formattedClients);
            }
        };

        loadClients();
    }, [userPlan, coachId]);

    // 3. Cargar mensajes del cliente seleccionado
    useEffect(() => {
        if (!selectedClient || !coachId) return;

        const loadMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('coach_id', coachId)
                .eq('client_id', selectedClient.id)
                .order('created_at', { ascending: true });

            if (data) {
                setMessages(data);
                scrollToBottom();

                // Marcar como leídos los mensajes que recibimos del cliente
                const { error } = await supabase
                    .from('chat_messages')
                    .update({ is_read: true })
                    .eq('coach_id', coachId)
                    .eq('client_id', selectedClient.id)
                    .eq('sender', 'client')
                    .eq('is_read', false);

                if (!error) {
                    // Actualizar el contador del cliente en local
                    setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, unreadCount: 0 } : c));
                }
            }
        };

        loadMessages();
    }, [selectedClient, coachId]);

    // 4. Canal de Tiempo Real de Supabase para mensajes nuevos
    useEffect(() => {
        if (!coachId || userPlan !== 'elite') return;

        const channel = supabase
            .channel('coach_chat_realtime')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'chat_messages',
                filter: `coach_id=eq.${coachId}`
            }, async (payload) => {
                const newMsg = payload.new as Message;
                
                // Si el mensaje es para el cliente seleccionado actualmente
                if (selectedClient && newMsg.client_id === selectedClient.id) {
                    setMessages(prev => {
                        // Evitar duplicados
                        if (prev.some(m => m.id === newMsg.id)) return prev;
                        return [...prev, newMsg];
                    });
                    scrollToBottom();

                    // Si viene del cliente, marcarlo como leído inmediatamente en base de datos
                    if (newMsg.sender === 'client') {
                        await supabase
                            .from('chat_messages')
                            .update({ is_read: true })
                            .eq('id', newMsg.id);
                    }
                } else {
                    // Si es de otro cliente, incrementar su contador de no leídos e incorporar el último mensaje
                    setClients(prev => prev.map(c => {
                        if (c.id === newMsg.client_id) {
                            return {
                                ...c,
                                unreadCount: (c.unreadCount || 0) + (newMsg.sender === 'client' ? 1 : 0),
                                lastMessage: newMsg.message,
                                lastMessageTime: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            };
                        }
                        return c;
                    }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [coachId, selectedClient, userPlan]);

    const scrollToBottom = () => {
        setTimeout(() => {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    };

    // 5. Enviar mensaje
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedClient || !coachId || isSending) return;

        setIsSending(true);
        const text = newMessage.trim();
        setNewMessage('');

        const { data, error } = await supabase
            .from('chat_messages')
            .insert({
                coach_id: coachId,
                client_id: selectedClient.id,
                sender: 'coach',
                message: text,
                is_read: false
            })
            .select()
            .single();

        if (error) {
            console.error("Error sending message:", error);
            setNewMessage(text); // Devolver el texto al input en caso de fallo
        } else if (data) {
            setMessages(prev => [...prev, data]);
            scrollToBottom();
            
            // Enviar notificación Push al atleta
            sendPushNotification(
                null,
                selectedClient.id,
                coachName || "Tu Entrenador",
                text,
                '/client-app' // la app del cliente abre su portal/chat
            ).catch(console.error);
            
            // Actualizar último mensaje en la barra lateral
            setClients(prev => prev.map(c => c.id === selectedClient.id ? {
                ...c,
                lastMessage: text,
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } : c));
        }
        setIsSending(false);
    };

    // Filtrar clientes por búsqueda
    const filteredClients = clients.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-black">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                    <p className="text-sm text-zinc-400">Cargando chat...</p>
                </div>
            </div>
        );
    }

    // --- PANEL DE SUSCRIPCIÓN BLOCKED (Vista Premium de Bloqueo) ---
    if (userPlan !== 'elite') {
        return (
            <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-6 bg-black relative overflow-hidden">
                {/* Luces de fondo decorativas */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="max-w-md w-full bg-[#111] border border-zinc-800 rounded-3xl p-8 text-center relative z-10 shadow-2xl">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
                        <Lock className="w-8 h-8 text-emerald-400" />
                    </div>
                    
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-full text-xs font-black text-emerald-400 mb-4 uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5 animate-spin" /> Módulo Exclusivo Elite
                    </div>
                    
                    <h2 className="text-2xl font-black text-white mb-3">Chat en Tiempo Real</h2>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        Mejora tu suscripción al **Plan Elite** de FitLeader para habilitar el canal de comunicación bidireccional y chatear con tus atletas en vivo en cualquier momento.
                    </p>
                    
                    <div className="space-y-3">
                        <Button 
                            onClick={() => navigate('/dashboard/settings')} 
                            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-400 hover:to-blue-400 text-black font-bold py-3 text-sm rounded-xl shadow-lg shadow-emerald-500/10"
                        >
                            Ver Planes de Suscripción
                        </Button>
                        <Button 
                            onClick={() => navigate('/dashboard')} 
                            className="w-full bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 py-3 text-sm rounded-xl"
                        >
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] w-full flex bg-black border border-zinc-800/80 rounded-2xl overflow-hidden">
            {/* 1. BARRA LATERAL IZQUIERDA — LISTADO DE CLIENTES */}
            <div className="w-80 h-full border-r border-zinc-800 flex flex-col bg-[#0b0b0c]">
                {/* Buscador */}
                <div className="p-4 border-b border-zinc-800">
                    <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-400" /> Conversaciones
                    </h2>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                            <Search className="w-4 h-4" />
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-500"
                        />
                    </div>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredClients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500">
                            <User className="w-8 h-8 mb-2 opacity-30" />
                            <p className="text-xs">No se encontraron clientes.</p>
                        </div>
                    ) : (
                        filteredClients.map((client) => {
                            const isSelected = selectedClient?.id === client.id;
                            const initials = client.name ? client.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'A';
                            
                            return (
                                <button
                                    key={client.id}
                                    onClick={() => setSelectedClient(client)}
                                    className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all ${
                                        isSelected 
                                            ? 'bg-zinc-900 border border-zinc-800' 
                                            : 'hover:bg-zinc-900/40 border border-transparent'
                                    }`}
                                >
                                    {/* Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {client.image_url ? (
                                            <img
                                                src={client.image_url}
                                                alt={client.name}
                                                className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-300 font-bold text-xs flex items-center justify-center border border-zinc-700">
                                                {initials}
                                            </div>
                                        )}
                                        {/* Status Dot */}
                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-[#0b0b0c] rounded-full" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="text-xs font-bold text-white truncate">{client.name}</p>
                                            {client.lastMessageTime && (
                                                <span className="text-[10px] text-zinc-500 shrink-0">{client.lastMessageTime}</span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-zinc-400 truncate pr-4">
                                            {client.lastMessage || "Sin mensajes todavía"}
                                        </p>
                                    </div>

                                    {/* Unread Badge */}
                                    {(client.unreadCount || 0) > 0 && (
                                        <span className="bg-emerald-500 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                            {client.unreadCount}
                                        </span>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* 2. AREA DE CHAT CENTRAL */}
            <div className="flex-1 h-full flex flex-col bg-[#121214]">
                {selectedClient ? (
                    <>
                        {/* Header Chat */}
                        <div className="px-6 py-4 border-b border-zinc-800/80 bg-[#0d0d0f] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setSelectedClient(null)} 
                                    className="md:hidden text-zinc-400 hover:text-white mr-1"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h3 className="text-sm font-bold text-white">{selectedClient.name}</h3>
                                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Activo ahora
                                    </p>
                                </div>
                            </div>
                            
                            <Button 
                                onClick={() => navigate(`/dashboard/client/${selectedClient.id}`)}
                                className="bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 hover:bg-zinc-700 text-xs font-bold py-1.5 px-3"
                            >
                                Ver Ficha
                            </Button>
                        </div>

                        {/* Conversación */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 opacity-60">
                                    <MessageCircle className="w-12 h-12 mb-2 text-zinc-600" />
                                    <h4 className="text-sm font-bold text-zinc-400">Comienza la conversación</h4>
                                    <p className="text-xs max-w-xs mt-1">Escribe tu primer mensaje para comunicarte con tu atleta.</p>
                                </div>
                            ) : (
                                messages.map((msg) => {
                                    const isCoach = msg.sender === 'coach';
                                    const time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`flex ${isCoach ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className="max-w-[70%]">
                                                <div className={`p-3.5 rounded-2xl text-xs relative ${
                                                    isCoach 
                                                        ? 'bg-emerald-500 text-black rounded-tr-none font-medium' 
                                                        : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                                                }`}>
                                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                                                        isCoach ? 'text-black/60' : 'text-zinc-500'
                                                    }`}>
                                                        <span>{time}</span>
                                                        {isCoach && (
                                                            <Check className={`w-3.5 h-3.5 ${msg.is_read ? 'text-blue-900' : 'text-black/40'}`} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Entrada de texto */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800/80 bg-[#0d0d0f]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Enviar mensaje a ${selectedClient.name.split(' ')[0]}...`}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500/50 placeholder:text-zinc-500"
                                />
                                <Button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold p-3 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-500 opacity-60 bg-[#121214]">
                        <MessageSquare className="w-16 h-16 mb-4 text-zinc-700" />
                        <h3 className="text-base font-bold text-zinc-400">Bandeja de Entrada</h3>
                        <p className="text-xs max-w-sm mt-1">Selecciona una conversación de la barra lateral para empezar a chatear.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
