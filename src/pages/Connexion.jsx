import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Connexion() {
    const [email, setEmail] = useState('')
    const [motDePasse, setMotDePasse] = useState('')
    const [nom, setNom] = useState('')
    const [inscription, setInscription] = useState(false)
    const [erreur, setErreur] = useState(null)
    const [enCours, setEnCours] = useState(false)

    async function envoyer() {
        setEnCours(true)
        setErreur(null)

        const { error } = inscription
            ? await supabase.auth.signUp({
                email,
                password: motDePasse,
                options: { data: { nom } },
            })
            : await supabase.auth.signInWithPassword({ email, password: motDePasse })

        if (error) setErreur(error.message)
        setEnCours(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 p-8">
                <h1 className="text-xl font-semibold text-slate-900">
                    {inscription ? 'Créer un compte' : 'Connexion'}
                </h1>
                <p className="text-sm text-slate-500 mt-1 mb-6">Gestion des congés payés</p>

                <div className="space-y-3">
                    {inscription && (
                        <input
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Nom complet"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                        />
                    )}
                    <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        type="password"
                        placeholder="Mot de passe"
                        value={motDePasse}
                        onChange={(e) => setMotDePasse(e.target.value)}
                    />
                </div>

                {erreur && <p className="text-sm text-red-600 mt-3">{erreur}</p>}

                <button
                    onClick={envoyer}
                    disabled={enCours}
                    className="w-full mt-5 rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 disabled:opacity-50"
                >
                    {enCours ? 'Patiente…' : inscription ? "S'inscrire" : 'Se connecter'}
                </button>

                <button
                    onClick={() => { setInscription(!inscription); setErreur(null) }}
                    className="w-full mt-3 text-sm text-slate-500 hover:text-slate-900"
                >
                    {inscription ? "J'ai déjà un compte" : 'Créer un compte'}
                </button>
            </div>
        </div>
    )
}