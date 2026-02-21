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
    const [showProfile, setShowProfile] = useState(false)
    const initialized = useRef(false)

    // Fetch user profile on mount
    useEffect(() => {
        if (user) {
            getUserProfile(user.id)
                .then(profile => setUserProfile(profile))
                .catch(err => console.error('Failed to load profile:', err))
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
