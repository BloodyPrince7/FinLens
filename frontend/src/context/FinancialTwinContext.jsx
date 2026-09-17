import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'finlens_financial_twin'

const DEFAULT_TWIN = {
  name: 'Rahul Sharma',
  monthlyIncome: 70833,
  monthlyExpenses: 32000,
  existingEmis: 14000,
  savings: 150000,
  investments: 0,
  creditScore: null,
  goals: '',
  riskTolerance: 'Moderate',
  employmentType: 'Salaried',
}

const FinancialTwinContext = createContext(null)

function loadTwin() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_TWIN, ...JSON.parse(raw) } : DEFAULT_TWIN
  } catch {
    return DEFAULT_TWIN
  }
}

export function FinancialTwinProvider({ children }) {
  const [twin, setTwin] = useState(loadTwin)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(twin))
    } catch {
      // localStorage unavailable (e.g. private browsing) - twin still works for this session.
    }
  }, [twin])

  function updateTwin(patch) {
    setTwin((prev) => ({ ...prev, ...patch }))
  }

  const monthlySurplus = twin.monthlyIncome - twin.monthlyExpenses - twin.existingEmis

  return (
    <FinancialTwinContext.Provider value={{ twin, updateTwin, monthlySurplus }}>
      {children}
    </FinancialTwinContext.Provider>
  )
}

export function useFinancialTwin() {
  const ctx = useContext(FinancialTwinContext)
  if (!ctx) throw new Error('useFinancialTwin must be used within FinancialTwinProvider')
  return ctx
}
