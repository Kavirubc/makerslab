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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
                        <CardDescription>
                            Enter your email address to proceed with password reset
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Inline error for form validation - toast for API responses */}
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (must end with .ac.lk)</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="2022is031@ucsc.cmb.ac.lk"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>You will need your index number to reset your password.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
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
    )
}

