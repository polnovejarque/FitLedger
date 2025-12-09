import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Finance from './pages/Finance';

import Clients from './pages/Clients';
import ClientProfile from './pages/ClientProfile';

import Agenda from './pages/Agenda';
import Workouts from './pages/Workouts';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientProfile />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
