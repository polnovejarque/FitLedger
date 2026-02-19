import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage'; 
import Auth from './pages/Auth'; 
import ClientLogin from './pages/client/ClientLogin'; 
import ClientWorkout from './pages/ClientWorkout'; 
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';

// ✅ IMPORTANTE: Aquí llamamos al archivo de la ficha del cliente
import ClientProfile from './pages/ClientProfile';

import Agenda from './pages/Agenda';
import Finance from './pages/Finance';
import Settings from './pages/Settings';
import Workouts from './pages/Workouts';
import WorkoutEditor from './pages/WorkoutEditor';
import Reports from './pages/Reports';

const RequireAuth = () => {
  const { session, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen bg-black flex items-center justify-center">Cargando...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Rutas de la App del Cliente (Móvil) */}
          <Route path="/client-app" element={<ClientLogin />} />
          <Route path="/client-app/home" element={<ClientWorkout />} /> 
          
          {/* Rutas del Panel de Control (Coach) - Protegidas */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              
              {/* LISTA DE CLIENTES */}
              <Route path="clients" element={<Clients />} />
              
              {/* ⚠️ CAMBIO CRÍTICO AQUÍ: Cambiado a "client/:id" (singular) para coincidir con Clients.tsx */}
              <Route path="client/:id" element={<ClientProfile />} />
              
              <Route path="workouts" element={<Workouts />} />
              <Route path="workouts/create" element={<WorkoutEditor />} />
              <Route path="workouts/edit/:id" element={<WorkoutEditor />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="finance" element={<Finance />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;