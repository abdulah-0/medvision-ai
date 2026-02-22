import { useState, useCallback, useRef } from 'react'
import { sendChatMessage, generateMedicalImage, saveMessage, updateChatTitle } from '../services/api'

// Keywords that trigger image generation
const IMAGE_KEYWORDS = ['show diagram', 'generate image', 'visualize', 'draw', 'illustrate', 'show me a picture', 'show picture']

function detectImageRequest(message) {
    const lower = message.toLowerCase()
    return IMAGE_KEYWORDS.some(kw => lower.includes(kw))
}

// Friendly error translator
function friendlyError(err) {
    const msg = err?.message || ''
    if (msg.includes('Failed to fetch') || msg.includes('ERR_NAME_NOT_RESOLVED') || msg.includes('NetworkError')) {
        return 'Network error: could not reach the AI service. Please check your connection and try again.'
    }
    if (msg.includes('404')) {
        return 'AI service is unavailable right now. Please try again in a moment.'
    }
    return msg || 'Something went wrong. Please try again.'
}

/**
 * Custom hook for managing chat functionality.
 * Supabase persistence is non-blocking — if it fails, the AI response still shows.
 */
export function useChat(chatId, userProfile = null) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const messagesRef = useRef([])

    const setMessagesAndRef = useCallback((updater) => {
        setMessages(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            messagesRef.current = next
            return next
        })
    }, [])

    const sendMessage = useCallback(async (content) => {
        if (!content.trim() || !chatId) return

        setLoading(true)
        setError(null)

        // Optimistically add user message to UI
        const tempId = `temp-${Date.now()}`
        const userMsg = {
            id: tempId,
            role: 'user',
            content,
            created_at: new Date().toISOString()
        }
        setMessagesAndRef(prev => [...prev, userMsg])

        try {
            // Build history from current messages (using temp version is fine for context)
            const history = messagesRef.current
                .filter(m => !String(m.id).startsWith('temp-'))
                .map(m => ({ role: m.role, content: m.content }))

            // --- Save user message to Supabase (non-blocking, best-effort) ---
            saveMessage(chatId, 'user', content)
                .then(saved => {
                    // Replace temp ID with real saved ID once Supabase responds
                    setMessagesAndRef(prev => prev.map(m => m.id === tempId ? saved : m))
                })
                .catch(() => { /* Supabase offline — keep temp message, chat still works */ })

            // --- Get AI response (this is what actually matters) ---
            let aiContent, imageUrl = null

            if (detectImageRequest(content)) {
                const imgResult = await generateMedicalImage(content)
                imageUrl = imgResult.imageUrl || null
                aiContent = imgResult.description || 'Here is the medical diagram you requested.'
            } else {
                const result = await sendChatMessage(content, history, userProfile)
                aiContent = result.message
            }

            // Show AI response immediately in UI
            const aiMsg = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: aiContent,
                image_url: imageUrl || null,
                created_at: new Date().toISOString()
            }
            setMessagesAndRef(prev => [...prev, aiMsg])

            // --- Save AI response to Supabase (non-blocking, best-effort) ---
            saveMessage(chatId, 'assistant', aiContent, imageUrl)
                .then(saved => {
                    setMessagesAndRef(prev => prev.map(m => m.id === aiMsg.id ? saved : m))
                })
                .catch(() => { /* Supabase offline — message still visible in session */ })

            // Auto-title the chat from first user message
            const userMsgCount = messagesRef.current.filter(m => m.role === 'user').length
            if (userMsgCount <= 1) {
                const title = content.slice(0, 50) + (content.length > 50 ? '…' : '')
                updateChatTitle(chatId, title).catch(() => { })
            }

        } catch (err) {
            setError(friendlyError(err))
            // Remove the optimistic user message on AI failure
            setMessagesAndRef(prev => prev.filter(m => m.id !== tempId))
        } finally {
            setLoading(false)
        }
    }, [chatId, userProfile])

    return {
        messages,
        setMessages: setMessagesAndRef,
        loading,
        error,
        sendMessage
    }
}
