import { useState, useMemo } from 'react'
import { useAuth } from '../lib/AuthContext'
import { useJoursFeries } from '../lib/useJoursFeries'
import { compterJoursOuvres } from '../lib/joursOuvres'
import { supabase } from '../lib/supabase'

export default function NouvelleDemande() {
    const { profil } = useAuth()
    const { feries, erreur: erreurFeries } = useJoursFeries()

    const [dateDebut, setDateDebut] = useState('')
    const [dateFin, setDateFin] = useState('')
    const [demiJourDebut, setDemiJourDebut] = useState(false)
    const [demiJourFin, setDemiJourFin] = useState(false)
    const [motif, setMotif] = useState('')
    const [envoiEnCours, setEnvoiEnCours] = useState(false)
    const [erreur, setErreur] = useState(null)
    const [succes, setSucces] = useState(false)

    const nbJours = useMemo(() => {
        if (!feries || !dateDebut || !dateFin) return null
        if (dateFin < dateDebut) return null
        return compterJoursOuvres(dateDebut, dateFin, feries, {
            demiJourDebut,
            demiJourFin,
        })
    }, [feries, dateDebut, dateFin, demiJourDebut, demiJourFin])

    async function envoyerDemande() {
        setErreur(null)
        setSucces(false)

        if (nbJours === null || nbJours <= 0) {
            setErreur('Sélectionne des dates valides avant d\'envoyer.')
            return
        }
        if (nbJours > profil.solde_conges) {
            setErreur(`Solde insuffisant : il te reste ${profil.solde_conges} jours.`)
            return
        }

        setEnvoiEnCours(true)

        const { error } = await supabase.from('demandes').insert({
            salarie_id: profil.id,
            date_debut: dateDebut,
            date_fin: dateFin,
            demi_jour_debut: demiJourDebut,
            demi_jour_fin: demiJourFin,
            nb_jours: nbJours,
            motif_salarie: motif || null,
            statut: 'en_attente',
        })

        setEnvoiEnCours(false)

        if (error) {
            setErreur(error.message)
            return
        }

        setSucces(true)
        setDateDebut('')
        setDateFin('')
        setDemiJourDebut(false)
        setDemiJourFin(false)
        setMotif('')
    }
    if (!profil) return <p className="text-slate-500 p-6">Chargement du profil…</p>
    if (erreurFeries) {
        return <p className="text-red-600 p-6">Erreur de chargement des jours fériés : {erreurFeries}</p>
    }

    if (!feries) {
        return <p className="text-slate-500 p-6">Chargement…</p>
    }

    return (
        <div className="max-w-md bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">Nouvelle demande</h2>
            <p className="text-sm text-slate-500 mt-1">
                Solde disponible : {profil.solde_conges} jours
            </p>

            <div className="mt-5 space-y-4">
                <div>
                    <label className="block text-sm text-slate-700 mb-1">Date de début</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                    />
                    <label className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={demiJourDebut}
                            onChange={(e) => setDemiJourDebut(e.target.checked)}
                        />
                        Départ l'après-midi seulement
                    </label>
                </div>

                <div>
                    <label className="block text-sm text-slate-700 mb-1">Date de fin</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                    />
                    <label className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                        <input
                            type="checkbox"
                            checked={demiJourFin}
                            onChange={(e) => setDemiJourFin(e.target.checked)}
                        />
                        Retour le matin seulement
                    </label>
                </div>

                <div>
                    <label className="block text-sm text-slate-700 mb-1">Motif (facultatif)</label>
                    <textarea
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        rows={2}
                        value={motif}
                        onChange={(e) => setMotif(e.target.value)}
                    />
                </div>

                <div className="bg-slate-50 rounded-lg px-4 py-3 text-sm">
                    {nbJours === null ? (
                        <span className="text-slate-400">Sélectionne des dates</span>
                    ) : (
                        <span className="text-slate-900 font-medium">
              {nbJours} jour{nbJours > 1 ? 's' : ''} ouvré{nbJours > 1 ? 's' : ''}
            </span>
                    )}
                </div>

                {erreur && <p className="text-sm text-red-600">{erreur}</p>}
                {succes && <p className="text-sm text-green-600">Demande envoyée avec succès.</p>}

                <button
                    onClick={envoyerDemande}
                    disabled={envoiEnCours}
                    className="w-full rounded-lg bg-slate-900 text-white text-sm font-medium py-2.5 disabled:opacity-50"
                >
                    {envoiEnCours ? 'Envoi…' : 'Envoyer la demande'}
                </button>
            </div>
        </div>
    )
}