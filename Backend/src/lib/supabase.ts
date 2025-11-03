import { createClient } from "@supabase/supabase-js";
import type { HonoRequest } from "hono";
import jwt from "jsonwebtoken";

// Plocka ut Bearer-token från request
export function getToken(req: HonoRequest): string | null {
  const auth = req.header("authorization");
  if (!auth) return null;
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

// Skapa en supabase-klient per request som bär användarens token → RLS funkar med anon key
export function supaForReq(req: HonoRequest) {
  const url = process.env.SUPABASE_URL as string | undefined;
  const anonKey = process.env.SUPABASE_ANON_KEY as string | undefined;
  if (!url || !anonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in Backend environment");
  }
  const token = getToken(req);
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  });
}


export function getUserId(req: HonoRequest): string | null {
  const token = getToken(req);
  if (!token) return null;
  const decoded = jwt.decode(token) as { sub?: string } | null;
  return decoded?.sub ?? null;
}
