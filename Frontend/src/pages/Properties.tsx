import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import type { Property } from '../types';

export default function PropertiesPage() {
  const [list, setList] = useState<Property[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerNight, setPricePerNight] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const data = await api('/properties');
      setList(data as Property[]);
    } catch (e: any) { setErr(e.message); }
  }

  useEffect(() => {
    load();
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function createProperty() {
    setLoading(true); setErr(null);
    try {
      await api('/properties', {
        method: 'POST',
        json: { name, description, location, pricePerNight: Number(pricePerNight) }
      });
      setName(''); setDescription(''); setLocation(''); setPricePerNight('');
      await load();
    } catch (e: any) { setErr(e.message); } finally { setLoading(false); }
  }

  async function updateProperty(id: string) {
    const p = list.find(x => x.id === id);
    if (!p) return;
    const newName = prompt('Nytt namn:', p.name) ?? p.name;
    const newPrice = Number(prompt('Nytt pris per natt:', String(p.price_per_night)) ?? p.price_per_night);
    try {
      await api(`/properties/${id}`, {
        method: 'PUT',
        json: { name: newName, pricePerNight: newPrice }
      });
      await load();
    } catch (e: any) { setErr(e.message); }
  }

  async function deleteProperty(id: string) {
    if (!confirm('Radera property?')) return;
    try {
      await api(`/properties/${id}`, { method: 'DELETE' });
      await load();
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <div>
      <h2>Properties</h2>

      <div style={{ display: 'grid', gap: 8, maxWidth: 500, marginBottom: 16 }}>
        <input placeholder="Namn" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Beskrivning" value={description} onChange={e => setDescription(e.target.value)} />
        <input placeholder="Plats" value={location} onChange={e => setLocation(e.target.value)} />
        <input type="number" placeholder="Pris"
               value={pricePerNight} onChange={e => setPricePerNight(e.target.value)} />
        <button disabled={loading || !name || pricePerNight === ''} onClick={createProperty}>Skapa property</button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </div>

      <ul style={{ display: 'grid', gap: 8, padding: 0 }}>
        {list.map(p => (
          <li key={p.id} style={{ listStyle: 'none', border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
            <b>{p.name}</b> — {p.location ?? 'okänd plats'} — {p.price_per_night} kr/natt
            {p.user_id === userId && (
              <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
                <button onClick={() => updateProperty(p.id)}>Redigera</button>
                <button onClick={() => deleteProperty(p.id)}>Radera</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
