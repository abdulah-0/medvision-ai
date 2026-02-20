import { useState } from 'react'
import { LoginForm } from '../auth/LoginForm'
import { SignupForm } from '../auth/SignupForm'
import './AuthPage.css'

export function AuthPage() {
    const [mode, setMode] = useState('login') // 'login' or 'signup'

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <div className="auth-logo">⚕️</div>
                    <h1>MedVision AI</h1>
                </div>

                {mode === 'login' ? (
                    <LoginForm onToggleMode={() => setMode('signup')} />
                ) : (
                    <SignupForm onToggleMode={() => setMode('login')} />
                )}
            </div>
        </div>
    )
}
