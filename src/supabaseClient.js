import { createClient } from "@supabase/supabase-js";

// --- PASTE YOUR SUPABASE URL AND PUBLIC KEY HERE ---
const SUPABASE_URL = "https://utbsqntodiransjpuksz.supabase.co";
const SUPABASE_PUBLIC_KEY = "sb_publishable_VmSGr0iEx_AJ1w8MqDjHBw_SXjB5i5Q";

if (SUPABASE_PUBLIC_KEY.startsWith("sb_publishable_")) {
  console.warn("WARNING: The SUPABASE_PUBLIC_KEY provided looks like a Stripe publishable key. Please ensure you are using your Supabase 'anon' public key (usually a long JWT starting with 'eyJ').");
}
// ----------------------------------------------------

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);
