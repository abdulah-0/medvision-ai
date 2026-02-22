const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Verified free models on OpenRouter (Feb 2026), ordered fastest first
const FREE_TEXT_MODELS = [
    'openai/gpt-oss-20b:free',                        // 20B — fast, verified Feb 2026
    'meta-llama/llama-3.2-3b-instruct:free',          // 3B — near-instant
    'meta-llama/llama-3.1-8b-instruct:free',          // 8B — fast
    'meta-llama/llama-3.3-70b-instruct:free',         // 70B — medium
    'deepseek/deepseek-r1-0528:free',                 // reasoning model — fallback
]

/**
 * Call OpenRouter API with automatic fallback across free models
 */
export async function callOpenRouter(messages, mode = 'text') {
    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured')
    }

    const models = FREE_TEXT_MODELS
    let lastError = null

    for (const model of models) {
        try {
            console.log(`[OpenRouter] Trying model: ${model}`)
            const result = await _callModel(apiKey, model, messages)
            console.log(`[OpenRouter] Success with model: ${model}`)
            return result
        } catch (err) {
            console.warn(`[OpenRouter] Model ${model} failed: ${err.message}`)
            lastError = err
        }
    }

    console.error('[OpenRouter] All models failed. Last error:', lastError?.message)
    throw lastError || new Error('All models failed')
}

async function _callModel(apiKey, model, messages) {
    const body = {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1024,
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
        const errText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`)
    }

    const data = await response.json()

    // Check for OpenRouter-specific error in body
    if (data.error) {
        throw new Error(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`)
    }

    const choice = data.choices?.[0]
    if (!choice) {
        throw new Error(`No choices in response: ${JSON.stringify(data).slice(0, 200)}`)
    }

    return choice.message?.content || ''
}
