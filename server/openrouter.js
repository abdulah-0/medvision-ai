const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Free models available on OpenRouter (verified 2026-02, in priority order)
const FREE_TEXT_MODELS = [
    'openai/gpt-oss-120b:free',                      // primary model
    'meta-llama/llama-3.3-70b-instruct:free',
    'deepseek/deepseek-r1-0528:free',
    'mistralai/mistral-small-3.1-24b-instruct:free',
    'google/gemma-3-27b-it:free',
    'meta-llama/llama-3.2-3b-instruct:free',
]

/**
 * Call OpenRouter API with automatic fallback across free models
 * @param {Array} messages - Array of message objects {role, content}
 * @param {'text'|'image'} mode - Generation mode
 */
export async function callOpenRouter(messages, mode = 'text') {
    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured')
    }

    const models = mode === 'image'
        ? ['openai/gpt-4o']
        : FREE_TEXT_MODELS

    let lastError = null

    for (const model of models) {
        try {
            const result = await _callModel(apiKey, model, messages, mode)
            return result
        } catch (err) {
            console.warn(`Model ${model} failed: ${err.message}. Trying next...`)
            lastError = err
        }
    }

    throw lastError || new Error('All models failed')
}

async function _callModel(apiKey, model, messages, mode) {
    const body = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
    }

    if (mode === 'image') {
        body.modalities = ['text', 'image']
    }

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'MedVision AI'
        },
        body: JSON.stringify(body)
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`OpenRouter API error ${response.status}: ${err}`)
    }

    const data = await response.json()
    const choice = data.choices?.[0]

    if (!choice) {
        throw new Error('No response from AI model')
    }

    // Handle image response
    if (mode === 'image') {
        const content = choice.message?.content
        if (Array.isArray(content)) {
            const imageItem = content.find(c => c.type === 'image_url')
            const textItem = content.find(c => c.type === 'text')
            return {
                imageUrl: imageItem?.image_url?.url || null,
                description: textItem?.text || 'Medical diagram generated'
            }
        }
        return { imageUrl: null, description: choice.message?.content || '' }
    }

    // Handle text response
    return choice.message?.content || ''
}
