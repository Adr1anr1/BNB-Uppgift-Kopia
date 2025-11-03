import { Hono } from "hono";
import { supaForReq, getUserId } from "../lib/supabase.js";

export const bookings = new Hono();

bookings.get("/", async (c) => {
  const supa = supaForReq(c.req);
  const userId = getUserId(c.req);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const { data, error } = await supa
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data ?? []);
});

bookings.post("/", async (c) => {
  const supa = supaForReq(c.req);
  const userId = getUserId(c.req);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  // Se till att profil finns för användaren (FK -> profiles.id)
  await supa
    .from("profiles")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

  const body = await c.req.json<{ propertyId: string; checkInDate: string; checkOutDate: string }>();
  const { propertyId, checkInDate, checkOutDate } = body;

  const ci = new Date(checkInDate);
  const co = new Date(checkOutDate);
  if (!(co > ci)) return c.json({ error: "checkOutDate must be after checkInDate" }, 400);

  const { data: prop, error: propErr } = await supa
    .from("properties")
    .select("price_per_night, available")
    .eq("id", propertyId)
    .single();

  if (propErr || !prop) return c.json({ error: "Property not found" }, 404);
  if (!prop.available) return c.json({ error: "Property not available" }, 400);


  const nights = Math.ceil((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
  const total = Number(prop.price_per_night) * nights;

  const { data, error } = await supa
    .from("bookings")
    .insert({
      user_id: userId,
      property_id: propertyId,
      check_in_date: checkInDate,
      check_out_date: checkOutDate,
      total_price: total
    })
    .select("*")
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data, 201);
});

bookings.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = getUserId(c.req);
  if (!userId) return c.json({ error: "Unauthorized" }, 401);

  const { error, count } = await supaForReq(c.req)
    .from("bookings")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return c.json({ error: error.message }, 400);
  if ((count ?? 0) === 0) return c.json({ error: "Not found" }, 404);
  return c.json({ ok: true });
});
