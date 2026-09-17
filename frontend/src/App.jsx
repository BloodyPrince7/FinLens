import { useState } from 'react'
import { Navigate, Outlet, Route, BrowserRouter, Routes, useOutletContext } from 'react-router-dom'
import Header from './components/Header'
import { FinancialTwinProvider } from './context/FinancialTwinContext'
import Assistant from './pages/Assistant'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import FinancialTwin from './pages/FinancialTwin'
import HealthScore from './pages/HealthScore'
import Insights from './pages/Insights'
import Login from './pages/Login'
import Products from './pages/Products'
import Settings from './pages/Settings'
import Simulator from './pages/Simulator'
import Transactions from './pages/Transactions'

const STORAGE_KEY = 'finlens_user'

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Every page reads { user, language } via this hook instead of props drilling. */
export function usePageContext() {
  return useOutletContext()
}

function AppLayout({ user, language, setLanguage, onLogout }) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-beige">
      <Header language={language} onLanguageChange={setLanguage} onLogout={onLogout} />
      <Outlet context={{ user, language }} />
    </div>
  )
}

function App() {
  const [user, setUser] = useState(loadStoredUser)
  const [language, setLanguage] = useState('en')

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
    <FinancialTwinProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
          />
          {user ? (
            <Route
              element={
                <AppLayout user={user} language={language} setLanguage={setLanguage} onLogout={handleLogout} />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/financial-twin" element={<FinancialTwin />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/health-score" element={<HealthScore />} />
              <Route path="/products" element={<Products />} />
              <Route path="/simulator" element={<Simulator />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </BrowserRouter>
    </FinancialTwinProvider>
  )
}

export default App
