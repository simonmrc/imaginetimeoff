import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const LIBELLES_STATUT = {
    en_attente: { texte: 'En attente', classe: 'bg-amber-100 text-amber-800' },
    approuvee: { texte: 'Approuvée', classe: 'bg-green-100 text-green-800' },
    refusee: { texte: 'Refusée', classe: 'bg-red-100 text-red-800' },
    annulee: { texte: 'Annulée', classe: 'bg-slate-100 text-slate-600' },
}

export default function MesDemandes() {
    const { profil } = useAuth()
    const [demandes, setDemandes] = useState(null)
    const [erreur, setErreur] = useState(null)

    useEffect(() => {
        chargerMesDemandes()
    }, [])

    async function chargerMesDemandes() {
        const { data, error } = await supabase
            .from('demandes')
            .select('*')
            .order('date_debut', { ascending: false })

        if (error) {
            setErreur(error.message)
            return
        }
        setDemandes(data)
    }

    async function annuler(id) {
        const { error } = await supabase
            .from('demandes')
            .update({ statut: 'annulee' })
            .eq('id', id)

        if (error) {
            setErreur(error.message)
            return
        }
        chargerMesDemandes()
    }

    if (erreur) return <p className="text-red-600 p-6">{erreur}</p>
    if (!demandes) return <p className="text-slate-500 p-6">Chargement…</p>

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Mes demandes</h2>

            {demandes.length === 0 && (
                <p className="text-sm text-slate-500 mt-3">Aucune demande pour l'instant.</p>
            )}

            <div className="mt-4 space-y-3">
                {demandes.map((d) => {
                    const statut = LIBELLES_STATUT[d.statut]
                    const peutAnnuler = d.statut === 'en_attente' || d.statut === 'approuvee'

                    return (
                        <div key={d.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-900">
                                        Du {d.date_debut} au {d.date_fin} — {d.nb_jours} jour{d.nb_jours > 1 ? 's' : ''}
                                    </p>
                                    {d.motif_refus && (
                                        <p className="text-sm text-red-600 mt-1">Motif : {d.motif_refus}</p>
                                    )}
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${statut.classe}`}>
                  {statut.texte}
                </span>
                            </div>

                            {peutAnnuler && (
                                <button
                                    onClick={() => annuler(d.id)}
                                    className="mt-3 text-sm text-slate-500 hover:text-red-600"
                                >
                                    Annuler cette demande
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}