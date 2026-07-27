import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Nav() {
    const { profil } = useAuth()

    const lienClasse = ({ isActive }) =>
        `text-sm px-3 py-2 rounded-lg ${
            isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
        }`

    return (
        <nav className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between">
            <div className="flex gap-1">
                <NavLink to="/" end className={lienClasse}>
                    Nouvelle demande
                </NavLink>
                <NavLink to="/mes-demandes" className={lienClasse}>
                    Mes demandes
                </NavLink>
                <NavLink to="/calendrier" className={lienClasse}>
                    Calendrier équipe
                </NavLink>
                {(profil?.role === 'manager' || profil?.role === 'rh') && (
                    <NavLink to="/equipe" className={lienClasse}>
                        Équipe
                    </NavLink>

                )}
            </div>

            {profil?.role === 'rh' && (
                <NavLink to="/admin" className={lienClasse}>
                    Administration
                </NavLink>
            )}
            <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-slate-500 hover:text-slate-900"
            >
                Se déconnecter ({profil?.nom})
            </button>
        </nav>
    )
}