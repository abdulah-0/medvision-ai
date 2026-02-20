import './TypingIndicator.css'

export function TypingIndicator() {
    return (
        <div className="typing-indicator">
            <div className="typing-avatar">⚕️</div>
            <div className="typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
            </div>
        </div>
    )
}
