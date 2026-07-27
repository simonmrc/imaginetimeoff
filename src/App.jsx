import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import Connexion from './pages/Connexion'
import NouvelleDemande from './pages/NouvelleDemande'
import MesDemandes from './pages/MesDemandes'
import EquipeManager from './pages/EquipeManager'
import Nav from './components/Nav'
import RouteProtegee from './components/RouteProtegee'
import CalendrierEquipe from './pages/CalendrierEquipe'
import AdminRH from './pages/AdminRH'

export default function App() {
  const { session, chargement } = useAuth()

  if (chargement) return <div className="p-8 text-slate-500">Chargement…</div>

  return (
      <div className="min-h-screen bg-slate-50">
        {session && <Nav />}

        <div className="max-w-2xl mx-auto p-8">
          <Routes>
            <Route
                path="/connexion"
                element={session ? <Navigate to="/" replace /> : <Connexion />}
            />
            <Route
                path="/"
                element={
                  <RouteProtegee>
                    <NouvelleDemande />
                  </RouteProtegee>
                }
            />
            <Route
                path="/mes-demandes"
                element={
                  <RouteProtegee>
                    <MesDemandes />
                  </RouteProtegee>
                }
            />
            <Route
                path="/equipe"
                element={
                  <RouteProtegee rolesAutorises={['manager', 'rh']}>
                    <EquipeManager />
                  </RouteProtegee>
                }
            />
              <Route
                  path="/calendrier"
                  element={
                      <RouteProtegee>
                          <CalendrierEquipe />
                      </RouteProtegee>
                  }
            />
              <Route
                  path="/admin"
                  element={
                      <RouteProtegee rolesAutorises={['rh']}>
                          <AdminRH />
                      </RouteProtegee>
                  }
            />
          </Routes>
        </div>
      </div>
  )
}