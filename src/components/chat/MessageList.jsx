import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import './MessageList.css'

export function MessageList({ messages, loading }) {
    const messagesEndRef = useRef(null)
    const containerRef = useRef(null)
    const prevMessageCount = useRef(0)
    const userScrolledUp = useRef(false)

    // Track whether user has scrolled up manually
    const handleScroll = () => {
        const el = containerRef.current
        if (!el) return
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        // If more than 100px from bottom, user has scrolled up
        userScrolledUp.current = distFromBottom > 100
    }

    // Only auto-scroll when a NEW message is added AND user hasn't scrolled up
    useEffect(() => {
        const newCount = messages.length
        const isNewMessage = newCount > prevMessageCount.current
        prevMessageCount.current = newCount

        if (isNewMessage && !userScrolledUp.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages])

    // Always scroll to bottom when loading state starts (AI is typing)
    useEffect(() => {
        if (loading) {
            userScrolledUp.current = false
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [loading])

    return (
        <div className="message-list" ref={containerRef} onScroll={handleScroll}>
            {messages.length === 0 && !loading && (
                <div className="empty-state">
                    <div className="empty-icon">💬</div>
                    <h3>Start a Conversation</h3>
                    <p>Ask me anything about medical topics, symptoms, or request educational diagrams.</p>
                </div>
            )}

            {messages.map((message) => (
                <MessageBubble
                    key={message.id}
                    role={message.role}
                    content={message.content}
                    imageUrl={message.image_url}
                    timestamp={message.created_at}
                />
            ))}

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
        </div>
    )
}
