/** Default anonymous key for local Supabase (supabase start). */
const LOCAL_ANON_KEY_PREFIX = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vI"

export function isSupabaseLocalUrl(url: string | undefined): boolean {
  if (!url) return false
  try {
    const { hostname } = new URL(url)
    return hostname === "127.0.0.1" || hostname === "localhost"
  } catch {
    return false
  }
}

/** Returns true if the app is in demo/placeholder mode (local stack not running or env incomplete). */
export function isSupabasePlaceholder(): boolean {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return true

  if (
    url.includes("your-project-id") ||
    key.includes("your-supabase-anon-key")
  ) {
    return true
  }

  if (isSupabaseLocalUrl(url) && key.startsWith(LOCAL_ANON_KEY_PREFIX)) {
    return false
  }

  return false
}
