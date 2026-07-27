import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (! url || !key) {
    throw new Error(
        'Vairables Supabase manquantes. Vérifie le fichier .env puis arrête et relance le moteur'
    )
}

export const supabase = createClient(url, key)