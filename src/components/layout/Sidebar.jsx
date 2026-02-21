import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { fetchChatHistory, createNewChat, deleteChat } from '../../services/api'
import './Sidebar.css'

export function Sidebar({ currentChatId, onSelectChat, onNewChat, onShowProfile, userProfile }) {
    const { user, signOut } = useAuth()
    const [chats, setChats] = useState([])
    const [loading, setLoading] = useState(false)
    const [deletingId, setDeletingId] = useState(null)

    useEffect(() => {
        if (user) loadChats()
    }, [user])

    const loadChats = async () => {
        setLoading(true)
        try {
            const data = await fetchChatHistory(user.id)
            setChats(data)
        } catch (error) {
            console.error('Failed to load chats:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleNewChat = async () => {
        try {
            const newChat = await createNewChat(user.id)
            setChats(prev => [newChat, ...prev])
            onNewChat(newChat.id)
        } catch (error) {
            console.error('Failed to create new chat:', error)
        }
    }

    const handleDeleteChat = async (e, chatId) => {
        e.stopPropagation()
        if (!window.confirm('Delete this chat? This cannot be undone.')) return
        setDeletingId(chatId)
        try {
            await deleteChat(chatId)
            setChats(prev => prev.filter(c => c.id !== chatId))
            if (currentChatId === chatId) onSelectChat(null)
        } catch (error) {
            console.error('Failed to delete chat:', error)
        } finally {
            setDeletingId(null)
        }
    }

    // Get initials for avatar
    const avatarLetter = userProfile?.full_name
        ? userProfile.full_name[0].toUpperCase()
        : user?.email?.charAt(0).toUpperCase() || '?'
    const displayName = userProfile?.full_name || user?.email

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">⚕️</span>
                    <div>
                        <span className="logo-text">MedVision</span>
                        <span className="logo-subtitle">AI Clinical Assistant</span>
                    </div>
                </div>
                <button className="new-chat-btn" onClick={handleNewChat}>
                    ＋ New Chat
                </button>
            </div>

            <span className="sidebar-section-label">Recent Chats</span>

            <div className="sidebar-chats">
                {loading ? (
                    <div className="sidebar-loading">Loading chats...</div>
                ) : chats.length === 0 ? (
                    <div className="sidebar-empty">No chats yet. Start one above!</div>
                ) : (
                    chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`chat-item ${currentChatId === chat.id ? 'chat-item-active' : ''}`}
                        >
                            <button
                                className="chat-item-btn"
                                onClick={() => onSelectChat(chat.id)}
                            >
                                <span className="chat-item-title">{chat.title}</span>
                                <span className="chat-item-date">
                                    {new Date(chat.created_at).toLocaleDateString()}
                                </span>
                            </button>
                            <button
                                className="chat-item-delete"
                                onClick={(e) => handleDeleteChat(e, chat.id)}
                                disabled={deletingId === chat.id}
                                aria-label="Delete chat"
                                title="Delete chat"
                            >
                                {deletingId === chat.id ? '…' : '✕'}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">{avatarLetter}</div>
                    <span className="user-email">{displayName}</span>
                </div>
                <button className="profile-link-btn" onClick={onShowProfile}>
                    👤 My Profile
                </button>
                <button className="signout-btn" onClick={signOut}>
                    Sign Out
                </button>
            </div>
        </div>
    )
}
