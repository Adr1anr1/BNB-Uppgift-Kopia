export type Property = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  location: string | null;
  price_per_night: number;
  available: boolean;
  created_at: string;
}

export type Booking = {
  id: string;
  user_id: string;
  property_id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  created_at: string;
}
