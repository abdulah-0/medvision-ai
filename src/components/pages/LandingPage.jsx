import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

export function LandingPage({ onGetStarted }) {
    const navigate = useNavigate()

    const handleGetStarted = () => {
        if (onGetStarted) onGetStarted()
        navigate('/auth')
    }

    return (
        <div className="lp">
            {/* ── Navbar ── */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-logo">
                        <div className="lp-logo-icon">⚕️</div>
                        <span className="lp-logo-text">MedVision</span>
                        <span className="lp-logo-badge">AI</span>
                    </div>
                    <div className="lp-nav-links">
                        <a href="#features">Features</a>
                        <a href="#privacy">Privacy</a>
                        <a href="#cta">Pricing</a>
                    </div>
                    <div className="lp-nav-actions">
                        <button className="lp-btn-ghost" onClick={handleGetStarted}>Sign in</button>
                        <button className="lp-btn-primary" onClick={handleGetStarted}>Get Started Free</button>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="lp-hero">
                <div className="lp-hero-glow lp-hero-glow-1" />
                <div className="lp-hero-glow lp-hero-glow-2" />
                <div className="lp-hero-glow lp-hero-glow-3" />
                <div className="lp-container">
                    <div className="lp-hero-badge">
                        <span className="lp-badge-dot" />
                        AI-Powered Healthcare Platform
                    </div>
                    <h1 className="lp-hero-title">
                        Instant Medical Insights<br />
                        Powered by <span className="lp-hero-gradient">Advanced AI.</span>
                    </h1>
                    <p className="lp-hero-sub">
                        Bridge the gap between symptoms and understanding with MedVision AI.
                        Secure, private, and clinically-informed tools for patients and providers.
                    </p>
                    <div className="lp-hero-actions">
                        <button className="lp-btn-primary lp-btn-lg" onClick={handleGetStarted}>
                            Start for Free →
                        </button>
                        <button className="lp-btn-outline lp-btn-lg">
                            Watch Demo ▶
                        </button>
                    </div>
                    <div className="lp-hero-stats">
                        <div className="lp-stat">
                            <span className="lp-stat-num">50K+</span>
                            <span className="lp-stat-label">Users</span>
                        </div>
                        <div className="lp-stat-divider" />
                        <div className="lp-stat">
                            <span className="lp-stat-num">98%</span>
                            <span className="lp-stat-label">Accuracy</span>
                        </div>
                        <div className="lp-stat-divider" />
                        <div className="lp-stat">
                            <span className="lp-stat-num">24/7</span>
                            <span className="lp-stat-label">Available</span>
                        </div>
                    </div>
                </div>

                {/* Floating chat preview card */}
                <div className="lp-chat-preview">
                    <div className="lp-chat-card">
                        <div className="lp-chat-header-row">
                            <div className="lp-chat-avatar">⚕️</div>
                            <div>
                                <div className="lp-chat-name">MedVision AI</div>
                                <div className="lp-chat-online"><span className="lp-online-dot" />Online</div>
                            </div>
                        </div>
                        <div className="lp-chat-bubble lp-bubble-ai">
                            What symptoms are you experiencing today? I can help you understand what they might mean.
                        </div>
                        <div className="lp-chat-bubble lp-bubble-user">
                            I have a persistent headache for 3 days along with mild fever…
                        </div>
                        <div className="lp-chat-bubble lp-bubble-ai lp-typing">
                            <span /><span /><span />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="lp-features" id="features">
                <div className="lp-container">
                    <div className="lp-section-label">Advanced Healthcare Solutions</div>
                    <h2 className="lp-section-title">
                        Empowering patients and providers with<br />
                        AI-driven medical tools.
                    </h2>
                    <p className="lp-section-sub">
                        Accurate, private, and trusted by thousands of healthcare professionals worldwide.
                    </p>
                    <div className="lp-features-grid">
                        <div className="lp-feature-card lp-feature-card-primary">
                            <div className="lp-feature-icon">💬</div>
                            <h3>AI Medical Chat</h3>
                            <p>Natural language processing for intelligent symptom checking and health information retrieval in real-time.</p>
                            <button className="lp-feature-link" onClick={handleGetStarted}>Try it now →</button>
                        </div>
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon">🧬</div>
                            <h3>Image Generation</h3>
                            <p>Visual aids for anatomical explanations and educational medical diagrams tailored to specific patient needs.</p>
                            <button className="lp-feature-link" onClick={handleGetStarted}>Learn more →</button>
                        </div>
                        <div className="lp-feature-card">
                            <div className="lp-feature-icon">🔒</div>
                            <h3>Secure &amp; Private</h3>
                            <p>HIPAA-compliant standards and end-to-end encryption to ensure your sensitive medical data remains yours.</p>
                            <button className="lp-feature-link" onClick={handleGetStarted}>Learn more →</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Trust strip ── */}
            <section className="lp-trust" id="privacy">
                <div className="lp-container">
                    <div className="lp-trust-grid">
                        <div className="lp-trust-item">
                            <span className="lp-trust-icon">🛡️</span>
                            <div>
                                <strong>HIPAA Compliant</strong>
                                <span>Enterprise-grade security</span>
                            </div>
                        </div>
                        <div className="lp-trust-item">
                            <span className="lp-trust-icon">🔐</span>
                            <div>
                                <strong>End-to-End Encrypted</strong>
                                <span>Zero-knowledge storage</span>
                            </div>
                        </div>
                        <div className="lp-trust-item">
                            <span className="lp-trust-icon">✅</span>
                            <div>
                                <strong>Clinically Informed</strong>
                                <span>Medical-grade AI corpus</span>
                            </div>
                        </div>
                        <div className="lp-trust-item">
                            <span className="lp-trust-icon">⚡</span>
                            <div>
                                <strong>Real-Time Responses</strong>
                                <span>Under 2 seconds average</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Disclaimer ── */}
            <section className="lp-disclaimer-section">
                <div className="lp-container">
                    <div className="lp-disclaimer-card">
                        <span className="lp-disclaimer-icon">⚠️</span>
                        <p><strong>Important Medical Disclaimer:</strong> MedVision AI is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.</p>
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="lp-cta" id="cta">
                <div className="lp-cta-glow" />
                <div className="lp-container">
                    <div className="lp-cta-inner">
                        <div className="lp-section-label lp-label-light">Experience the Future of Health Tech</div>
                        <h2 className="lp-cta-title">Join 50,000+ medical professionals<br />using MedVision AI</h2>
                        <p className="lp-cta-sub">No credit card required &bull; 14-day free trial &bull; Cancel anytime</p>
                        <button className="lp-btn-white lp-btn-lg" onClick={handleGetStarted}>
                            Get Started Free →
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="lp-footer">
                <div className="lp-container">
                    <div className="lp-footer-top">
                        <div className="lp-footer-brand">
                            <div className="lp-logo">
                                <div className="lp-logo-icon">⚕️</div>
                                <span className="lp-logo-text">MedVision</span>
                                <span className="lp-logo-badge">AI</span>
                            </div>
                            <p>Bridging symptoms and clinical understanding with the world's most advanced medical AI.</p>
                        </div>
                        <div className="lp-footer-cols">
                            <div className="lp-footer-col">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <button onClick={handleGetStarted}>Medical Chat</button>
                                <a href="#cta">Pricing</a>
                                <a href="#">API</a>
                            </div>
                            <div className="lp-footer-col">
                                <h4>Legal</h4>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">HIPAA Policy</a>
                                <a href="#">Cookie Settings</a>
                            </div>
                        </div>
                    </div>
                    <div className="lp-footer-bottom">
                        <span>© 2025 MedVision AI. For educational & informational purposes only.</span>
                        <div className="lp-footer-links">
                            <a href="#">Privacy</a>
                            <a href="#">Terms</a>
                            <a href="#">Contact Security</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
