import { createClient } from "@supabase/supabase-js";

/* -------------------------------------------------------------------------- */
/* NOTE: requires the `@supabase/supabase-js` package.                       */
/*   npm install @supabase/supabase-js                                       */
/*                                                                             */
/* Env vars needed in .env.local (server-side only — do NOT prefix with      */
/* NEXT_PUBLIC_, the service role key must never reach the browser):         */
/*   SUPABASE_URL=https://<project-ref>.supabase.co                          */
/*   SUPABASE_SERVICE_ROLE_KEY=<service role key from Supabase dashboard>    */
/*                                                                             */
/* This file is only ever imported from API routes (server), never from a    */
/* "use client" component.                                                   */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.",
  );
}

export const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

/** Storage bucket used for product images. Create this bucket (public) in the Supabase dashboard first. */
export const PRODUCT_IMAGES_BUCKET = "product-images";
