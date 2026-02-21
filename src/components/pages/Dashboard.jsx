import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { createNewChat, getUserProfile } from '../../services/api'
import { Sidebar } from '../layout/Sidebar'
import { ChatContainer } from '../chat/ChatContainer'
import { OnboardingWizard } from '../profile/OnboardingWizard'
import { ProfilePage } from '../profile/ProfilePage'
import './Dashboard.css'

export function Dashboard() {
    const { user } = useAuth()
    const [currentChatId, setCurrentChatId] = useState(null)
    const [userProfile, setUserProfile] = useState(null)
    const [profileLoading, setProfileLoading] = useState(true)
    const [profileError, setProfileError] = useState(null)
    const [showProfile, setShowProfile] = useState(false)
    const initialized = useRef(false)

    // Fetch user profile on mount
    useEffect(() => {
        if (user) {
            getUserProfile(user.id)
                .then(profile => setUserProfile(profile))
                .catch(err => {
                    console.error('Failed to load profile:', err)
                    // Detect missing table (Supabase returns 404 when table doesn't exist)
                    const msg = err?.message || ''
                    if (err?.code === '42P01' || msg.includes('does not exist') || msg.includes('404') || err?.status === 404) {
                        setProfileError('setup_required')
                    } else {
                        setProfileError('load_failed')
                    }
                })
                .finally(() => setProfileLoading(false))
        }
    }, [user])

    // Create initial chat after profile loaded
    useEffect(() => {
        if (user && !initialized.current && !profileLoading && userProfile?.onboarding_complete) {
            initialized.current = true
            createNewChat(user.id, 'New Conversation')
                .then(chat => setCurrentChatId(chat.id))
                .catch(err => console.error('Failed to create initial chat:', err))
        }
    }, [user, profileLoading, userProfile])

    // Show loading state while profile is being fetched
    if (profileLoading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-spinner">⚕️</div>
                <p>Loading your profile…</p>
            </div>
        )
    }

    // Table doesn't exist yet — show setup instructions
    if (profileError === 'setup_required') {
        return (
            <div className="dashboard-setup-error">
                <div className="setup-error-card">
                    <div className="setup-error-icon">⚠️</div>
                    <h2>Database Setup Required</h2>
                    <p>The <code>user_profiles</code> table hasn't been created yet in Supabase.</p>
                    <p className="setup-steps-label">Run this SQL in your Supabase SQL Editor:</p>
                    <pre className="setup-sql">{`create table user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  full_name text, age integer, gender text, blood_type text,
  conditions text[], medications text[], allergies text[],
  notes text, onboarding_complete boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table user_profiles enable row level security;
create policy "Users can manage own profile" on user_profiles
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);`}</pre>
                    <button className="setup-reload-btn" onClick={() => window.location.reload()}>
                        ↺ Reload after running SQL
                    </button>
                </div>
            </div>
        )
    }

    // Generic load failure
    if (profileError === 'load_failed') {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-spinner">⚠️</div>
                <p>Could not load your profile. Please refresh the page.</p>
                <button className="setup-reload-btn" onClick={() => window.location.reload()}>↺ Refresh</button>
            </div>
        )
    }

    // Show onboarding if profile doesn't exist or isn't complete
    if (!userProfile || !userProfile.onboarding_complete) {
        return (
            <OnboardingWizard
                user={user}
                onComplete={(profile) => {
                    setUserProfile(profile)
                    // Create first chat after onboarding
                    createNewChat(user.id, 'New Conversation')
                        .then(chat => setCurrentChatId(chat.id))
                        .catch(err => console.error('Failed to create chat:', err))
                }}
            />
        )
    }

    return (
        <div className="dashboard">
            <Sidebar
                currentChatId={currentChatId}
                onSelectChat={(id) => { setCurrentChatId(id); setShowProfile(false) }}
                onNewChat={(id) => { setCurrentChatId(id); setShowProfile(false) }}
                onShowProfile={() => setShowProfile(true)}
                userProfile={userProfile}
            />
            <div className="dashboard-main">
                {showProfile ? (
                    <ProfilePage
                        profile={userProfile}
                        onProfileUpdated={setUserProfile}
                        onBack={() => setShowProfile(false)}
                    />
                ) : (
                    <ChatContainer chatId={currentChatId} userProfile={userProfile} />
                )}
            </div>
        </div>
    )
}
