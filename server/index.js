import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import rateLimit from 'express-rate-limit'
import { chatRouter } from './routes/chat.js'
import { imageRouter } from './routes/image.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Allow all origins — API keys are server-side only
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Rate limiter: max 8 chat requests per minute per IP
// Protects against OpenRouter rate limits and abuse
const chatLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minute window
    max: 8,               // 8 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many messages. Please wait a moment before sending another.' }
})

// Routes
app.use('/api/chat', chatLimiter, chatRouter)
app.use('/api/image', imageRouter)

// Health check — shows API key and Node version for debugging
app.get('/api/health', (req, res) => {
    const hasKey = !!process.env.OPENROUTER_API_KEY
    res.json({
        status: 'ok',
        message: 'MedVision AI Server is running',
        openrouter_key: hasKey ? 'configured' : 'MISSING',
        node_version: process.version
    })
})

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`🚀 MedVision AI Server running on port ${PORT}`)
    console.log(`🔑 OpenRouter key: ${process.env.OPENROUTER_API_KEY ? 'configured' : 'MISSING'}`)

    // Self-ping every 10 min to prevent Render free tier from sleeping
    const selfUrl = process.env.RENDER_EXTERNAL_URL
    if (selfUrl) {
        console.log(`♻️  Self-ping enabled: ${selfUrl}/api/health`)
        setInterval(async () => {
            try {
                await fetch(`${selfUrl}/api/health`)
                console.log('[keep-alive] ping ok')
            } catch (err) {
                console.warn('[keep-alive] ping failed:', err.message)
            }
        }, 10 * 60 * 1000)
    }
})
