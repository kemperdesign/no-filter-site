import { createClient } from '@supabase/supabase-js';

// The URL and publishable key are public by design (they ship to every browser;
// row-level security protects the data). Env vars override these defaults.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rulbnkfppzuqtkkwxwym.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5mYPjwiwqf8n6Ze3HP8-IA_iMnPifBq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const fileUrl = (bucket, path) =>
  path ? `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}` : null;
