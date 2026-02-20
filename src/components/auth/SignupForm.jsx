import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../common/Button'
import './LoginForm.css'

export function SignupForm({ onToggleMode }) {
    const { signUp } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)

        // Validation
        if (!validateEmail(email)) {
            setError('Please enter a valid email address')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            await signUp(email, password)
            setSuccess(true)
        } catch (err) {
            setError(err.message || 'Failed to create account. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-form">
                <div className="success-message">
                    <h2>✓ Account Created!</h2>
                    <p>Please check your email to verify your account before signing in.</p>
                    <Button onClick={onToggleMode} variant="primary">
                        Go to Sign In
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-form">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Get started with MedVision AI</p>

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
                        placeholder="At least 6 characters"
                        required
                        autoComplete="new-password"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        autoComplete="new-password"
                    />
                </div>

                <Button type="submit" variant="primary" size="large" loading={loading} className="auth-submit-btn">
                    Create Account
                </Button>
            </form>

            <p className="auth-toggle">
                Already have an account?{' '}
                <button type="button" onClick={onToggleMode} className="auth-toggle-btn">
                    Sign In
                </button>
            </p>
        </div>
    )
}
