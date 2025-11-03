import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Booking, Property } from '../types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyId, setPropertyId] = useState<string>('');
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const [b, p] = await Promise.all([
        api('/bookings'),
        api('/properties')
      ]);
      setBookings(b as Booking[]);
      setProperties(p as Property[]);
      if (!propertyId && p.length) setPropertyId(p[0].id);
    } catch (e: any) { setErr(e.message); }
  }

  useEffect(() => { load(); }, []);

  async function createBooking() {
    setErr(null);
    try {
      await api('/bookings', {
        method: 'POST',
        json: {
          propertyId,
          checkInDate: checkIn,
          checkOutDate: checkOut
        }
      });
      setCheckIn(''); setCheckOut('');
      await load();
    } catch (e: any) { setErr(e.message); }
  }

  return (
    <div>
      <h2>Bookings</h2>

      <div style={{ display: 'grid', gap: 8, maxWidth: 420, marginBottom: 16 }}>
        <select value={propertyId} onChange={e => setPropertyId(e.target.value)}>
          {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
        <button disabled={!propertyId || !checkIn || !checkOut} onClick={createBooking}>Skapa bokning</button>
        {err && <p style={{ color: 'crimson' }}>{err}</p>}
      </div>

      <ul style={{ display: 'grid', gap: 8, padding: 0 }}>
        {bookings.map(b => {
          const propName = properties.find(p => p.id === b.property_id)?.name ?? b.property_id;
          return (
          <li key={b.id} style={{ listStyle: 'none', border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
            <div><b>Property:</b> {propName}</div>
            <div><b>Check-in:</b> {b.check_in_date} — <b>Check-out:</b> {b.check_out_date}</div>
            <div><b>Totalpris:</b> {b.total_price} kr</div>
          </li>
        );})}
      </ul>
    </div>
  );
}
