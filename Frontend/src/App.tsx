import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import PropertiesPage from './pages/Properties';
import BookingsPage from './pages/Bookings';
import AuthPage from './pages/Auth';

export default function App() {
  const [email, setEmail] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setEmail(sess?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    nav('/auth');
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16, fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ marginRight: 'auto' }}>Mini BnB🏠</h1>
        <Link to="/">Properties</Link>
        <Link to="/bookings">Bookings</Link>
        {!email ? <Link to="/auth">Login</Link> : <button onClick={logout}>Logout ({email})</button>}
      </header>

      <Routes>
        <Route path="/" element={<PropertiesPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </div>
  );
}
