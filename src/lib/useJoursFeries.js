import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useJoursFeries() {
    const [feries, setFeries] = useState(null)
    const [erreur, setErreur] = useState(null)

    useEffect(() => {
        supabase
            .from('jours_feries')
            .select('date')
            .then(({ data, error }) => {
                if (error) {
                    setErreur(error.message)
                    return
                }
                const set = new Set(data.map((ligne) => ligne.date))
                setFeries(set)
            })
    }, [])

    return { feries, erreur }
}