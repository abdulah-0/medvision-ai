import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createNewChat } from '../../services/api'
import { Sidebar } from '../layout/Sidebar'
import { ChatContainer } from '../chat/ChatContainer'
import './Dashboard.css'

export function Dashboard() {
    const { user } = useAuth()
    const [currentChatId, setCurrentChatId] = useState(null)
    const initialized = useRef(false)

    // Create initial chat only once on mount
    useEffect(() => {
        if (user && !initialized.current) {
            initialized.current = true
            createNewChat(user.id, 'New Conversation')
                .then(chat => setCurrentChatId(chat.id))
                .catch(err => console.error('Failed to create initial chat:', err))
        }
    }, [user])

    return (
        <div className="dashboard">
            <Sidebar
                currentChatId={currentChatId}
                onSelectChat={setCurrentChatId}
                onNewChat={setCurrentChatId}
            />
            <div className="dashboard-main">
                <ChatContainer chatId={currentChatId} />
            </div>
        </div>
    )
}
