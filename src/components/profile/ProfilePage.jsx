import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { updateUserProfile } from '../../services/api'
import './ProfilePage.css'

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
        const t = tag.trim()
        if (t && !tags.includes(t)) onChange([...tags, t])
        setInput(''); setShowSuggestions(false)
    }
    const removeTag = (tag) => onChange(tags.filter(t => t !== tag))
    return (
        <div className="profile-tag-wrapper">
            <div className="profile-tag-list">
                {tags.map(tag => (
                    <span key={tag} className="profile-tag">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="profile-tag-remove">×</button>
                    </span>
                ))}
                <input
                    type="text" value={input}
                    onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(input) } }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    placeholder={tags.length === 0 ? placeholder : ''} className="profile-tag-input"
                />
            </div>
            {showSuggestions && input && filtered.length > 0 && (
                <div className="profile-tag-suggestions">
                    {filtered.slice(0, 5).map(s => (
                        <button key={s} type="button" className="profile-tag-suggestion" onMouseDown={() => addTag(s)}>{s}</button>
                    ))}
                </div>
            )}
        </div>
    )
}

export function ProfilePage({ profile, onProfileUpdated, onBack }) {
    const { user } = useAuth()
    const [form, setForm] = useState({
        full_name: profile?.full_name || '',
        age: profile?.age || '',
        gender: profile?.gender || '',
        blood_type: profile?.blood_type || '',
        conditions: profile?.conditions || [],
        medications: profile?.medications || [],
        allergies: profile?.allergies || [],
        notes: profile?.notes || ''
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true); setError(''); setSuccess(false)
        try {
            const data = { ...form, age: form.age ? parseInt(form.age) : null }
            const updated = await updateUserProfile(user.id, data)
            onProfileUpdated(updated)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err) {
            setError('Failed to save changes. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button className="profile-back-btn" onClick={onBack}>← Back to Chat</button>
                <div className="profile-title-row">
                    <div className="profile-avatar-large">
                        {form.full_name ? form.full_name[0].toUpperCase() : user?.email[0].toUpperCase()}
                    </div>
                    <div>
                        <h1>My Health Profile</h1>
                        <p>{user?.email}</p>
                    </div>
                </div>
            </div>

            <form className="profile-form" onSubmit={handleSave}>
                {/* Basic Info */}
                <div className="profile-section">
                    <h3>Basic Information</h3>
                    <div className="profile-form-row">
                        <div className="profile-form-group">
                            <label>Full Name</label>
                            <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} placeholder="Your name" />
                        </div>
                        <div className="profile-form-group">
                            <label>Age</label>
                            <input type="number" value={form.age} onChange={e => update('age', e.target.value)} placeholder="Age" min="1" max="120" />
                        </div>
                    </div>
                    <div className="profile-form-row">
                        <div className="profile-form-group">
                            <label>Gender</label>
                            <select value={form.gender} onChange={e => update('gender', e.target.value)}>
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Non-binary">Non-binary</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </div>
                        <div className="profile-form-group">
                            <label>Blood Type</label>
                            <select value={form.blood_type} onChange={e => update('blood_type', e.target.value)}>
                                <option value="">Select type</option>
                                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Medical */}
                <div className="profile-section">
                    <h3>Medical Details</h3>
                    <div className="profile-form-group">
                        <label>Conditions <span className="profile-hint">(press Enter to add)</span></label>
                        <TagInput tags={form.conditions} onChange={v => update('conditions', v)} placeholder="e.g. Diabetes…" suggestions={CONDITIONS_SUGGESTIONS} />
                    </div>
                    <div className="profile-form-group">
                        <label>Medications <span className="profile-hint">(press Enter to add)</span></label>
                        <TagInput tags={form.medications} onChange={v => update('medications', v)} placeholder="e.g. Metformin 500mg…" />
                    </div>
                    <div className="profile-form-group">
                        <label>Allergies <span className="profile-hint">(press Enter to add)</span></label>
                        <TagInput tags={form.allergies} onChange={v => update('allergies', v)} placeholder="e.g. Penicillin…" />
                    </div>
                    <div className="profile-form-group">
                        <label>Additional Notes</label>
                        <textarea value={form.notes} onChange={e => update('notes', e.target.value)} placeholder="Any other relevant medical information…" rows={3} />
                    </div>
                </div>

                {error && <p className="profile-error">⚠️ {error}</p>}
                {success && <p className="profile-success">✓ Profile saved successfully!</p>}

                <button type="submit" className="profile-save-btn" disabled={loading}>
                    {loading ? 'Saving…' : 'Save Changes'}
                </button>
            </form>
        </div>
    )
}
