'use client'

import React, { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '@/lib/hooks/use-notification'
import { Eye, EyeOff } from 'lucide-react'

function ResetPasswordForm() {
    const [email, setEmail] = React.useState('')
    const [indexNumber, setIndexNumber] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
    const [error, setError] = React.useState('')
    const [success, setSuccess] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const { success: showSuccess, error: showError } = useNotification()

    React.useEffect(() => {
        const emailParam = searchParams.get('email')
        if (emailParam) {
            setEmail(emailParam)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validation
        if (newPassword !== confirmPassword) {
            const errorMessage = 'Passwords do not match'
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

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, indexNumber, newPassword }),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error || 'An error occurred'
                setError(errorMessage)
                showError(errorMessage)
            } else {
                const successMessage = data.message || 'Password reset successfully'
                setSuccess(successMessage)
                showSuccess(successMessage)
                // Redirect to login page after a short delay
                setTimeout(() => {
                    router.push('/login')
                }, 2000)
            }
        } catch (error) {
            const errorMessage = 'An error occurred. Please try again.'
            setError(errorMessage)
            showError(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md mx-auto lg:max-w-2xl">
                    <Card className="w-full">
                        <CardHeader className="space-y-2 pb-6">
                            <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
                            <CardDescription className="text-base">
                                Enter your email, index number, and new password
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                {/* Inline error for form validation - toast for API responses */}
                                {error && (
                                    <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-4 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-md">
                                        {success}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">University Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="2022is031@ucsc.cmb.ac.lk or student@uom.lk"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="indexNumber" className="text-sm font-medium">Index Number (used as verification)</Label>
                                    <Input
                                        id="indexNumber"
                                        type="text"
                                        placeholder="2022IS031"
                                        value={indexNumber}
                                        onChange={(e) => setIndexNumber(e.target.value.toUpperCase())}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            minLength={6}
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            minLength={6}
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pt-6">
                                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                                    {isLoading ? 'Resetting...' : 'Reset Password'}
                                </Button>
                                <p className="text-sm text-center text-muted-foreground">
                                    Remember your password?{' '}
                                    <Link href="/login" className="text-primary hover:underline font-medium">
                                        Sign in
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default function ResetPassword() {
    return (
        <Suspense fallback={
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Card className="w-full max-w-md mx-auto lg:max-w-2xl">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-3xl font-bold">Loading...</CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}

