import { Hono } from "hono";
import { supaForReq, getUserId } from "../lib/supabase.js";

type PropertyRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  location: string | null;
  price_per_night: number;
  available: boolean;
  created_at: string;
};

export const properties = new Hono();

// GET /properties – lista alla
properties.get("/", async (c) => {
  const supa = supaForReq(c.req);

  const { data, error } = await supa
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json((data ?? []) as PropertyRow[]);
});

// POST /properties – skapa (kräver inlogg)
properties.post("/", async (c) => {
  const uid = getUserId(c.req);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);

  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  const name = String(body.name ?? "").trim();
  const description =
    body.description === undefined || body.description === null
      ? null
      : String(body.description);
  const location =
    body.location === undefined || body.location === null
      ? null
      : String(body.location);

  // Frontend skickar "pricePerNight", DB fältet heter "price_per_night"
  const price =
    (body as any).price_per_night !== undefined
      ? Number((body as any).price_per_night)
      : Number((body as any).pricePerNight);

  if (!name || Number.isNaN(price) || price < 0) {
    return c.json({ error: "Bad input: name and pricePerNight required" }, 400);
  }

  const supa = supaForReq(c.req);

  const { data, error } = await supa
    .from("properties")
    .insert({
      user_id: uid,
      name,
      description,
      location,
      price_per_night: price,
      available: true,
    })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as PropertyRow, 201);
});

// PUT /properties/:id – uppdatera (kräver ägarskap via RLS)
properties.put("/:id", async (c) => {
  const uid = getUserId(c.req);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;

  const patch: Partial<PropertyRow> = {};

  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.description === "string" || body.description === null)
    patch.description = (body as any).description ?? null;
  if (typeof body.location === "string" || body.location === null)
    patch.location = (body as any).location ?? null;

  const price =
    (body as any).price_per_night !== undefined
      ? Number((body as any).price_per_night)
      : (body as any).pricePerNight !== undefined
      ? Number((body as any).pricePerNight)
      : undefined;

  if (price !== undefined) {
    if (Number.isNaN(price) || price < 0) {
      return c.json({ error: "Bad input: price" }, 400);
    }
    patch.price_per_night = price;
  }

  const supa = supaForReq(c.req);

  const { data, error } = await supa
    .from("properties")
    .update(patch)
    .eq("id", id)
    .eq("user_id", uid)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data as PropertyRow);
});

// DELETE /properties/:id – radera (kräver ägarskap via RLS)
properties.delete("/:id", async (c) => {
  const uid = getUserId(c.req);
  if (!uid) return c.json({ error: "Unauthorized" }, 401);

  const id = c.req.param("id");
  const supa = supaForReq(c.req);

  const { data, error } = await supa
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("user_id", uid)
    .select("id")
    .single();
  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Forbidden" }, 403);
  return c.json({ ok: true, id: data.id });
});
