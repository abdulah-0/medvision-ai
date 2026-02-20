import { Button } from '../common/Button'
import { DisclaimerBanner } from '../common/DisclaimerBanner'
import './LandingPage.css'

export function LandingPage({ onGetStarted }) {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-icon">⚕️</div>
                        <h1 className="hero-title">AI-Powered Medical Assistant</h1>
                        <p className="hero-subtitle">
                            Get general medical information and educational diagrams through
                            conversational AI. Your trusted companion for health awareness and learning.
                        </p>
                        <Button onClick={onGetStarted} variant="primary" size="large">
                            Start Chat →
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Key Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">💬</div>
                            <h3>AI Medical Chat</h3>
                            <p>
                                Ask questions about symptoms, conditions, and general health topics.
                                Get clear, informative responses powered by advanced AI.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🖼️</div>
                            <h3>Medical Image Generation</h3>
                            <p>
                                Visualize anatomical structures, disease mechanisms, and medical
                                concepts through AI-generated educational diagrams.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Secure & Private</h3>
                            <p>
                                Your conversations are stored securely with industry-standard
                                encryption. Your privacy is our priority.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Disclaimer Section */}
            <section className="disclaimer-section">
                <div className="container">
                    <DisclaimerBanner />
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <p>© 2024 MedVision AI. For educational purposes only.</p>
                </div>
            </footer>
        </div>
    )
}
