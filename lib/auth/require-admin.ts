import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    return {
      authorized: false as const,
      status: 401 as const,
      userId: null,
    };
  }

  const userId = data.claims.sub;

  if (!userId) {
    return {
      authorized: false as const,
      status: 401 as const,
      userId: null,
    };
  }

  return {
    authorized: true as const,
    status: 200 as const,
    userId,
  };
}
