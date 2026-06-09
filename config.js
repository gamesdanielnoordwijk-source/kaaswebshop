// Supabase configuratie
const SUPABASE_URL = 'https://kvjzbywewsizegocsajg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0jE3FOK6gFNCSSBIfOiFgg_sC12xa7G';

// Initialiseer Supabase client (window.supabase is nu beschikbaar)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('✅ Supabase client geïnitialiseerd succesvol!');
