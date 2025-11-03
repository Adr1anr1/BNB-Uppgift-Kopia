import { supabase } from "./supabase";



const BASE = import.meta.env.VITE_API_URL;
export type ApiOptions = RequestInit & { json?: unknown };
async function coreFetch(path: string, opts: ApiOptions = {}) {

  if (!BASE) throw new Error("VITE_API_URL is missing");

  const { data } = await supabase.auth.getSession();

  const token = data.session?.access_token ?? null;

  const headers: Record<string, string> = {

    "Content-Type": "application/json",

    ...(opts.headers as Record<string, string> | undefined),

  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {

    ...opts,

    headers,

    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,

    credentials: "include",

  });

  if (!res.ok) {

    // Try to surface backend JSON error to the UI/devtools

    try {

      const detail = await res.json();

      throw new Error(`API ${res.status}: ${res.statusText} | ${JSON.stringify(detail)}`);

    } catch {

      throw new Error(`API ${res.status}: ${res.statusText}`);

    }

  }



  const text = await res.text();

  return text ? JSON.parse(text) : null;

}



export function apiFetch(path: string, opts?: ApiOptions) {

  return coreFetch(path, opts);

}

export const api = apiFetch;

export default apiFetch;
