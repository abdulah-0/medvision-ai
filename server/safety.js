/**
 * Safety module for MedVision AI
 * Detects emergency phrases and restricted medical queries
 */

const EMERGENCY_PHRASES = [
    'severe chest pain',
    'chest pain',
    'heart attack',
    'i want to kill myself',
    'suicidal',
    'want to die',
    'kill myself',
    'overdose',
    'heavy bleeding',
    'severe bleeding',
    'cant breathe',
    "can't breathe",
    'difficulty breathing',
    'stroke',
    'unconscious',
    'not breathing',
    'severe allergic reaction',
    'anaphylaxis',
]

const RESTRICTED_PHRASES = [
    'diagnose me',
    'what disease do i have',
    'what illness do i have',
    'prescribe',
    'prescription for',
    'what medication should i take',
    'what drug should i take',
    'how much insulin',
    'what dosage',
    'dosage for',
    'how many pills',
    'how many tablets',
    'am i pregnant',
    'do i have cancer',
    'do i have diabetes',
]

/**
 * Check if a message contains emergency phrases
 * @param {string} message
 * @returns {boolean}
 */
export function checkEmergency(message) {
    const lower = message.toLowerCase()
    return EMERGENCY_PHRASES.some(phrase => lower.includes(phrase))
}

/**
 * Check if a message contains restricted medical queries
 * @param {string} message
 * @returns {boolean}
 */
export function checkRestrictedQuery(message) {
    const lower = message.toLowerCase()
    return RESTRICTED_PHRASES.some(phrase => lower.includes(phrase))
}
