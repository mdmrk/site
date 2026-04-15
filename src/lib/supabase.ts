import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_KEY } from "astro:env/server";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
