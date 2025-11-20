'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Lock, Shield, ExternalLink, Edit } from 'lucide-react'
import { useNotification } from '@/lib/hooks/use-notification'

export default function Settings() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [activeTab, setActiveTab] = React.useState<'account' | 'security' | 'profile'>('account')
    const [currentPassword, setCurrentPassword] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [error, setError] = React.useState('')
    const [success, setSuccess] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const { success: showSuccess, error: showError } = useNotification()

    React.useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    if (!session) {
        return null
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validation
        if (newPassword !== confirmPassword) {
            const errorMessage = 'New passwords do not match'
            setError(errorMessage)
            showError(errorMessage)
            return
        }

        if (newPassword.length < 6) {
            const errorMessage = 'Password must be at least 6 characters long'
            setError(errorMessage)
            showError(errorMessage)
            return
        }

        if (!currentPassword) {
            const errorMessage = 'Current password is required'
            setError(errorMessage)
            showError(errorMessage)
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error || 'An error occurred'
                setError(errorMessage)
                showError(errorMessage)
            } else {
                const successMessage = data.message || 'Password updated successfully'
                setSuccess(successMessage)
                showSuccess(successMessage)
                // Clear form
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (error) {
            const errorMessage = 'An error occurred. Please try again.'
            setError(errorMessage)
            showError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    const tabs = [
        { id: 'account' as const, label: 'Account', icon: User },
        { id: 'security' as const, label: 'Security', icon: Lock },
        { id: 'profile' as const, label: 'Profile', icon: Edit },
    ]

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-background">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Settings</h1>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-4">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="">
                                <nav className="space-y-1">
                                    {tabs.map((tab) => {
                                        const Icon = tab.icon
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    activeTab === tab.id
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                {tab.label}
                                            </button>
                                        )
                                    })}
                                </nav>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Account Tab */}
                        {activeTab === 'account' && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Account Information</CardTitle>
                                        <CardDescription>
                                            Your account details and basic information
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                value={session.user?.email || ''}
                                                disabled
                                                className="bg-muted"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Your email address cannot be changed
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Full Name</Label>
                                            <Input
                                                value={session.user?.name || ''}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Index Number</Label>
                                            <Input
                                                value={(session.user)?.indexNumber || ''}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Registration Number</Label>
                                            <Input
                                                value={(session.user)?.registrationNumber || ''}
                                                disabled
                                                className="bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Role</Label>
                                            <Input
                                                value={(session.user)?.role || 'user'}
                                                disabled
                                                className="bg-muted capitalize"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Quick Actions</CardTitle>
                                        <CardDescription>
                                            Common account management tasks
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Link href="/profile/edit" className="block">
                                            <Button variant="outline" className="w-full justify-start">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Edit Profile
                                            </Button>
                                        </Link>
                                        <Link href={`/profile/${session.user?.id}`} className="block">
                                            <Button variant="outline" className="w-full justify-start">
                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                View Public Profile
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>
                                            Update your password to keep your account secure
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handlePasswordChange} className="space-y-4">
                                            {/* Inline error for form validation - toast for API responses */}
                                            {error && (
                                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
                                                    {error}
                                                </div>
                                            )}
                                            <div className="space-y-2">
                                                <Label htmlFor="currentPassword">Current Password</Label>
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    placeholder="Enter your current password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="newPassword">New Password</Label>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    placeholder="Enter your new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    minLength={6}
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Password must be at least 6 characters long
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm your new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    required
                                                    disabled={isLoading}
                                                    minLength={6}
                                                />
                                            </div>
                                            <Button type="submit" disabled={isLoading}>
                                                {isLoading ? 'Updating...' : 'Update Password'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Password Recovery</CardTitle>
                                        <CardDescription>
                                            If you forgot your password, you can reset it using your index number
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('/forget-password')}
                                        >
                                            Reset Password
                                        </Button>
                                    </CardContent>
                                </Card>
                            </>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Settings</CardTitle>
                                    <CardDescription>
                                        Manage your public profile information
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Update your profile picture, bio, CV, and social links to make your profile stand out.
                                    </p>
                                    <Link href="/profile/edit">
                                        <Button className="w-full">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    </Link>
                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium mb-2">What you can edit:</h4>
                                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                            <li>Profile picture</li>
                                            <li>Bio and description</li>
                                            <li>CV/Resume upload</li>
                                            <li>LinkedIn and GitHub links</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
