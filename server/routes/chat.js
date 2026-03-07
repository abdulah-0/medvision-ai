import { Router } from 'express'
import { callOpenRouter } from '../openrouter.js'
import { checkEmergency, checkRestrictedQuery } from '../safety.js'

export const chatRouter = Router()

// Build a patient context block from the user's profile
function buildPatientContext(profile) {
    if (!profile || !profile.onboarding_complete) return ''

    const lines = []
    if (profile.full_name) lines.push(`- Name: ${profile.full_name}`)
    if (profile.age) lines.push(`- Age: ${profile.age}`)
    if (profile.gender) lines.push(`- Gender: ${profile.gender}`)
    if (profile.blood_type) lines.push(`- Blood Type: ${profile.blood_type}`)
    if (profile.conditions?.length) lines.push(`- Medical Conditions: ${profile.conditions.join(', ')}`)
    if (profile.medications?.length) lines.push(`- Current Medications: ${profile.medications.join(', ')}`)
    if (profile.allergies?.length) lines.push(`- Allergies: ${profile.allergies.join(', ')}`)
    if (profile.notes) lines.push(`- Additional Notes: ${profile.notes}`)

    if (!lines.length) return ''
    return `\n\nCURRENT PATIENT PROFILE:\n${lines.join('\n')}\n\nAlways tailor your responses considering this patient's specific conditions, medications, and allergies. Flag any potential interactions or special considerations relevant to their profile.`
}

chatRouter.post('/', async (req, res) => {
    try {
        const { message, history = [], userProfile } = req.body

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' })
        }

        const trimmed = message.trim()

        // 1. Emergency detection
        if (checkEmergency(trimmed)) {
            return res.json({
                message: '🚨 **Emergency Alert:** Please seek immediate medical attention or contact emergency services (e.g., call 911 or your local emergency number). Do not delay — your safety is the priority.',
                isEmergency: true
            })
        }

        // 2. Restricted query blocking
        if (checkRestrictedQuery(trimmed)) {
            return res.json({
                message: 'I cannot provide medical diagnoses, prescriptions, or specific dosage recommendations. Please consult a licensed medical professional for personalized medical advice.',
                isRestricted: true
            })
        }

        // 3. Build message history for context
        const patientContext = buildPatientContext(userProfile)

        const messages = [
            {
                role: 'system',
                content: `You are MedVision AI, a medical information assistant. Answer ONLY the question asked.

OUTPUT RULES — STRICTLY ENFORCED:
- Maximum 3 sentences OR a bullet list of max 5 items. Never both.
- Zero filler: no greetings, no "Great question!", no "I hope this helps", no lengthy disclaimers.
- Never repeat what the user said. Jump straight to the answer.
- If a list is needed, use "•" bullets, one line each, no sub-bullets.
- Append this exact line at the end ONLY when medically necessary: "⚠️ Consult a doctor for personal advice."

MEDICAL RULES:
- Never diagnose or prescribe — redirect to a professional if asked
- For emergencies, respond only: "🚨 Call emergency services immediately."
- When a patient profile is provided, factor it in silently — don't narrate it${patientContext}`
            },
            ...history.slice(-10),
            { role: 'user', content: trimmed }
        ]

        const response = await callOpenRouter(messages)
        res.json({ message: response })
    } catch (error) {
        console.error('Chat route error:', error?.message || error)
        const isDev = process.env.NODE_ENV !== 'production'
        res.status(500).json({
            error: 'AI service temporarily unavailable. Please try again.',
            ...(isDev && { detail: error?.message })
        })
    }
})
