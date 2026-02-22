import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { chatRouter } from './routes/chat.js'
import { imageRouter } from './routes/image.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Allow all origins — safe because API keys are server-side only
// Vercel generates unique preview URLs that can't be statically whitelisted
app.use(cors({
    origin: true,
    credentials: true
}))

app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/image', imageRouter)

// Health check
app.get('/api/health', (req, res) => {
    const hasKey = !!process.env.OPENROUTER_API_KEY
    res.json({
        status: 'ok',
        message: 'MedVision AI Server is running',
        openrouter_key: hasKey ? 'configured' : 'MISSING',
        node_version: process.version
    })
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`🚀 MedVision AI Server running on http://localhost:${PORT}`)

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
        }, 10 * 60 * 1000) // 10 minutes
    }
})
