export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'Active' | 'Inactive';
    plan: string;
    nextSession: string;
    avatar: string;
}

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
}

export interface Routine {
    id: string;
    title: string;
    description: string;
    exercises: Exercise[];
    assignedClientIds: string[];
}

export interface ExerciseLog {
    id: string;
    clientId: string;
    exerciseName: string;
    date: string;
    weight: number; // in kg
    sets: number;
    reps: number;
}

export const clients: Client[] = [
    { id: '1', name: 'Ana García', email: 'ana.garcia@email.com', phone: '+34 612 345 678', status: 'Active', plan: 'Premium', nextSession: 'Mañana, 10:00 AM', avatar: 'AG' },
    { id: '2', name: 'Carlos Martínez', email: 'carlos.m@email.com', phone: '+34 623 456 789', status: 'Active', plan: 'Estándar', nextSession: 'Hoy, 17:30 PM', avatar: 'CM' },
    { id: '3', name: 'Laura Sánchez', email: 'laura.s@email.com', phone: '+34 634 567 890', status: 'Inactive', plan: 'Básico', nextSession: '-', avatar: 'LS' },
    { id: '4', name: 'Pedro Suárez', email: 'pedro.s@email.com', phone: '+34 645 678 901', status: 'Active', plan: 'Premium', nextSession: 'Jueves, 09:00 AM', avatar: 'PS' },
    { id: '5', name: 'María López', email: 'maria.l@email.com', phone: '+34 656 789 012', status: 'Active', plan: 'Estándar', nextSession: 'Viernes, 11:00 AM', avatar: 'ML' },
    { id: '6', name: 'Jorge Ruiz', email: 'jorge.r@email.com', phone: '+34 667 890 123', status: 'Inactive', plan: '-', nextSession: '-', avatar: 'JR' },
];

export const routines: Routine[] = [
    {
        id: '1',
        title: 'Full Body A - Principiante',
        description: 'Rutina de cuerpo completo enfocada en patrones de movimiento básicos. Ideal para las primeras 4 semanas.',
        exercises: [
            { id: '1', name: 'Sentadilla Copa (Goblet Squat)', sets: 3, reps: '12-15' },
            { id: '2', name: 'Flexiones (Push-ups)', sets: 3, reps: '10' },
            { id: '3', name: 'Remo con Mancuerna', sets: 3, reps: '12' },
            { id: '4', name: 'Plancha Abdominal', sets: 3, reps: '45s' }
        ],
        assignedClientIds: ['3', '6'] // Assigned to inactive/new clients mostly
    },
    {
        id: '2',
        title: 'Torso Fuerza - Intermedio',
        description: 'Enfoque en hipertrofia y fuerza de tren superior. Frecuencia 2x semana.',
        exercises: [
            { id: '1', name: 'Press Banca Plano', sets: 4, reps: '6-8' },
            { id: '2', name: 'Dominadas Lastradas', sets: 4, reps: '6-8' },
            { id: '3', name: 'Press Militar', sets: 3, reps: '8-10' },
            { id: '4', name: 'Peso Muerto', sets: 4, reps: '5-6' },
            { id: '5', name: 'Sentadilla Frontal', sets: 4, reps: '6-8' },
            { id: '6', name: 'Curl de Bíceps', sets: 3, reps: '12' }
        ],
        assignedClientIds: ['1', '4'] // Assigned to Active Premium clients
    }
];

// Exercise logs for progress tracking
export const exerciseLogs: ExerciseLog[] = [
    // Ana García (client 1) - Torso Fuerza exercises
    // Press Banca Plano progression
    { id: '1', clientId: '1', exerciseName: 'Press Banca Plano', date: '2024-09-01', weight: 40, sets: 4, reps: 8 },
    { id: '2', clientId: '1', exerciseName: 'Press Banca Plano', date: '2024-10-01', weight: 42.5, sets: 4, reps: 8 },
    { id: '3', clientId: '1', exerciseName: 'Press Banca Plano', date: '2024-11-01', weight: 45, sets: 4, reps: 7 },
    { id: '4', clientId: '1', exerciseName: 'Press Banca Plano', date: '2024-12-01', weight: 47.5, sets: 4, reps: 8 },

    // Dominadas Lastradas progression
    { id: '5', clientId: '1', exerciseName: 'Dominadas Lastradas', date: '2024-09-01', weight: 5, sets: 4, reps: 8 },
    { id: '6', clientId: '1', exerciseName: 'Dominadas Lastradas', date: '2024-10-01', weight: 7.5, sets: 4, reps: 8 },
    { id: '7', clientId: '1', exerciseName: 'Dominadas Lastradas', date: '2024-11-01', weight: 10, sets: 4, reps: 7 },
    { id: '8', clientId: '1', exerciseName: 'Dominadas Lastradas', date: '2024-12-01', weight: 12.5, sets: 4, reps: 8 },

    // Press Militar progression
    { id: '9', clientId: '1', exerciseName: 'Press Militar', date: '2024-09-01', weight: 25, sets: 3, reps: 10 },
    { id: '10', clientId: '1', exerciseName: 'Press Militar', date: '2024-10-01', weight: 27.5, sets: 3, reps: 10 },
    { id: '11', clientId: '1', exerciseName: 'Press Militar', date: '2024-11-01', weight: 30, sets: 3, reps: 9 },
    { id: '12', clientId: '1', exerciseName: 'Press Militar', date: '2024-12-01', weight: 32.5, sets: 3, reps: 10 },

    // Peso Muerto progression
    { id: '19', clientId: '1', exerciseName: 'Peso Muerto', date: '2024-09-01', weight: 70, sets: 4, reps: 6 },
    { id: '20', clientId: '1', exerciseName: 'Peso Muerto', date: '2024-10-01', weight: 75, sets: 4, reps: 6 },
    { id: '21', clientId: '1', exerciseName: 'Peso Muerto', date: '2024-11-01', weight: 80, sets: 4, reps: 5 },
    { id: '22', clientId: '1', exerciseName: 'Peso Muerto', date: '2024-12-01', weight: 85, sets: 4, reps: 6 },

    // Sentadilla Frontal progression
    { id: '23', clientId: '1', exerciseName: 'Sentadilla Frontal', date: '2024-09-01', weight: 50, sets: 4, reps: 8 },
    { id: '24', clientId: '1', exerciseName: 'Sentadilla Frontal', date: '2024-10-01', weight: 55, sets: 4, reps: 8 },
    { id: '25', clientId: '1', exerciseName: 'Sentadilla Frontal', date: '2024-11-01', weight: 60, sets: 4, reps: 7 },
    { id: '26', clientId: '1', exerciseName: 'Sentadilla Frontal', date: '2024-12-01', weight: 62.5, sets: 4, reps: 8 },

    // Pedro Suárez (client 4) - Also has Torso Fuerza routine
    { id: '13', clientId: '4', exerciseName: 'Press Banca Plano', date: '2024-09-01', weight: 60, sets: 4, reps: 8 },
    { id: '14', clientId: '4', exerciseName: 'Press Banca Plano', date: '2024-12-01', weight: 70, sets: 4, reps: 8 },

    { id: '15', clientId: '4', exerciseName: 'Dominadas Lastradas', date: '2024-09-01', weight: 10, sets: 4, reps: 8 },
    { id: '16', clientId: '4', exerciseName: 'Dominadas Lastradas', date: '2024-12-01', weight: 17.5, sets: 4, reps: 8 },

    { id: '17', clientId: '4', exerciseName: 'Press Militar', date: '2024-09-01', weight: 35, sets: 3, reps: 10 },
    { id: '18', clientId: '4', exerciseName: 'Press Militar', date: '2024-12-01', weight: 42.5, sets: 3, reps: 10 },

    { id: '27', clientId: '4', exerciseName: 'Peso Muerto', date: '2024-09-01', weight: 100, sets: 4, reps: 6 },
    { id: '28', clientId: '4', exerciseName: 'Peso Muerto', date: '2024-12-01', weight: 120, sets: 4, reps: 6 },

    { id: '29', clientId: '4', exerciseName: 'Sentadilla Frontal', date: '2024-09-01', weight: 70, sets: 4, reps: 8 },
    { id: '30', clientId: '4', exerciseName: 'Sentadilla Frontal', date: '2024-12-01', weight: 85, sets: 4, reps: 8 },
];
