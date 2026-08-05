import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminBookingsPage } from './pages/AdminBookingsPage';
import { AdminPage } from './pages/AdminPage';
import { EventTypePage } from './pages/EventTypePage';
import { HomePage } from './pages/HomePage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/event-types/:id" element={<EventTypePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
      </Route>
    </Routes>
  );
}
