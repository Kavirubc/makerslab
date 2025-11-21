'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '@/lib/hooks/use-notification'

export default function ForgetPassword() {
    const [email, setEmail] = React.useState('')
    const [error, setError] = React.useState('')
    const [success, setSuccess] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const { success: showSuccess, error: showError } = useNotification()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/forget-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error || 'An error occurred'
                setError(errorMessage)
                showError(errorMessage)
            } else {
                const successMessage = data.message || 'Reset instructions sent successfully'
                setSuccess(successMessage)
                showSuccess(successMessage)
                // Redirect to reset password page after a short delay
                setTimeout(() => {
                    router.push(`/reset-password?email=${encodeURIComponent(email)}`)
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
                            <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
                            <CardDescription className="text-base">
                                Enter your email address to proceed with password reset
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
                                <div className="text-sm text-muted-foreground">
                                    <p>You will need your index number to reset your password.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pt-6">
                                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Continue'}
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

