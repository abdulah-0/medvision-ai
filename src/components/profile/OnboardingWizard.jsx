import { useState } from 'react'
import { saveUserProfile } from '../../services/api'
import './OnboardingWizard.css'

const CONDITIONS_SUGGESTIONS = [
    'Diabetes (Type 1)', 'Diabetes (Type 2)', 'Hypertension', 'Asthma', 'COPD',
    'Heart Disease', 'Arthritis', 'Depression', 'Anxiety', 'Thyroid Disorder',
    'Kidney Disease', 'Liver Disease', 'Cancer', 'Stroke', 'Epilepsy',
    'Migraine', 'Osteoporosis', 'Sleep Apnea', 'Anemia', 'Obesity'
]
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']

function TagInput({ tags, onChange, placeholder, suggestions = [] }) {
    const [input, setInput] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)

    const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
    )

    const addTag = (tag) => {
        const trimmed = tag.trim()
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed])
        }
        setInput('')
        setShowSuggestions(false)
    }

    const removeTag = (tag) => onChange(tags.filter(t => t !== tag))

    return (
        <div className="tag-input-wrapper">
            <div className="tag-list">
                {tags.map(tag => (
                    <span key={tag} className="tag-item">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="tag-remove">×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={input}
                    onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(input) } }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="tag-input"
                />
            </div>
            {showSuggestions && input && filtered.length > 0 && (
                <div className="tag-suggestions">
                    {filtered.slice(0, 5).map(s => (
                        <button key={s} type="button" className="tag-suggestion-item" onMouseDown={() => addTag(s)}>
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function OnboardingWizard({ user, onComplete }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [form, setForm] = useState({
        full_name: '',
        age: '',
        gender: '',
        blood_type: '',
        conditions: [],
        medications: [],
        allergies: [],
        notes: ''
    })

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSubmit = async () => {
        setLoading(true)
        setError('')
        try {
            const profileData = { ...form, age: form.age ? parseInt(form.age) : null }
            const profile = await saveUserProfile(user.id, profileData)
            onComplete(profile)
        } catch (err) {
            setError('Failed to save profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-card">
                {/* Header */}
                <div className="onboarding-header">
                    <div className="onboarding-logo">
                        <div className="onboarding-logo-icon">⚕️</div>
                        <span className="onboarding-logo-text">MedVision AI</span>
                    </div>
                    <h1>Set Up Your Health Profile</h1>
                    <p>Help us personalize your experience with tailored medical insights</p>
                </div>

                {/* Step indicator */}
                <div className="onboarding-steps">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className={`onboarding-step-dot ${s <= step ? 'active' : ''} ${s < step ? 'done' : ''}`}>
                            {s < step ? '✓' : s}
                        </div>
                    ))}
                </div>

                {/* Step content */}
                <div className="onboarding-body">
                    {step === 1 && (
                        <div className="onboarding-step">
                            <h2>Basic Information</h2>
                            <p className="step-subtitle">Tell us a bit about yourself</p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Your name" />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="Years" min="1" max="120" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select value={form.gender} onChange={e => update('gender', e.target.value)}>
                                        <option value="">Select gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Non-binary">Non-binary</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Blood Type</label>
                                    <select value={form.blood_type} onChange={e => update('blood_type', e.target.value)}>
                                        <option value="">Select type</option>
                                        {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="onboarding-step">
                            <h2>Medical Conditions</h2>
                            <p className="step-subtitle">Add any existing health conditions</p>
                            <div className="form-group">
                                <label>Conditions <span className="label-hint">(type or select, press Enter to add)</span></label>
                                <TagInput
                                    tags={form.conditions}
                                    onChange={val => update('conditions', val)}
                                    placeholder="e.g. Diabetes, Hypertension…"
                                    suggestions={CONDITIONS_SUGGESTIONS}
                                />
                            </div>
                            <p className="step-notice">ℹ️ This information helps the AI give you relevant, personalized responses.</p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="onboarding-step">
                            <h2>Medications & Allergies</h2>
                            <p className="step-subtitle">List your current medications and known allergies</p>
                            <div className="form-group">
                                <label>Current Medications <span className="label-hint">(press Enter to add)</span></label>
                                <TagInput
                                    tags={form.medications}
                                    onChange={val => update('medications', val)}
                                    placeholder="e.g. Metformin 500mg…"
                                />
                            </div>
                            <div className="form-group">
                                <label>Allergies <span className="label-hint">(press Enter to add)</span></label>
                                <TagInput
                                    tags={form.allergies}
                                    onChange={val => update('allergies', val)}
                                    placeholder="e.g. Penicillin, Peanuts…"
                                />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="onboarding-step">
                            <h2>Confirm Your Profile</h2>
                            <p className="step-subtitle">Review before saving</p>
                            <div className="profile-summary">
                                <div className="summary-row"><span>Name</span><strong>{form.full_name || '—'}</strong></div>
                                <div className="summary-row"><span>Age</span><strong>{form.age || '—'}</strong></div>
                                <div className="summary-row"><span>Gender</span><strong>{form.gender || '—'}</strong></div>
                                <div className="summary-row"><span>Blood Type</span><strong>{form.blood_type || '—'}</strong></div>
                                <div className="summary-row">
                                    <span>Conditions</span>
                                    <strong>{form.conditions.length ? form.conditions.join(', ') : 'None'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Medications</span>
                                    <strong>{form.medications.length ? form.medications.join(', ') : 'None'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Allergies</span>
                                    <strong>{form.allergies.length ? form.allergies.join(', ') : 'None'}</strong>
                                </div>
                            </div>
                            {error && <p className="onboarding-error">⚠️ {error}</p>}
                            <p className="step-notice">✅ You can update your profile anytime from the sidebar.</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="onboarding-footer">
                    {step > 1 && (
                        <button className="btn-onboarding-back" onClick={() => setStep(s => s - 1)}>
                            ← Back
                        </button>
                    )}
                    {step < 4 ? (
                        <button className="btn-onboarding-next" onClick={() => setStep(s => s + 1)}>
                            Continue →
                        </button>
                    ) : (
                        <button className="btn-onboarding-submit" onClick={handleSubmit} disabled={loading}>
                            {loading ? 'Saving…' : '✓ Save & Start Chatting'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
