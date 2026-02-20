import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../common/Button'
import './LoginForm.css'

export function LoginForm({ onToggleMode }) {
    const { signIn } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            await signIn(email, password)
        } catch (err) {
            setError(err.message || 'Failed to sign in. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-form">
            <div className="auth-logo">
                <div className="auth-logo-icon">⚕️</div>
                <span className="auth-logo-text">MedVision AI</span>
            </div>
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Please enter your credentials to access your secure clinical dashboard.</p>

            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                    />
                </div>

                <Button type="submit" variant="primary" size="large" loading={loading} className="auth-submit-btn">
                    Sign In
                </Button>
            </form>

            <p className="auth-toggle">
                Don't have an account?{' '}
                <button type="button" onClick={onToggleMode} className="auth-toggle-btn">
                    Sign Up
                </button>
            </p>
        </div>
    )
}
