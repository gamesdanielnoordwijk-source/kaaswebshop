// Supabase configuratie
const SUPABASE_URL = 'https://kvjzbywewsizegocsajg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_0jE3FOK6gFNCSSBIfOiFgg_sC12xa7G';

// Initialiseer Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Export voor gebruik in andere bestanden
console.log('✅ Supabase client geïnitialiseerd');
