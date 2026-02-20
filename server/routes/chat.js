import { Router } from 'express'
import { callOpenRouter } from '../openrouter.js'
import { checkEmergency, checkRestrictedQuery } from '../safety.js'

export const chatRouter = Router()

chatRouter.post('/', async (req, res) => {
    try {
        const { message, history = [] } = req.body

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
        const messages = [
            {
                role: 'system',
                content: `You are MedVision AI, a helpful medical information assistant. You provide general medical information for educational purposes only.

IMPORTANT RULES:
- Always include a disclaimer that your information is general and not a substitute for professional medical advice
- Never provide specific diagnoses
- Never prescribe medications or specific dosages
- For emergencies, always direct users to seek immediate medical attention
- Keep responses clear, accurate, and educational
- Focus on symptom explanations, disease overviews, preventive measures, and general treatment information`
            },
            ...history.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: trimmed }
        ]

        const response = await callOpenRouter(messages, 'text')

        res.json({ message: response })
    } catch (error) {
        console.error('Chat error:', error)
        res.status(500).json({ error: 'AI service temporarily unavailable. Please try again.' })
    }
})
