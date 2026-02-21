import { supabase } from './supabaseClient'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

// Log the server URL on init so it's visible in the console if debugging
console.log('[MedVision] Backend URL:', SERVER_URL)

/**
 * Send a message to the AI via the Express backend
 */
export async function sendChatMessage(message, history = [], userProfile = null) {
    const response = await fetch(`${SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, userProfile })
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Failed to get AI response (${response.status} from ${SERVER_URL}/api/chat)`)
    }

    return response.json()
}

/**
 * Get the current user's medical profile
 */
export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

    if (error && error.code === 'PGRST116') return null // no profile yet
    if (error) throw error
    return data
}

/**
 * Create a new user profile (first-time onboarding)
 */
export async function saveUserProfile(userId, profileData) {
    const { data, error } = await supabase
        .from('user_profiles')
        .insert([{ user_id: userId, ...profileData, onboarding_complete: true }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update an existing user profile
 */
export async function updateUserProfile(userId, profileData) {
    const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}


/**
 * Generate a medical image via the Express backend
 */
export async function generateMedicalImage(prompt) {
    const response = await fetch(`${SERVER_URL}/api/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate image')
    }

    return response.json()
}

/**
 * Fetch chat history for the current user
 */
export async function fetchChatHistory(userId) {
    const { data, error } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

/**
 * Fetch messages for a specific chat
 */
export async function fetchChatMessages(chatId) {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data
}

/**
 * Create a new chat session
 */
export async function createNewChat(userId, title = 'New Chat') {
    const { data, error } = await supabase
        .from('chats')
        .insert([{ user_id: userId, title }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Save a message to the database
 */
export async function saveMessage(chatId, role, content, imageUrl = null) {
    const { data, error } = await supabase
        .from('messages')
        .insert([{ chat_id: chatId, role, content, image_url: imageUrl }])
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatId, title) {
    const { error } = await supabase
        .from('chats')
        .update({ title })
        .eq('id', chatId)

    if (error) throw error
}

/**
 * Delete a chat and all its messages (cascade handled by DB)
 */
export async function deleteChat(chatId) {
    const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId)

    if (error) throw error
}

