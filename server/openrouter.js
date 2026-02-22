const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

// Free models — ordered fastest to slowest
const FREE_TEXT_MODELS = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'openai/gpt-oss-20b:free',
    'meta-llama/llama-3.3-70b-instruct:free',
]

/**
 * Race all models in parallel — whichever responds first wins.
 * Uses Promise.race on settled promises to avoid waiting for slow queued models.
 */
export async function callOpenRouter(messages) {
    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
        console.error('[OpenRouter] OPENROUTER_API_KEY is not set!')
        throw new Error('OPENROUTER_API_KEY is not configured on the server.')
    }

    console.log(`[OpenRouter] Sending to ${FREE_TEXT_MODELS.length} models in parallel`)

    const errors = []

    // Build an array of {promise, model} pairs
    const attempts = FREE_TEXT_MODELS.map(model => ({
        model,
        promise: _callModel(apiKey, model, messages)
    }))

    // Wait for each to settle, resolve with first success
    const settled = attempts.map(({ model, promise }) =>
        promise
            .then(result => ({ ok: true, result, model }))
            .catch(err => ({ ok: false, error: err.message, model }))
    )

    // Stream results as they come in — return first success
    return new Promise((resolve, reject) => {
        let resolved = false
        let remaining = settled.length

        settled.forEach(p => {
            p.then(outcome => {
                remaining--
                if (outcome.ok && !resolved) {
                    resolved = true
                    console.log(`[OpenRouter] Winner: ${outcome.model}`)
                    resolve(outcome.result)
                } else if (!outcome.ok) {
                    console.warn(`[OpenRouter] ${outcome.model} failed: ${outcome.error}`)
                    errors.push(`${outcome.model}: ${outcome.error}`)
                }
                // All failed
                if (!resolved && remaining === 0) {
                    console.error('[OpenRouter] All models failed:', errors.join(' | '))
                    reject(new Error(`All models failed. Errors: ${errors.join(' | ')}`))
                }
            })
        })
    })
}

async function _callModel(apiKey, model, messages) {
    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
            'X-Title': 'MedVision AI'
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        })
    })

    if (!response.ok) {
        const errText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`)
    }

    const data = await response.json()

    if (data.error) {
        throw new Error(`API error: ${data.error.message || JSON.stringify(data.error)}`)
    }

    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error(`No content in response: ${JSON.stringify(data).slice(0, 200)}`)

    return content
}
