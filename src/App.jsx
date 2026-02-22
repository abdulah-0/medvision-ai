import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LandingPage } from './components/pages/LandingPage'
import { AuthPage } from './components/pages/AuthPage'
import { Dashboard } from './components/pages/Dashboard'
import { Loader } from './components/common/Loader'
import { warmUpServer } from './services/api'
import './styles/globals.css'

// Kick the Render backend awake the instant the app loads
warmUpServer()

// Protected Route Component
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <Loader size="large" text="Loading..." />
    }

    return user ? children : <Navigate to="/auth" replace />
}

// Public Route Component (redirect to dashboard if logged in)
function PublicRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <Loader size="large" text="Loading..." />
    }

    return !user ? children : <Navigate to="/dashboard" replace />
}

function AppRoutes() {
    const [showLanding, setShowLanding] = useState(true)
    const { user } = useAuth()

    // If user is logged in, skip landing page
    if (user) {
        return (
            <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        )
    }

    return (
        <Routes>
            <Route
                path="/"
                element={
                    showLanding ? (
                        <LandingPage onGetStarted={() => setShowLanding(false)} />
                    ) : (
                        <Navigate to="/auth" replace />
                    )
                }
            />
            <Route
                path="/auth"
                element={
                    <PublicRoute>
                        <AuthPage />
                    </PublicRoute>
                }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App
