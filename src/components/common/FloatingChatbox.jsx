import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { sendChatMessage } from '../../services/api'
import './FloatingChatbox.css'

const WELCOME_MSG = {
    id: 'welcome',
    role: 'assistant',
    content: 'Welcome to MedVision AI 👋 How are you feeling today?'
}

const MAX_LENGTH = 1000
const MIN_LENGTH = 3
const RATE_LIMIT_MS = 3000

function validateInput(message, lastSent, lastSentAt) {
    const trimmed = message.trim()
    if (trimmed.length < MIN_LENGTH)
        return `Message must be at least ${MIN_LENGTH} characters.`
    if (!/[a-zA-Z0-9]/.test(trimmed))
        return 'Please enter a meaningful message (letters or numbers required).'
    if (trimmed === lastSent)
        return 'You already sent that. Please ask something different.'
    if (lastSentAt && Date.now() - lastSentAt < RATE_LIMIT_MS) {
        const wait = Math.ceil((RATE_LIMIT_MS - (Date.now() - lastSentAt)) / 1000)
        return `Please wait ${wait}s before sending again.`
    }
    return null
}

function friendlyError(err) {
    const msg = err?.message || ''
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError'))
        return 'Network error — please check your connection.'
    return 'Something went wrong. Please try again.'
}

export function FloatingChatbox() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([WELCOME_MSG])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [aiError, setAiError] = useState(null)
    const [validationError, setValidationError] = useState(null)
    const [lastSent, setLastSent] = useState('')
    const [lastSentAt, setLastSentAt] = useState(null)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const historyRef = useRef([])
    const validationTimerRef = useRef(null)

    useEffect(() => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, open])

    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 350)
        }
    }, [open])

    // Clear validation on input change
    useEffect(() => {
        if (validationError) setValidationError(null)
    }, [input])

    useEffect(() => () => clearTimeout(validationTimerRef.current), [])

    const showValidationError = useCallback((msg) => {
        setValidationError(msg)
        clearTimeout(validationTimerRef.current)
        validationTimerRef.current = setTimeout(() => setValidationError(null), 4000)
    }, [])

    const sendMessage = useCallback(async (content) => {
        if (loading) return

        setLoading(true)
        setAiError(null)

        const userMsg = { id: `u-${Date.now()}`, role: 'user', content }
        setMessages(prev => [...prev, userMsg])
        setLastSent(content)
        setLastSentAt(Date.now())

        try {
            const result = await sendChatMessage(content, historyRef.current, null)
            const aiMsg = { id: `a-${Date.now()}`, role: 'assistant', content: result.message }
            historyRef.current = [
                ...historyRef.current,
                { role: 'user', content },
                { role: 'assistant', content: result.message }
            ]
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            setAiError(friendlyError(err))
        } finally {
            setLoading(false)
        }
    }, [loading])

    const handleSubmit = (e) => {
        e.preventDefault()
        const validationErr = validateInput(input, lastSent, lastSentAt)
        if (validationErr) {
            showValidationError(validationErr)
            inputRef.current?.focus()
            return
        }
        const trimmed = input.trim()
        setInput('')
        if (inputRef.current) {
            inputRef.current.style.height = 'auto'
        }
        sendMessage(trimmed)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleInputChange = (e) => {
        // Enforce max length
        if (e.target.value.length > MAX_LENGTH) return
        setInput(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
    }

    const remaining = MAX_LENGTH - input.length
    const isNearLimit = remaining < 150

    const widget = (
        <div className="fcb-root">
            {/* Chat panel */}
            <div
                className={`fcb-panel ${open ? 'fcb-panel--open' : ''}`}
                role="dialog"
                aria-label="MedVision AI Chat"
                aria-hidden={!open}
            >
                {/* Header */}
                <div className="fcb-header">
                    <div className="fcb-header-info">
                        <div className="fcb-avatar">⚕️</div>
                        <div>
                            <div className="fcb-name">MedVision AI</div>
                            <div className="fcb-status">
                                <span className="fcb-online-dot" />
                                Online 24/7
                            </div>
                        </div>
                    </div>
                    <button className="fcb-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className="fcb-messages">
                    {messages.map(msg => (
                        <div key={msg.id} className={`fcb-bubble ${msg.role === 'user' ? 'fcb-bubble--user' : 'fcb-bubble--ai'}`}>
                            {msg.role === 'assistant' && <span className="fcb-bubble-icon">⚕️</span>}
                            <span className="fcb-bubble-text">{msg.content}</span>
                        </div>
                    ))}

                    {loading && (
                        <div className="fcb-bubble fcb-bubble--ai">
                            <span className="fcb-bubble-icon">⚕️</span>
                            <span className="fcb-typing"><span /><span /><span /></span>
                        </div>
                    )}

                    {aiError && <div className="fcb-ai-error">⚠️ {aiError}</div>}
                    <div ref={messagesEndRef} />
                </div>

                {/* Validation error */}
                {validationError && (
                    <div className="fcb-validation-error" role="alert">
                        ⚠️ {validationError}
                    </div>
                )}

                {/* Input */}
                <form className={`fcb-input-area ${validationError ? 'fcb-input-area--error' : ''}`} onSubmit={handleSubmit}>
                    <textarea
                        ref={inputRef}
                        className="fcb-input"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message…"
                        rows={1}
                        disabled={loading}
                        aria-invalid={!!validationError}
                    />
                    <button
                        type="submit"
                        className="fcb-send-btn"
                        disabled={loading || !input.trim()}
                        aria-label="Send message"
                    >
                        ➤
                    </button>
                </form>

                {/* Char counter & hint */}
                <div className="fcb-input-footer">
                    <span className="fcb-input-hint">Enter ↵ send · Shift+Enter new line</span>
                    {isNearLimit && (
                        <span className={`fcb-char-counter ${remaining < 50 ? 'fcb-char-counter--warning' : ''}`}>
                            {remaining} left
                        </span>
                    )}
                </div>
            </div>

            {/* Toggle FAB */}
            <button
                className={`fcb-fab ${open ? 'fcb-fab--active' : ''}`}
                onClick={() => setOpen(prev => !prev)}
                aria-label={open ? 'Close chat' : 'Chat with MedVision AI'}
                title="Chat with MedVision AI"
            >
                <span className="fcb-fab-icon">{open ? '✕' : '💬'}</span>
                {!open && <span className="fcb-fab-pulse" />}
            </button>
        </div>
    )

    return createPortal(widget, document.body)
}
