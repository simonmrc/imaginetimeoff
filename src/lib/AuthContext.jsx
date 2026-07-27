import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null)
    const [profil, setProfil] = useState(null)
    const [chargement, setChargement] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            if (!data.session) setChargement(false)
        })

        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s)
            if (!s) setChargement(false)
        })
        return () => sub.subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (!session) {
            setProfil(null)
            return
        }
        supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
                setProfil(data)
                setChargement(false)
            })
    }, [session])

    return (
        <AuthContext.Provider value={{ session, profil, chargement }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)