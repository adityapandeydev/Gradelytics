import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cctzmaamlobkzqvjylaz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdHptYWFtbG9ia3pxdmp5bGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgzNjk3MzQsImV4cCI6MjA1Mzk0NTczNH0.WcYXFZo3EZqRRy7XFsFnO0npJ52x0CmMuztxOSFbrwY';

export const supabase = createClient(supabaseUrl, supabaseServiceKey); 