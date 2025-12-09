import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM to 10 PM
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const dates = ['12', '13', '14', '15', '16', '17', '18']; // Mock dates for the week

const appointments = [
    { id: 1, day: 0, start: 9, duration: 1, title: 'Ana García', type: 'Training', color: 'bg-accent/20 text-accent border-accent/20' },
    { id: 2, day: 0, start: 11, duration: 1.5, title: 'Carlos M.', type: 'Consultation', color: 'bg-blue-500/20 text-blue-500 border-blue-500/20' },
    { id: 3, day: 1, start: 10, duration: 1, title: 'Pedro Suárez', type: 'Training', color: 'bg-accent/20 text-accent border-accent/20' },
    { id: 4, day: 1, start: 16, duration: 1, title: 'Clase Grupal', type: 'Group', color: 'bg-purple-500/20 text-purple-500 border-purple-500/20' },
    { id: 5, day: 2, start: 8, duration: 1, title: 'María López', type: 'Training', color: 'bg-accent/20 text-accent border-accent/20' },
    { id: 6, day: 3, start: 14, duration: 1, title: 'Revisión Online', type: 'Online', color: 'bg-orange-500/20 text-orange-500 border-orange-500/20' },
    { id: 7, day: 4, start: 9, duration: 1, title: 'Ana García', type: 'Training', color: 'bg-accent/20 text-accent border-accent/20' },
    { id: 8, day: 4, start: 18, duration: 1.5, title: 'Carlos M.', type: 'Training', color: 'bg-accent/20 text-accent border-accent/20' },
];

const Agenda = () => {
    const [currentWeek] = useState('12 - 18 Feb, 2024');

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
                    <p className="text-muted-foreground">Gestiona tus sesiones y citas.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="px-4 text-sm font-medium">{currentWeek}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Cita
                    </Button>
                </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="grid grid-cols-8 border-b border-border">
                    <div className="p-4 border-r border-border bg-secondary/30"></div>
                    {days.map((day, i) => (
                        <div key={day} className="p-4 text-center border-r border-border last:border-r-0 bg-secondary/10">
                            <p className="text-xs text-muted-foreground font-medium uppercase">{day}</p>
                            <p className={cn("text-lg font-bold mt-1", i === 2 ? "text-accent" : "text-foreground")}>
                                {dates[i]}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-8 relative min-h-[1000px]">
                        {/* Time Column */}
                        <div className="border-r border-border bg-secondary/30">
                            {timeSlots.map((time) => (
                                <div key={time} className="h-20 border-b border-border/50 p-2 text-xs text-muted-foreground text-right relative">
                                    <span className="-top-3 relative">{time}:00</span>
                                </div>
                            ))}
                        </div>

                        {/* Days Columns */}
                        {days.map((day, dayIndex) => (
                            <div key={day} className="border-r border-border last:border-r-0 relative">
                                {timeSlots.map((time) => (
                                    <div key={time} className="h-20 border-b border-border/50"></div>
                                ))}

                                {/* Appointments */}
                                {appointments
                                    .filter((apt) => apt.day === dayIndex)
                                    .map((apt) => (
                                        <div
                                            key={apt.id}
                                            className={cn(
                                                "absolute inset-x-1 p-2 rounded-md border text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity flex flex-col gap-1 overflow-hidden",
                                                apt.color
                                            )}
                                            style={{
                                                top: `${(apt.start - 6) * 80 + 2}px`, // 80px per hour
                                                height: `${apt.duration * 80 - 4}px`,
                                            }}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold truncate">{apt.title}</span>
                                                <MoreHorizontal className="w-3 h-3 opacity-50" />
                                            </div>
                                            <div className="flex items-center gap-1 opacity-80">
                                                <Clock className="w-3 h-3" />
                                                <span>{apt.start}:00 - {apt.start + apt.duration}:00</span>
                                            </div>
                                            <div className="mt-auto opacity-80 truncate">
                                                {apt.type}
                                            </div>
                                        </div>
                                    ))}

                                {/* Current Time Indicator (Mock for Wednesday at 10:30 AM) */}
                                {dayIndex === 2 && (
                                    <div
                                        className="absolute w-full border-t-2 border-red-500 z-10 pointer-events-none flex items-center"
                                        style={{ top: `${(10.5 - 6) * 80}px` }}
                                    >
                                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Agenda;
