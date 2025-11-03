Mini BnB – Körinstruktioner och Setup

## Förutsättningar
- Node.js 18+
- Ett Supabase-projekt (URL + Anon Key)

## Struktur
- `Backend/` – Hono + TypeScript API
- `Frontend/` – React + TypeScript (Vite)
- `Supabase/Supabase.sql` – tabeller + RLS-policies

## 1) Miljövariabler

Skapa `.env` i `Backend/` baserat på `Backend/.env.example`:

```
SUPABASE_URL= https://<ditt-projekt>.supabase.co
SUPABASE_ANON_KEY= <din-anon-key>
PORT=8787
```

Skapa `.env` i `Frontend/` baserat på `Frontend/.env.example`:

```
VITE_SUPABASE_URL= https://<ditt-projekt>.supabase.co
VITE_SUPABASE_ANON_KEY= <din-anon-key>
VITE_API_URL= http://localhost:8787
```

## 2) Initiera databasen (Supabase)

Kör innehållet i `Supabase/Supabase.sql` i SQL-editorn i Supabase:
- Skapar tabeller: `profiles`, `properties`, `bookings`
- Aktiverar RLS + policies (endast ägare får ändra, användare ser endast egna bokningar osv.)
-Detta är bara för att köra din egna Supabase då denna har redan env kopplat till sig

## 3) Installera beroenden

I projektroten, kör i varsin terminal eller sekventiellt:

```bash
cd Backend && npm install
```

```bash
cd Frontend && npm install
```

## 4) Starta utvecklingsmiljö

Terminal A (Backend):
```bash
cd Backend
npm run dev
# Server: http://localhost:8787
```

Terminal B (Frontend):
```bash
cd Frontend
npm run dev
# Vite: http://localhost:5173
```

Logga in/registrera via frontendens `/auth`. Efter login skickas JWT som `Authorization: Bearer <token>` till backend.

## 5) Funktionalitet
- Properties: CRUD via UI (ägare kan uppdatera/radera sina properties)
- Bookings: skapa och lista egna bokningar; radera egna bokningar
- Totalpris beräknas i backend: `price_per_night × antal nätter`

## 6) Bygga för produktion

Backend:
Posta backend på t.ex vercel 

Frontend:
Göra samma på vercel och sedan koppla env till backend då man ändrar api url till Backends api som är deployad. Har inte gjort det då ska bara visa uppgiften och den funkar via Localhost

## 7) Vanliga problem
- 401 Unauthorized: Kontrollera att du är inloggad i frontend och att `VITE_API_URL` pekar på backend.
- CORS: Backend tillåter `http://localhost:5173`. Ändra i `Backend/src/index.ts` vid behov.
- RLS-policy blockerar: Säkerställ att JWT skickas från frontend (se `Frontend/src/lib/api.ts`).

## 8) Kodspråk och ramverk
- Backend: TypeScript + Hono, strikt typat (inga `any` i egen kod)
- Frontend: React + TypeScript (Vite)
- Databas: Supabase (Postgres), RLS-policies aktiverade


