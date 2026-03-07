const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

/**
 * Free models from DIVERSE providers — avoids single-provider rate limits.
 * Venice is excluded since it aggressively rate-limits Llama models.
 *
 * NOTE: If you see 404 on any model, enable "Allow free model usage" at:
 * https://openrouter.ai/settings/privacy
 */
const FREE_TEXT_MODELS = [
    'meta-llama/llama-3.3-70b-instruct:free',       // Meta — large, reliable
    'google/gemma-3-27b-it:free',                    // Google Gemma 3 27B
    'google/gemma-3-12b-it:free',                    // Google Gemma 3 12B — faster fallback
    'mistralai/mistral-small-3.1-24b-instruct:free', // Mistral Small 3.1 — verified live
    'nousresearch/hermes-3-llama-3.1-405b:free',    // Nous Hermes — very capable
    'meta-llama/llama-3.2-3b-instruct:free',         // Llama 3.2 3B — small & fast
    'openai/gpt-oss-20b:free',                       // OpenAI OSS 20B
]

/**
 * Send to all models in parallel — first success wins.
 * 429s are retried once after a short delay before giving up.
 */
export async function callOpenRouter(messages) {
    const apiKey = process.env.OPENROUTER_API_KEY

    if (!apiKey) {
        console.error('[OpenRouter] OPENROUTER_API_KEY is not set!')
        throw new Error('Server configuration error: API key missing.')
    }

    console.log(`[OpenRouter] Racing ${FREE_TEXT_MODELS.length} models in parallel`)

    const errors = []

    // Wrap each model call: retry once on 429 after 2s
    const attempts = FREE_TEXT_MODELS.map(model => {
        const tryModel = () => _callModel(apiKey, model, messages)
        return tryModel()
            .catch(async err => {
                if (err.message.includes('429')) {
                    console.log(`[OpenRouter] ${model} rate-limited, retrying in 2s...`)
                    await _sleep(2000)
                    return tryModel() // one retry
                }
                throw err
            })
            .then(result => ({ ok: true, result, model }))
            .catch(err => {
                console.warn(`[OpenRouter] ${model} failed: ${err.message.slice(0, 120)}`)
                errors.push(`${model}: ${err.message.slice(0, 80)}`)
                return { ok: false, model }
            })
    })

    return new Promise((resolve, reject) => {
        let resolved = false
        let remaining = attempts.length

        attempts.forEach(p => {
            p.then(outcome => {
                remaining--
                if (outcome.ok && !resolved) {
                    resolved = true
                    console.log(`[OpenRouter] ✓ Winner: ${outcome.model}`)
                    resolve(outcome.result)
                }
                if (!resolved && remaining === 0) {
                    console.error('[OpenRouter] All models failed')
                    reject(new Error('All AI models are currently unavailable. Please try again in a moment.'))
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
            'HTTP-Referer': process.env.FRONTEND_URL || 'https://medvision-ai-rouge.vercel.app',
            'X-Title': 'MedVision AI'
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 300,
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
    if (!content) throw new Error(`No content in response`)

    return content
}

function _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
