import { useState, useRef, useEffect, useCallback } from 'react'
import './ChatInput.css'

const MAX_LENGTH = 2000
const MIN_LENGTH = 3
const RATE_LIMIT_MS = 3000 // 3 seconds between sends

// Returns a validation error string or null if valid
function validate(message, lastSent, lastSentAt) {
    const trimmed = message.trim()

    if (trimmed.length < MIN_LENGTH) {
        return `Message must be at least ${MIN_LENGTH} characters.`
    }
    if (!/[a-zA-Z0-9]/.test(trimmed)) {
        return 'Please enter a meaningful message (letters or numbers required).'
    }
    if (trimmed === lastSent) {
        return 'You already sent that message. Please ask something different.'
    }
    if (lastSentAt && Date.now() - lastSentAt < RATE_LIMIT_MS) {
        const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSentAt)) / 1000)
        return `Please wait ${wait}s before sending another message.`
    }
    return null
}

export function ChatInput({ onSendMessage, disabled = false }) {
    const [message, setMessage] = useState('')
    const [validationError, setValidationError] = useState(null)
    const [lastSent, setLastSent] = useState('')
    const [lastSentAt, setLastSentAt] = useState(null)
    const textareaRef = useRef(null)
    const errorTimerRef = useRef(null)

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
        }
    }, [message])

    // Clear validation error when message changes
    useEffect(() => {
        if (validationError) setValidationError(null)
    }, [message])

    // Cleanup timer on unmount
    useEffect(() => () => clearTimeout(errorTimerRef.current), [])

    const showError = useCallback((msg) => {
        setValidationError(msg)
        clearTimeout(errorTimerRef.current)
        errorTimerRef.current = setTimeout(() => setValidationError(null), 4000)
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (disabled) return

        const error = validate(message, lastSent, lastSentAt)
        if (error) {
            showError(error)
            textareaRef.current?.focus()
            return
        }

        const trimmed = message.trim()
        setLastSent(trimmed)
        setLastSentAt(Date.now())
        onSendMessage(trimmed)
        setMessage('')
        setValidationError(null)
        if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const remaining = MAX_LENGTH - message.length
    const isOverLimit = remaining < 0
    const isNearLimit = remaining < 200

    return (
        <form className="chat-input-container" onSubmit={handleSubmit}>
            {/* Validation error banner */}
            {validationError && (
                <div className="chat-validation-error" role="alert">
                    <span className="chat-validation-icon">⚠️</span>
                    {validationError}
                </div>
            )}

            <div className={`chat-input-wrapper ${validationError ? 'chat-input-wrapper--error' : ''}`}>
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a medical question… (Enter to send, Shift+Enter for new line)"
                    disabled={disabled}
                    rows={1}
                    className="chat-input"
                    aria-invalid={!!validationError}
                    aria-describedby={validationError ? 'chat-validation-msg' : undefined}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={disabled || !message.trim() || isOverLimit}
                    aria-label="Send message"
                >
                    ➤
                </button>
            </div>

            <div className="chat-input-footer">
                <span className="input-hint">Enter ↵ to send · Shift+Enter for new line</span>
                {isNearLimit && (
                    <span className={`char-counter ${remaining < 100 ? 'char-counter-warning' : ''} ${isOverLimit ? 'char-counter-error' : ''}`}>
                        {remaining < 0 ? `${Math.abs(remaining)} over limit` : `${remaining} left`}
                    </span>
                )}
            </div>
        </form>
    )
}
