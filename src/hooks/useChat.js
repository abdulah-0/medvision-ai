import { useState, useCallback, useRef } from 'react'
import { sendChatMessage, generateMedicalImage, saveMessage, updateChatTitle } from '../services/api'

// Keywords that trigger image generation
const IMAGE_KEYWORDS = ['show diagram', 'generate image', 'visualize', 'draw', 'illustrate', 'show me a picture', 'show picture']

function detectImageRequest(message) {
    const lower = message.toLowerCase()
    return IMAGE_KEYWORDS.some(kw => lower.includes(kw))
}

/**
 * Custom hook for managing chat functionality
 */
export function useChat(chatId, userProfile = null) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    // Keep a ref to the current messages for building history without stale closure
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

        // Optimistically add user message
        const userMsg = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content,
            created_at: new Date().toISOString()
        }
        setMessagesAndRef(prev => [...prev, userMsg])

        try {
            // Build history for context (exclude temp IDs)
            const history = messagesRef.current
                .filter(m => !String(m.id).startsWith('temp-'))
                .map(m => ({ role: m.role, content: m.content }))

            // Save user message to Supabase
            const savedUser = await saveMessage(chatId, 'user', content)
            // Replace temp message with saved one
            setMessagesAndRef(prev => prev.map(m => m.id === userMsg.id ? savedUser : m))

            let aiContent, imageUrl = null

            if (detectImageRequest(content)) {
                // Image generation path
                const imgResult = await generateMedicalImage(content)
                imageUrl = imgResult.imageUrl || null
                aiContent = imgResult.description || 'Here is the medical diagram you requested.'
            } else {
                // Text chat path
                const result = await sendChatMessage(content, history, userProfile)
                aiContent = result.message
            }

            // Save AI response to Supabase
            const savedAI = await saveMessage(chatId, 'assistant', aiContent, imageUrl)
            setMessagesAndRef(prev => [...prev, savedAI])

            // Auto-title the chat from first user message
            if (messagesRef.current.filter(m => m.role === 'user').length === 1) {
                const title = content.slice(0, 50) + (content.length > 50 ? '…' : '')
                updateChatTitle(chatId, title).catch(() => { })
            }
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.')
            // Remove the optimistic user message on failure
            setMessagesAndRef(prev => prev.filter(m => m.id !== userMsg.id))
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
