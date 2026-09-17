import { useState } from 'react'
import { Navigate, Route, BrowserRouter, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

const STORAGE_KEY = 'sahayak_user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function App() {
  const [user, setUser] = useState(loadStoredUser)

  function handleLogin(loggedInUser) {
    setUser(loggedInUser)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser))
    } catch {
      // localStorage may be unavailable (e.g. private browsing) - login still works for this session.
    }
  }

  function handleLogout() {
    setUser(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
