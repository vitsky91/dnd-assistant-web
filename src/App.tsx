import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useMapStore } from './stores/mapStore'
import { mapsApi } from './api/mapsApi'
import { AuthGuard } from './components/shared/AuthGuard'

import { LoginPage }      from './pages/LoginPage'
import { RegisterPage }   from './pages/RegisterPage'
import { HomePage }       from './pages/HomePage'
import { CharactersPage } from './pages/CharactersPage'
import { CampaignsPage }  from './pages/CampaignsPage'
import { MapsPage }       from './pages/MapsPage'
import { MapEditorPage }  from './pages/MapEditorPage'
import { BattlePage }     from './pages/BattlePage'

// Wrapper that loads map from ?mapId= query param
function MapEditorLoader() {
  const [params] = useSearchParams()
  const mapId = params.get('mapId')
  const { setMap, clearMap } = useMapStore()

  useEffect(() => {
    if (mapId) {
      mapsApi.get(mapId)
        .then((res) => setMap(res.data))
        .catch(console.error)
    } else {
      // No mapId → fresh editor, clear any previously loaded map
      clearMap()
    }
  }, [mapId])

  return <MapEditorPage />
}

function AppRoutes() {
  const { hydrateFromStorage } = useAuthStore()

  useEffect(() => {
    hydrateFromStorage()
  }, [])

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<AuthGuard><HomePage /></AuthGuard>} />
      <Route path="/characters" element={<AuthGuard><CharactersPage /></AuthGuard>} />
      <Route path="/campaigns"  element={<AuthGuard><CampaignsPage /></AuthGuard>} />
      <Route path="/maps"       element={<AuthGuard><MapsPage /></AuthGuard>} />

      <Route
        path="/campaigns/:campaignId/maps/editor"
        element={<AuthGuard><MapEditorLoader /></AuthGuard>}
      />
      <Route
        path="/campaigns/:campaignId/maps/:mapId/battle"
        element={<AuthGuard><BattlePage /></AuthGuard>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
