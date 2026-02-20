import './MessageBubble.css'

export function MessageBubble({ role, content, imageUrl, timestamp }) {
    const isUser = role === 'user'

    const formatTime = (ts) => {
        if (!ts) return ''
        return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className={`message-bubble ${isUser ? 'message-user' : 'message-assistant'}`}>
            <div className="message-row">
                <div className="message-avatar">
                    {isUser ? '👤' : '⚕️'}
                </div>
                <div>
                    <div className="message-content">
                        <p>{content}</p>
                        {imageUrl && (
                            <div className="message-image-container">
                                <img src={imageUrl} alt="Medical diagram" className="message-image" />
                            </div>
                        )}
                    </div>
                    {!isUser && (
                        <div className="message-verified">
                            <span className="message-verified-icon">✓</span>
                            MedVision AI · Clinical Assistant
                        </div>
                    )}
                </div>
            </div>
            <span className="message-timestamp">{formatTime(timestamp)}</span>
        </div>
    )
}
