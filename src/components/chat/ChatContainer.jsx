import { useEffect } from 'react'
import { useChat } from '../../hooks/useChat'
import { fetchChatMessages } from '../../services/api'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'
import { DisclaimerBanner } from '../common/DisclaimerBanner'
import './ChatContainer.css'

export function ChatContainer({ chatId }) {
    const { messages, setMessages, loading, error, sendMessage } = useChat(chatId)

    // Load messages when chat changes
    useEffect(() => {
        if (chatId) {
            fetchChatMessages(chatId)
                .then(data => setMessages(data))
                .catch(err => console.error('Failed to load messages:', err))
        } else {
            setMessages([])
        }
    }, [chatId])

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-header-icon">⚕️</div>
                    <div className="chat-header-text">
                        <h2>MedVision AI</h2>
                        <p>Clinical AI Assistant</p>
                    </div>
                </div>
                <div className="chat-header-badge">AI Online</div>
            </div>

            <DisclaimerBanner />

            {error && (
                <div className="chat-error">
                    ⚠️ {error}
                </div>
            )}

            <MessageList messages={messages} loading={loading} />

            <ChatInput
                onSendMessage={sendMessage}
                disabled={loading || !chatId}
            />
        </div>
    )
}
