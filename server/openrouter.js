const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Free models — fired in parallel, first responder wins
const FREE_TEXT_MODELS = [
    'meta-llama/llama-3.2-3b-instruct:free',   // 3B — near-instant
    'meta-llama/llama-3.1-8b-instruct:free',   // 8B — fast
    'openai/gpt-oss-20b:free',                 // 20B — fast
    'meta-llama/llama-3.3-70b-instruct:free',  // 70B — medium
]

/**
 * Call all free models in parallel — return whichever responds first.
 * This eliminates sequential queue waits entirely.
 */
export async function callOpenRouter(messages) {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) throw new Error('OPENROUTER_API_KEY is not configured')

    console.log(`[OpenRouter] Racing ${FREE_TEXT_MODELS.length} models in parallel...`)

    // Each model race: resolve on success, reject on failure
    const modelRaces = FREE_TEXT_MODELS.map(model =>
        _callModel(apiKey, model, messages)
            .then(result => {
                console.log(`[OpenRouter] Winner: ${model}`)
                return result
            })
            .catch(err => {
                console.warn(`[OpenRouter] ${model} failed: ${err.message}`)
                return Promise.reject(err)
            })
    )

    try {
        // Promise.any = resolves as soon as ANY model succeeds
        return await Promise.any(modelRaces)
    } catch {
        throw new Error('All AI models are unavailable. Please try again in a moment.')
    }
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

    if (data.error) {
        throw new Error(`OpenRouter: ${data.error.message || JSON.stringify(data.error)}`)
    }

    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response from model')

    return content
}
