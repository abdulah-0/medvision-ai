import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { chatRouter } from './routes/chat.js'
import { imageRouter } from './routes/image.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))
app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)
app.use('/api/image', imageRouter)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'MedVision AI Server is running' })
})

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
    console.log(`🚀 MedVision AI Server running on http://localhost:${PORT}`)
})
