import { useState } from 'react'
import './DisclaimerBanner.css'

export function DisclaimerBanner() {
    const [dismissed, setDismissed] = useState(false)

    if (dismissed) return null

    return (
        <div className="disclaimer-banner">
            <div className="disclaimer-icon">⚕️</div>
            <div className="disclaimer-content">
                <h4>Medical Disclaimer</h4>
                <p>
                    This AI provides general medical information only and is not a substitute
                    for professional medical advice, diagnosis, or treatment. Always seek the
                    advice of your physician or other qualified health provider.
                </p>
            </div>
            <button
                className="disclaimer-close"
                onClick={() => setDismissed(true)}
                aria-label="Dismiss disclaimer"
            >
                ✕
            </button>
        </div>
    )
}
