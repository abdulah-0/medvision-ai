import { useState, useRef, useEffect } from 'react'
import './ChatInput.css'

export function ChatInput({ onSendMessage, disabled = false }) {
    const [message, setMessage] = useState('')
    const textareaRef = useRef(null)
    const maxLength = 2000

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [message])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (message.trim() && !disabled) {
            onSendMessage(message)
            setMessage('')
            // Reset height
            if (textareaRef.current) textareaRef.current.style.height = 'auto'
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const remainingChars = maxLength - message.length

    return (
        <form className="chat-input-container" onSubmit={handleSubmit}>
            <div className="chat-input-wrapper">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a medical question… (Enter to send, Shift+Enter for new line)"
                    disabled={disabled}
                    maxLength={maxLength}
                    rows={1}
                    className="chat-input"
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={disabled || !message.trim()}
                    aria-label="Send message"
                >
                    ➤
                </button>
            </div>
            <div className="chat-input-footer">
                <span className="input-hint">Enter ↵ to send · Shift+Enter for new line</span>
                {remainingChars < 200 && (
                    <span className={`char-counter ${remainingChars < 100 ? 'char-counter-warning' : ''}`}>
                        {remainingChars}
                    </span>
                )}
            </div>
        </form>
    )
}
