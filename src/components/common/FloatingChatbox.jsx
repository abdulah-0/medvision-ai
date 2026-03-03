import { useState, useRef, useEffect, useCallback } from 'react'
import { sendChatMessage } from '../../services/api'
import './FloatingChatbox.css'

const WELCOME_MSG = {
    id: 'welcome',
    role: 'assistant',
    content: 'Welcome to MedVision AI 👋 How are you feeling today?'
}

function friendlyError(err) {
    const msg = err?.message || ''
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        return 'Network error: could not reach the AI service. Please check your connection.'
    }
    return 'Something went wrong. Please try again.'
}

export function FloatingChatbox() {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState([WELCOME_MSG])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const historyRef = useRef([])

    // Scroll to bottom whenever messages change
    useEffect(() => {
        if (open && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, open])

    // Focus input when opened
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || loading) return

        setLoading(true)
        setError(null)

        const userMsg = {
            id: `u-${Date.now()}`,
            role: 'user',
            content
        }
        setMessages(prev => [...prev, userMsg])

        try {
            const result = await sendChatMessage(content, historyRef.current, null)
            const aiMsg = {
                id: `a-${Date.now()}`,
                role: 'assistant',
                content: result.message
            }
            historyRef.current = [
                ...historyRef.current,
                { role: 'user', content },
                { role: 'assistant', content: result.message }
            ]
            setMessages(prev => [...prev, aiMsg])
        } catch (err) {
            setError(friendlyError(err))
        } finally {
            setLoading(false)
        }
    }, [loading])

    const handleSubmit = (e) => {
        e.preventDefault()
        const trimmed = input.trim()
        if (trimmed) {
            setInput('')
            sendMessage(trimmed)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    return (
        <div className="fcb-root">
            {/* Chat panel */}
            <div className={`fcb-panel ${open ? 'fcb-panel--open' : ''}`} role="dialog" aria-label="MedVision AI Chat">
                {/* Header */}
                <div className="fcb-header">
                    <div className="fcb-header-info">
                        <div className="fcb-avatar">⚕️</div>
                        <div>
                            <div className="fcb-name">MedVision AI</div>
                            <div className="fcb-status"><span className="fcb-online-dot" />Online 24/7</div>
                        </div>
                    </div>
                    <button className="fcb-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
                </div>

                {/* Messages */}
                <div className="fcb-messages">
                    {messages.map(msg => (
                        <div
                            key={msg.id}
                            className={`fcb-bubble ${msg.role === 'user' ? 'fcb-bubble--user' : 'fcb-bubble--ai'}`}
                        >
                            {msg.role === 'assistant' && <span className="fcb-bubble-icon">⚕️</span>}
                            <span className="fcb-bubble-text">{msg.content}</span>
                        </div>
                    ))}

                    {loading && (
                        <div className="fcb-bubble fcb-bubble--ai">
                            <span className="fcb-bubble-icon">⚕️</span>
                            <span className="fcb-typing">
                                <span /><span /><span />
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="fcb-error">⚠️ {error}</div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form className="fcb-input-area" onSubmit={handleSubmit}>
                    <textarea
                        ref={inputRef}
                        className="fcb-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message…"
                        rows={1}
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        className="fcb-send-btn"
                        disabled={loading || !input.trim()}
                        aria-label="Send"
                    >
                        ➤
                    </button>
                </form>
            </div>

            {/* Toggle button */}
            <button
                className={`fcb-fab ${open ? 'fcb-fab--active' : ''}`}
                onClick={() => setOpen(prev => !prev)}
                aria-label={open ? 'Close chat' : 'Open chat with MedVision AI'}
            >
                {open ? '✕' : '💬'}
                {!open && <span className="fcb-fab-pulse" />}
            </button>
        </div>
    )
}
