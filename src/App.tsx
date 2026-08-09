import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';

// Landing Page y Auth prioritarias (se cargan síncronamente para renderizado ultra veloz de inicio)
import LandingPage from './pages/LandingPage'; 
import Auth from './pages/Auth'; 

// Lazy Loading para el resto de rutas secundarias del SaaS y Marketplace
const UpdatePassword = lazy(() => import('./pages/UpdatePassword'));
const ClientLogin = lazy(() => import('./pages/client/ClientLogin'));
const ClientWorkout = lazy(() => import('./pages/ClientWorkout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Clients = lazy(() => import('./pages/Clients'));
const ClientProfile = lazy(() => import('./pages/ClientProfile'));
const Agenda = lazy(() => import('./pages/Agenda'));
const Finance = lazy(() => import('./pages/Finance'));
const Settings = lazy(() => import('./pages/Settings'));
const Workouts = lazy(() => import('./pages/Workouts'));
const WorkoutEditor = lazy(() => import('./pages/WorkoutEditor'));
const Reports = lazy(() => import('./pages/Reports'));
const Team = lazy(() => import('./pages/Team'));
const StaffRegister = lazy(() => import('./pages/StaffRegister'));
const Inventory = lazy(() => import('./pages/Inventory'));
const DropinLanding = lazy(() => import('./pages/DropinLanding'));
const CenterSpaces = lazy(() => import('./pages/CenterSpaces'));
const Privacidad = lazy(() => import('./pages/Privacidad'));
const Terminos = lazy(() => import('./pages/Terminos'));
const CoachesMarketplace = lazy(() => import('./pages/CoachesMarketplace'));
const CoachProfile = lazy(() => import('./pages/CoachProfile'));
const SearchCenters = lazy(() => import('./pages/SearchCenters'));
const Chat = lazy(() => import('./pages/Chat'));

const PageLoader = () => (
  <div className="h-screen w-screen bg-[#050505] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const RequireAuth = () => {
  const { session, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/auth" replace />;
  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rutas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/register" element={<StaffRegister />} />
            <Route path="/join/:eventId" element={<DropinLanding />} />
            <Route path="/privacidad" element={<Privacidad />} />
            <Route path="/terminos" element={<Terminos />} />
            <Route path="/coaches" element={<CoachesMarketplace />} />
            <Route path="/coaches/:id" element={<CoachProfile />} />
            
            {/* Rutas de la App del Cliente (Móvil) */}
            <Route path="/client-app" element={<ClientLogin />} />
            <Route path="/client-app/home" element={<ClientWorkout />} /> 
            
            {/* Rutas del Panel de Control (Coach) - Protegidas */}
            <Route element={<RequireAuth />}>
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="client/:id" element={<ClientProfile />} />
                <Route path="workouts" element={<Workouts />} />
                <Route path="workouts/create" element={<WorkoutEditor />} />
                <Route path="workouts/edit/:id" element={<WorkoutEditor />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="finance" element={<Finance />} />
                <Route path="reports" element={<Reports />} />
                <Route path="team" element={<Team />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="center" element={<CenterSpaces />} />
                <Route path="search-centers" element={<SearchCenters />} />
                <Route path="chat" element={<Chat />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;