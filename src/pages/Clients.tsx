import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, Filter, Mail, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const clientsData = [
    { id: '1', name: 'Ana García', email: 'ana.garcia@email.com', phone: '+34 612 345 678', status: 'Active', plan: 'Premium', nextSession: 'Mañana, 10:00 AM', avatar: 'AG' },
    { id: '2', name: 'Carlos Martínez', email: 'carlos.m@email.com', phone: '+34 623 456 789', status: 'Active', plan: 'Estándar', nextSession: 'Hoy, 17:30 PM', avatar: 'CM' },
    { id: '3', name: 'Laura Sánchez', email: 'laura.s@email.com', phone: '+34 634 567 890', status: 'Inactive', plan: 'Básico', nextSession: '-', avatar: 'LS' },
    { id: '4', name: 'Pedro Suárez', email: 'pedro.s@email.com', phone: '+34 645 678 901', status: 'Active', plan: 'Premium', nextSession: 'Jueves, 09:00 AM', avatar: 'PS' },
    { id: '5', name: 'María López', email: 'maria.l@email.com', phone: '+34 656 789 012', status: 'Active', plan: 'Estándar', nextSession: 'Viernes, 11:00 AM', avatar: 'ML' },
    { id: '6', name: 'Jorge Ruiz', email: 'jorge.r@email.com', phone: '+34 667 890 123', status: 'Inactive', plan: '-', nextSession: '-', avatar: 'JR' },
];

const Clients = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClients = clientsData.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
                    <p className="text-muted-foreground">Gestiona tu base de clientes y sus progresos.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Nuevo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-[300px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nombre o email..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-lg">Cliente</th>
                                    <th className="px-6 py-3">Contacto</th>
                                    <th className="px-6 py-3">Estado</th>
                                    <th className="px-6 py-3">Plan Actual</th>
                                    <th className="px-6 py-3">Próxima Sesión</th>
                                    <th className="px-6 py-3 text-right rounded-tr-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr
                                        key={client.id}
                                        className="border-b border-border hover:bg-secondary/20 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold border border-border text-foreground" translate="no">
                                                    {client.avatar}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-foreground">{client.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-muted-foreground">
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Mail className="w-3 h-3" /> {client.email}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <Phone className="w-3 h-3" /> {client.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium",
                                                client.status === 'Active' ? "bg-accent/10 text-accent" : "bg-secondary text-muted-foreground"
                                            )}>
                                                {client.status === 'Active' ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{client.plan}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{client.nextSession}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); }}>
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Clients;
