import { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
// FIX: Eliminado 'Video' de los imports porque usamos 'FileVideo'
import { Search, Plus, Trash2, GripVertical, Save, Dumbbell, CalendarPlus, LayoutList, X, Users, Check, Pencil, Upload, FileVideo } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { clients } from '../lib/data';

// Base de datos inicial
const initialExerciseLibrary = [
    { id: 'ex1', name: 'Press Banca Plano', category: 'Pecho', video: 'https://www.youtube.com/embed/rT7DgCr-3pg' },
    { id: 'ex2', name: 'Sentadilla', category: 'Pierna', video: 'https://www.youtube.com/embed/UltWZb7h-60' },
    { id: 'ex3', name: 'Peso Muerto', category: 'Espalda', video: '' },
    { id: 'ex4', name: 'Dominadas', category: 'Espalda', video: '' },
    { id: 'ex5', name: 'Press Militar', category: 'Hombro', video: '' },
    { id: 'ex6', name: 'Curl de Bíceps', category: 'Brazos', video: '' },
    { id: 'ex7', name: 'Extensión de Tríceps', category: 'Brazos', video: '' },
    { id: 'ex8', name: 'Zancadas', category: 'Pierna', video: '' },
    { id: 'ex9', name: 'Plancha Abdominal', category: 'Core', video: '' },
    { id: 'ex10', name: 'Burpees', category: 'Cardio', video: '' },
];

interface RoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (routine: any) => void;
    initialData?: any;
}

const RoutineModal = ({ isOpen, onClose, onSave, initialData }: RoutineModalProps) => {
    // Estado de la Rutina
    const [routineName, setRoutineName] = useState('');
    const [description, setDescription] = useState('');
    
    // Estado de los Días
    const [days, setDays] = useState([{ id: 'day-1', name: 'Día 1', exercises: [] as any[] }]);
    const [activeDayIndex, setActiveDayIndex] = useState(0);

    // Asignación de Clientes
    const [assignedClientIds, setAssignedClientIds] = useState<string[]>([]);
    const [showClientSelector, setShowClientSelector] = useState(false);

    // Estado de la Biblioteca
    const [searchTerm, setSearchTerm] = useState('');
    const [library, setLibrary] = useState(initialExerciseLibrary);
    
    // Estado para Crear/Editar Ejercicio
    const [isCreatingExercise, setIsCreatingExercise] = useState(false);
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
    const [newExerciseName, setNewExerciseName] = useState('');
    const [newExerciseCategory, setNewExerciseCategory] = useState('Pecho');
    
    // Estado para el archivo de video
    const [newExerciseVideo, setNewExerciseVideo] = useState('');
    const [videoFileName, setVideoFileName] = useState(''); 
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cargar datos
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setRoutineName(initialData.title);
                setDescription(initialData.description || '');
                if (initialData.days) {
                    setDays(initialData.days);
                } else if (initialData.exercises) {
                    setDays([{ id: 'day-1', name: 'Día 1', exercises: initialData.exercises }]);
                }
                setAssignedClientIds(initialData.assignedClientIds || []);
            } else {
                setRoutineName('');
                setDescription('');
                setDays([{ id: 'day-1', name: 'Día 1', exercises: [] }]);
                setActiveDayIndex(0);
                setAssignedClientIds([]);
            }
            setShowClientSelector(false);
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    // --- LÓGICA DRAG & DROP ---
    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const newDays = [...days];
        const currentDayExercises = [...newDays[activeDayIndex].exercises];
        const [reorderedItem] = currentDayExercises.splice(result.source.index, 1);
        currentDayExercises.splice(result.destination.index, 0, reorderedItem);
        newDays[activeDayIndex].exercises = currentDayExercises;
        setDays(newDays);
    };

    // --- LÓGICA DE DÍAS ---
    const addDay = () => {
        const newDayNumber = days.length + 1;
        setDays([...days, { id: `day-${Date.now()}`, name: `Día ${newDayNumber}`, exercises: [] }]);
        setActiveDayIndex(days.length);
    };

    const removeDay = (index: number) => {
        if (days.length === 1) return;
        const newDays = days.filter((_, i) => i !== index);
        setDays(newDays);
        if (activeDayIndex >= newDays.length) setActiveDayIndex(newDays.length - 1);
    };

    const updateDayName = (name: string) => {
        const newDays = [...days];
        newDays[activeDayIndex].name = name;
        setDays(newDays);
    };

    // --- LÓGICA DE EJERCICIOS ---
    const addExerciseToDay = (exercise: any) => {
        const newDays = [...days];
        newDays[activeDayIndex].exercises.push({
            ...exercise,
            sets: 3,
            reps: '10-12',
            rest: '90s',
            uniqueId: `${exercise.id}-${Date.now()}` 
        });
        setDays(newDays);
    };

    const removeExerciseFromDay = (exerciseIndex: number) => {
        const newDays = [...days];
        newDays[activeDayIndex].exercises.splice(exerciseIndex, 1);
        setDays(newDays);
    };

    // --- GESTIÓN DE VIDEO (Upload Local) ---
    const handleVideoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Creamos una URL temporal local para previsualizarlo
            const objectUrl = URL.createObjectURL(file);
            setNewExerciseVideo(objectUrl);
            setVideoFileName(file.name);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    // --- GESTIÓN DE BIBLIOTECA ---
    const handleSaveExercise = () => {
        if (!newExerciseName.trim()) return;

        if (editingExerciseId) {
            // EDITAR
            setLibrary(prev => prev.map(ex => 
                ex.id === editingExerciseId 
                    ? { ...ex, name: newExerciseName, category: newExerciseCategory, video: newExerciseVideo } 
                    : ex
            ));
            setEditingExerciseId(null);
        } else {
            // CREAR
            const newEx = {
                id: `custom-${Date.now()}`,
                name: newExerciseName,
                category: newExerciseCategory,
                video: newExerciseVideo
            };
            setLibrary([newEx, ...library]);
            addExerciseToDay(newEx); 
        }

        // Reset form
        setIsCreatingExercise(false);
        setNewExerciseName('');
        setNewExerciseCategory('Pecho');
        setNewExerciseVideo('');
        setVideoFileName('');
    };

    const startEditing = (e: React.MouseEvent, exercise: any) => {
        e.stopPropagation();
        setNewExerciseName(exercise.name);
        setNewExerciseCategory(exercise.category);
        setNewExerciseVideo(exercise.video || '');
        setVideoFileName(exercise.video ? 'Video cargado' : '');
        setEditingExerciseId(exercise.id);
        setIsCreatingExercise(true);
    };

    const deleteFromLibrary = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirm('¿Borrar este ejercicio de la biblioteca?')) {
            setLibrary(prev => prev.filter(ex => ex.id !== id));
        }
    };

    const cancelEditing = () => {
        setIsCreatingExercise(false);
        setEditingExerciseId(null);
        setNewExerciseName('');
        setNewExerciseVideo('');
        setVideoFileName('');
    };

    // --- CLIENTES ---
    const toggleClient = (clientId: string) => {
        setAssignedClientIds(prev => 
            prev.includes(clientId) 
                ? prev.filter(id => id !== clientId) 
                : [...prev, clientId]
        );
    };

    const handleSave = () => {
        onSave({
            title: routineName,
            description,
            days: days,
            exerciseCount: days.reduce((acc, day) => acc + day.exercises.length, 0),
            assignedClientIds: assignedClientIds
        });
        onClose();
    };

    const filteredLibrary = library.filter(ex => 
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ex.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-6xl h-[90vh] bg-card border border-border rounded-xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
                
                {/* HEADER */}
                <div className="flex justify-between items-center p-4 border-b border-border bg-card z-10 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <LayoutList className="w-5 h-5 text-accent" />
                            {initialData ? 'Editar Rutina' : 'Constructor de Rutinas'}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={!routineName.trim()}>
                            <Save className="w-4 h-4 mr-2" />
                            Guardar
                        </Button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    
                    {/* BIBLIOTECA (IZQUIERDA) */}
                    <div className="w-80 border-r border-border flex flex-col bg-secondary/10 shrink-0">
                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Buscar ejercicio..." 
                                    className="pl-9 bg-background"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            {isCreatingExercise ? (
                                <div className="p-3 bg-background border border-border rounded-lg space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
                                    <p className="text-xs font-bold text-accent uppercase tracking-wider">
                                        {editingExerciseId ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                                    </p>
                                    <Input 
                                        placeholder="Nombre del ejercicio" 
                                        value={newExerciseName}
                                        onChange={(e) => setNewExerciseName(e.target.value)}
                                        autoFocus
                                    />
                                    
                                    {/* SECCIÓN DE UPLOAD DE VIDEO */}
                                    <div className="space-y-2">
                                        <input 
                                            type="file" 
                                            accept="video/*" 
                                            className="hidden" 
                                            ref={fileInputRef} 
                                            onChange={handleVideoFileSelect}
                                        />
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className={`w-full justify-start text-xs ${videoFileName ? 'border-accent text-accent' : ''}`}
                                                onClick={triggerFileInput}
                                            >
                                                {videoFileName ? (
                                                    <>
                                                        <Check className="w-3 h-3 mr-2" />
                                                        {videoFileName.length > 15 ? videoFileName.substring(0,12) + '...' : videoFileName}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-3 h-3 mr-2" />
                                                        Subir Video MP4
                                                    </>
                                                )}
                                            </Button>
                                            {videoFileName && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                                                    onClick={() => { setNewExerciseVideo(''); setVideoFileName(''); }}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <select 
                                        className="w-full h-9 rounded-md border border-input bg-zinc-900 text-white px-3 py-1 text-sm shadow-sm focus:ring-2 focus:ring-accent outline-none"
                                        style={{ colorScheme: 'dark' }} 
                                        value={newExerciseCategory}
                                        onChange={(e) => setNewExerciseCategory(e.target.value)}
                                    >
                                        <option value="Pecho">Pecho</option>
                                        <option value="Espalda">Espalda</option>
                                        <option value="Pierna">Pierna</option>
                                        <option value="Hombro">Hombro</option>
                                        <option value="Brazos">Brazos</option>
                                        <option value="Cardio">Cardio</option>
                                        <option value="Core">Core</option>
                                    </select>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1" onClick={handleSaveExercise}>
                                            {editingExerciseId ? 'Actualizar' : 'Añadir'}
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={cancelEditing}>Cancelar</Button>
                                    </div>
                                </div>
                            ) : (
                                <Button variant="outline" className="w-full border-dashed" onClick={() => setIsCreatingExercise(true)}>
                                    <Plus className="w-4 h-4 mr-2" /> Crear Ejercicio
                                </Button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {filteredLibrary.map(exercise => (
                                <div 
                                    key={exercise.id} 
                                    className="group flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:border-accent/50 cursor-pointer transition-all hover:translate-x-1 shadow-sm relative overflow-hidden"
                                    onClick={() => addExerciseToDay(exercise)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-secondary rounded-md">
                                            {exercise.video ? (
                                                <FileVideo className="w-4 h-4 text-accent" />
                                            ) : (
                                                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{exercise.name}</p>
                                            <p className="text-xs text-muted-foreground">{exercise.category}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 bg-card pl-2 shadow-[-10px_0_10px_rgba(0,0,0,0.5)]">
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7 text-muted-foreground hover:text-accent"
                                            onClick={(e) => startEditing(e, exercise)}
                                            title="Editar"
                                        >
                                            <Pencil className="w-3 h-3" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={(e) => deleteFromLibrary(e, exercise.id)}
                                            title="Borrar"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-accent" title="Añadir a rutina">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONSTRUCTOR (DERECHA) - Sin cambios */}
                    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
                        <div className="p-6 space-y-4 border-b border-border/50 shrink-0">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nombre de la Rutina</label>
                                            <Input 
                                                placeholder="Ej: Hipertrofia 4 Días" 
                                                value={routineName}
                                                onChange={(e) => setRoutineName(e.target.value)}
                                                className="text-lg font-semibold"
                                            />
                                        </div>
                                        <div className="space-y-2 relative">
                                            <label className="text-sm font-medium">Asignar a Clientes</label>
                                            <div 
                                                className="flex items-center justify-between h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent/5"
                                                onClick={() => setShowClientSelector(!showClientSelector)}
                                            >
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Users className="w-4 h-4" />
                                                    {assignedClientIds.length > 0 
                                                        ? `${assignedClientIds.length} Clientes seleccionados` 
                                                        : 'Seleccionar clientes...'}
                                                </div>
                                                <span className="text-xs">▼</span>
                                            </div>
                                            {showClientSelector && (
                                                <div className="absolute top-full left-0 w-full mt-1 bg-card border border-border rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
                                                    {clients.map(client => (
                                                        <div 
                                                            key={client.id}
                                                            className="flex items-center justify-between p-3 hover:bg-secondary/50 cursor-pointer border-b border-border/50 last:border-0"
                                                            onClick={() => toggleClient(client.id)}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                                                    {client.name.substring(0, 2).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium">{client.name}</p>
                                                                    <p className="text-xs text-muted-foreground">{client.plan}</p>
                                                                </div>
                                                            </div>
                                                            {assignedClientIds.includes(client.id) && (
                                                                <Check className="w-4 h-4 text-green-500" />
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Descripción</label>
                                        <Input 
                                            placeholder="Objetivo principal..." 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-4 pb-0 overflow-x-auto border-b border-border shrink-0">
                            {days.map((day, index) => (
                                <div 
                                    key={day.id}
                                    onClick={() => setActiveDayIndex(index)}
                                    className={`group relative px-6 py-3 rounded-t-lg cursor-pointer transition-colors border-t border-x ${
                                        activeDayIndex === index 
                                        ? 'bg-secondary/30 border-border border-b-background z-10' 
                                        : 'bg-transparent border-transparent hover:bg-secondary/10 text-muted-foreground'
                                    }`}
                                    style={{ marginBottom: '-1px' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm whitespace-nowrap">{day.name}</span>
                                        {days.length > 1 && (
                                            <X 
                                                className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity" 
                                                onClick={(e) => { e.stopPropagation(); removeDay(index); }}
                                            />
                                        )}
                                    </div>
                                    {activeDayIndex === index && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                                    )}
                                </div>
                            ))}
                            <button 
                                onClick={addDay}
                                className="px-3 py-2 rounded-md hover:bg-secondary/20 text-muted-foreground transition-colors"
                                title="Añadir Día"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-secondary/5">
                            <div className="flex items-center gap-4 mb-6">
                                <Input 
                                    value={days[activeDayIndex].name}
                                    onChange={(e) => updateDayName(e.target.value)}
                                    className="w-48 font-semibold bg-background border-transparent hover:border-input focus:border-input transition-colors"
                                />
                                <span className="text-sm text-muted-foreground">
                                    {days[activeDayIndex].exercises.length} Ejercicios
                                </span>
                            </div>

                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="exercises-list">
                                    {(provided) => (
                                        <div 
                                            {...provided.droppableProps} 
                                            ref={provided.innerRef}
                                            className="space-y-3 min-h-[200px]"
                                        >
                                            {days[activeDayIndex].exercises.length === 0 && (
                                                <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
                                                    <div className="bg-secondary/20 p-4 rounded-full w-fit mx-auto mb-4">
                                                        <CalendarPlus className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <h3 className="text-lg font-medium">Día Vacío</h3>
                                                    <p className="text-muted-foreground">Haz clic en los ejercicios de la izquierda para añadirlos.</p>
                                                </div>
                                            )}

                                            {days[activeDayIndex].exercises.map((exercise: any, idx: number) => (
                                                <Draggable 
                                                    key={exercise.uniqueId || `${exercise.id}-${idx}`} 
                                                    draggableId={exercise.uniqueId || `${exercise.id}-${idx}`} 
                                                    index={idx}
                                                >
                                                    {(provided, snapshot) => (
                                                        <Card 
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={`p-4 flex items-center justify-between group transition-colors ${
                                                                snapshot.isDragging ? "border-accent shadow-xl bg-card z-50" : "hover:border-accent/30"
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-4 flex-1">
                                                                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1 hover:bg-secondary rounded">
                                                                    <GripVertical className="w-5 h-5 text-muted-foreground" />
                                                                </div>
                                                                <div className="h-10 w-10 bg-accent/10 rounded-lg flex items-center justify-center text-accent font-bold shrink-0">
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-semibold">{exercise.name}</h4>
                                                                        {exercise.video && <FileVideo className="w-3 h-3 text-accent" />}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                                                        <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded text-xs">
                                                                            <LayoutList className="w-3 h-3" /> {exercise.sets} Series
                                                                        </span>
                                                                        <span className="text-xs">x</span>
                                                                        <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs">{exercise.reps} Reps</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => removeExerciseFromDay(idx)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoutineModal;