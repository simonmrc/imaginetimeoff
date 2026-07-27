import { useEffect, useMemo, useState } from 'react'
import {
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    addMonths,
    format,
    isWeekend,
    isWithinInterval,
    parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { useJoursFeries } from '../lib/useJoursFeries'

export default function CalendrierEquipe() {
    const { profil } = useAuth()
    const { feries } = useJoursFeries()
    const [mois, setMois] = useState(startOfMonth(new Date()))
    const [demandes, setDemandes] = useState(null)
    const [collegues, setCollegues] = useState(null)
    const [erreur, setErreur] = useState(null)

    useEffect(() => {
        supabase
            .from('profiles')
            .select('id, nom')
            .then(({ data, error }) => {
                if (error) setErreur(error.message)
                else setCollegues(data)
            })
    }, [])

    useEffect(() => {
        const debutMois = format(mois, 'yyyy-MM-dd')
        const finMois = format(endOfMonth(mois), 'yyyy-MM-dd')

        supabase
            .from('demandes')
            .select('salarie_id, date_debut, date_fin')
            .eq('statut', 'approuvee')
            .lte('date_debut', finMois)
            .gte('date_fin', debutMois)
            .then(({ data, error }) => {
                if (error) setErreur(error.message)
                else setDemandes(data)
            })
    }, [mois])

    const jours = useMemo(
        () => eachDayOfInterval({ start: mois, end: endOfMonth(mois) }),
        [mois]
    )

    if (erreur) return <p className="text-red-600 p-6">{erreur}</p>
    if (!demandes || !collegues || !feries) {
        return <p className="text-slate-500 p-6">Chargement…</p>
    }

    const personnes = collegues.length > 0
        ? collegues
        : profil ? [{ id: profil.id, nom: profil.nom }] : []

    function estAbsent(personneId, jour) {
        return demandes.some(
            (d) =>
                d.salarie_id === personneId &&
                isWithinInterval(jour, {
                    start: parseISO(d.date_debut),
                    end: parseISO(d.date_fin),
                })
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={() => setMois(addMonths(mois, -1))}
                    className="text-sm text-slate-500 hover:text-slate-900 px-2"
                >
                    ←
                </button>
                <h2 className="text-lg font-semibold text-slate-900 capitalize">
                    {format(mois, 'MMMM yyyy', { locale: fr })}
                </h2>
                <button
                    onClick={() => setMois(addMonths(mois, 1))}
                    className="text-sm text-slate-500 hover:text-slate-900 px-2"
                >
                    →
                </button>
            </div>

            <table className="text-xs border-collapse">
                <thead>
                <tr>
                    <th className="text-left text-slate-500 font-normal pr-3 py-1 sticky left-0 bg-white">
                        Équipe
                    </th>
                    {jours.map((jour) => {
                        const cle = format(jour, 'yyyy-MM-dd')
                        const horsSemaine = isWeekend(jour) || feries.has(cle)
                        return (
                            <th
                                key={cle}
                                className={`w-6 text-center font-normal py-1 ${
                                    horsSemaine ? 'text-slate-300' : 'text-slate-500'
                                }`}
                            >
                                {format(jour, 'd')}
                            </th>
                        )
                    })}
                </tr>
                </thead>
                <tbody>
                {personnes.map((personne) => (
                    <tr key={personne.id}>
                        <td className="pr-3 py-1 text-slate-700 whitespace-nowrap sticky left-0 bg-white">
                            {personne.nom}
                        </td>
                        {jours.map((jour) => {
                            const cle = format(jour, 'yyyy-MM-dd')
                            const horsSemaine = isWeekend(jour) || feries.has(cle)
                            const absent = estAbsent(personne.id, jour)
                            return (
                                <td key={cle} className="p-0.5">
                                    <div
                                        className={`w-5 h-5 rounded ${
                                            absent ? 'bg-teal-500' : horsSemaine ? 'bg-slate-100' : 'bg-slate-50'
                                        }`}
                                        title={absent ? `${personne.nom} — congé` : undefined}
                                    />
                                </td>
                            )
                        })}
                    </tr>
                ))}
                </tbody>
            </table>

            <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-teal-500 inline-block" /> En congé
        </span>
                <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-100 inline-block" /> Week-end / férié
        </span>
            </div>
        </div>
    )
}