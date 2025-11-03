import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('12345678');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [msg, setMsg] = useState<string | null>(null);
  const nav = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg('Konto skapat – logga in nu.');
        setMode('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav('/');
      }
    } catch (err: any) {
      setMsg(err.message ?? 'Auth error');
    }
  }

  return (
    <div>
      <h2>{mode === 'login' ? 'Logga in' : 'Registrera'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 360 }}>
        <input placeholder="E-post" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Lösenord" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">{mode === 'login' ? 'Logga in' : 'Skapa konto'}</button>
      </form>
      <p style={{ marginTop: 8 }}>
        {mode === 'login' ? (
          <>Inget konto? <button onClick={() => setMode('register')}>Registrera</button></>
        ) : (
          <>Har du konto? <button onClick={() => setMode('login')}>Logga in</button></>
        )}
      </p>
      {msg && <p style={{ color: 'crimson' }}>{msg}</p>}
      <p style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        Tips: test@test.com / 12345678 finns redan hos dig.
      </p>
    </div>
  );
}
