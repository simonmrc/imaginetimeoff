import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function EquipeManager() {
    const [demandes, setDemandes] = useState(null)
    const [erreur, setErreur] = useState(null)
    const [motifRefus, setMotifRefus] = useState({})

    useEffect(() => {
        chargerDemandes()
    }, [])

    async function chargerDemandes() {
        const { data, error } = await supabase
            .from('demandes')
            .select('*, profiles!demandes_salarie_id_fkey(nom)')
            .eq('statut', 'en_attente')
            .order('date_debut', { ascending: true })

        if (error) {
            setErreur(error.message)
            return
        }
        setDemandes(data)
    }

    async function approuver(id) {
        const { error } = await supabase
            .from('demandes')
            .update({
                statut: 'approuvee',
                valide_le: new Date().toISOString(),
            })
            .eq('id', id)

        if (error) {
            setErreur(error.message)
            return
        }
        chargerDemandes()
    }

    async function refuser(id) {
        const motif = motifRefus[id]
        if (!motif) {
            setErreur('Indique un motif de refus.')
            return
        }

        const { error } = await supabase
            .from('demandes')
            .update({
                statut: 'refusee',
                motif_refus: motif,
                valide_le: new Date().toISOString(),
            })
            .eq('id', id)

        if (error) {
            setErreur(error.message)
            return
        }
        chargerDemandes()
    }

    if (erreur) return <p className="text-red-600 p-6">{erreur}</p>
    if (!demandes) return <p className="text-slate-500 p-6">Chargement…</p>

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Demandes en attente</h2>

            {demandes.length === 0 && (
                <p className="text-sm text-slate-500 mt-3">Aucune demande en attente.</p>
            )}

            <div className="mt-4 space-y-4">
                {demandes.map((d) => (
                    <div key={d.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-slate-900">{d.profiles.nom}</p>
                                <p className="text-sm text-slate-600">
                                    Du {d.date_debut} au {d.date_fin} — {d.nb_jours} jour{d.nb_jours > 1 ? 's' : ''}
                                </p>
                                {d.motif_salarie && (
                                    <p className="text-sm text-slate-500 mt-1">{d.motif_salarie}</p>
                                )}
                            </div>
                            <button
                                onClick={() => approuver(d.id)}
                                className="text-sm bg-green-600 text-white rounded-lg px-3 py-1.5"
                            >
                                Approuver
                            </button>
                        </div>

                        <div className="flex gap-2 mt-3">
                            <input
                                type="text"
                                placeholder="Motif de refus"
                                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
                                value={motifRefus[d.id] ?? ''}
                                onChange={(e) =>
                                    setMotifRefus({ ...motifRefus, [d.id]: e.target.value })
                                }
                            />
                            <button
                                onClick={() => refuser(d.id)}
                                className="text-sm bg-red-600 text-white rounded-lg px-3 py-1.5"
                            >
                                Refuser
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}