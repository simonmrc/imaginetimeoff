import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function RouteProtegee({ children, rolesAutorises }) {
    const { session, profil } = useAuth()

    if (!session) {
        return <Navigate to="/connexion" replace />
    }

    if (rolesAutorises && !rolesAutorises.includes(profil?.role)) {
        return <p className="text-slate-500 p-6">Tu n'as pas accès à cette page.</p>
    }

    return children
}