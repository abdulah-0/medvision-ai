import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../auth/LoginForm'
import { SignupForm } from '../auth/SignupForm'
import './AuthPage.css'

const FEATURES = [
    { icon: '💬', title: 'AI Medical Chat', desc: 'Intelligent symptom analysis and health information in real-time.' },
    { icon: '🧬', title: 'Image Generation', desc: 'Educational anatomical diagrams tailored to your questions.' },
    { icon: '🔒', title: 'Secure & Private', desc: 'HIPAA-compliant with end-to-end encryption on all data.' },
]

export function AuthPage() {
    const [mode, setMode] = useState('login')
    const navigate = useNavigate()

    return (
        <div className="auth-page">
            {/* ── Left Panel — Branding ── */}
            <div className="auth-left">
                <div className="auth-left-glow auth-left-glow-1" />
                <div className="auth-left-glow auth-left-glow-2" />
                <div className="auth-left-inner">
                    {/* Logo */}
                    <button className="auth-back-link" onClick={() => navigate('/')}>← Back</button>
                    <div className="auth-brand">
                        <div className="auth-brand-icon">⚕️</div>
                        <div>
                            <span className="auth-brand-name">MedVision</span>
                            <span className="auth-brand-badge">AI</span>
                        </div>
                    </div>

                    <h1 className="auth-left-title">
                        AI-Powered Diagnostics.<br />
                        <span className="auth-left-gradient">Human-Centered Care.</span>
                    </h1>
                    <p className="auth-left-sub">
                        Experience the next generation of clinical intelligence with our secure,
                        HIPAA-compliant workspace for healthcare providers.
                    </p>

                    {/* Feature list */}
                    <div className="auth-features">
                        {FEATURES.map(f => (
                            <div key={f.title} className="auth-feature-row">
                                <div className="auth-feature-icon">{f.icon}</div>
                                <div>
                                    <strong>{f.title}</strong>
                                    <span>{f.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust badge */}
                    <div className="auth-trust-row">
                        <span className="auth-trust-badge">🛡️ HIPAA Compliant</span>
                        <span className="auth-trust-badge">🔐 End-to-End Encrypted</span>
                        <span className="auth-trust-badge">✅ Clinically Informed</span>
                    </div>
                </div>
            </div>

            {/* ── Right Panel — Form ── */}
            <div className="auth-right">
                <div className="auth-right-inner">
                    {mode === 'login' ? (
                        <LoginForm onToggleMode={() => setMode('signup')} />
                    ) : (
                        <SignupForm onToggleMode={() => setMode('login')} />
                    )}
                </div>
            </div>
        </div>
    )
}
