import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const ROLES = ['salarie', 'manager', 'rh']

export default function AdminRH() {
    const [profils, setProfils] = useState(null)
    const [modifs, setModifs] = useState({})
    const [enregistrementEnCours, setEnregistrementEnCours] = useState({})
    const [erreur, setErreur] = useState(null)

    useEffect(() => {
        chargerProfils()
    }, [])

    async function chargerProfils() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('nom', { ascending: true })

        if (error) {
            setErreur(error.message)
            return
        }
        setProfils(data)

        const brouillon = {}
        data.forEach((p) => {
            brouillon[p.id] = {
                role: p.role,
                manager_id: p.manager_id ?? '',
                solde_conges: p.solde_conges,
            }
        })
        setModifs(brouillon)
    }

    function changerChamp(id, champ, valeur) {
        setModifs((precedent) => ({
            ...precedent,
            [id]: { ...precedent[id], [champ]: valeur },
        }))
    }

    async function enregistrer(id) {
        setErreur(null)
        setEnregistrementEnCours((p) => ({ ...p, [id]: true }))

        const v = modifs[id]

        const { error } = await supabase
            .from('profiles')
            .update({
                role: v.role,
                manager_id: v.manager_id || null,
                solde_conges: Number(v.solde_conges),
            })
            .eq('id', id)

        setEnregistrementEnCours((p) => ({ ...p, [id]: false }))

        if (error) {
            setErreur(error.message)
            return
        }
        chargerProfils()
    }

    if (erreur) return <p className="text-red-600 p-6">{erreur}</p>
    if (!profils) return <p className="text-slate-500 p-6">Chargement…</p>

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-slate-900">Gestion de l'équipe</h2>
            <p className="text-sm text-slate-500 mt-1">
                {profils.length} personne{profils.length > 1 ? 's' : ''}
            </p>

            <table className="w-full text-sm mt-4 border-collapse">
                <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-3 font-normal">Nom</th>
                    <th className="py-2 pr-3 font-normal">Rôle</th>
                    <th className="py-2 pr-3 font-normal">Manager</th>
                    <th className="py-2 pr-3 font-normal">Solde</th>
                    <th className="py-2 font-normal"></th>
                </tr>
                </thead>
                <tbody>
                {profils.map((p) => {
                    const v = modifs[p.id] ?? {}
                    return (
                        <tr key={p.id} className="border-b border-slate-100">
                            <td className="py-2 pr-3">
                                <div className="text-slate-900">{p.nom}</div>
                                <div className="text-slate-400 text-xs">{p.email}</div>
                            </td>
                            <td className="py-2 pr-3">
                                <select
                                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                                    value={v.role}
                                    onChange={(e) => changerChamp(p.id, 'role', e.target.value)}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="py-2 pr-3">
                                <select
                                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                                    value={v.manager_id}
                                    onChange={(e) => changerChamp(p.id, 'manager_id', e.target.value)}
                                >
                                    <option value="">Aucun</option>
                                    {profils
                                        .filter((autre) => autre.id !== p.id)
                                        .map((autre) => (
                                            <option key={autre.id} value={autre.id}>
                                                {autre.nom}
                                            </option>
                                        ))}
                                </select>
                            </td>
                            <td className="py-2 pr-3">
                                <input
                                    type="number"
                                    step="0.5"
                                    className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                                    value={v.solde_conges}
                                    onChange={(e) => changerChamp(p.id, 'solde_conges', e.target.value)}
                                />
                            </td>
                            <td className="py-2">
                                <button
                                    onClick={() => enregistrer(p.id)}
                                    disabled={enregistrementEnCours[p.id]}
                                    className="text-sm bg-slate-900 text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
                                >
                                    {enregistrementEnCours[p.id] ? '…' : 'Enregistrer'}
                                </button>
                            </td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}