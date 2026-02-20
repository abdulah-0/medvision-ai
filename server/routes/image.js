import { Router } from 'express'
import { callOpenRouter } from '../openrouter.js'

export const imageRouter = Router()

imageRouter.post('/', async (req, res) => {
    try {
        const { prompt } = req.body

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Prompt is required' })
        }

        const medicalPrompt = `Create a clean, educational medical diagram or illustration: ${prompt.trim()}. 
    Style: medical textbook quality, clear labels, professional and clinical appearance.`

        const messages = [
            {
                role: 'user',
                content: medicalPrompt
            }
        ]

        const response = await callOpenRouter(messages, 'image')

        res.json(response)
    } catch (error) {
        console.error('Image generation error:', error)
        res.status(500).json({
            error: 'Image generation failed. Here is a text description instead.',
            fallback: true
        })
    }
})
