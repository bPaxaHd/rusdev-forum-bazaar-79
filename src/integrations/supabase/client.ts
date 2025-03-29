
import { createClient } from "@supabase/supabase-js";

// Using environment variables for the Supabase URL and anon key
const supabaseUrl = "https://bciboexxeayylqcneuqq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjaWJvZXh4ZWF5eWxxY25ldXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA0NjcyNzQsImV4cCI6MTk5NjA0MzI3NH0.Ncp4cUpQB3j4-gzGRkq8JE7XAb7I92U-Q8xzAQy1mJA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;
