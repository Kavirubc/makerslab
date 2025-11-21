'use client'

import React, { Suspense, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '@/lib/hooks/use-notification'
import { Eye, EyeOff } from 'lucide-react'

function LoginForm() {
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    const [error, setError] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const registered = searchParams.get('registered')
    const { success, error: showError } = useNotification()

    // Show success toast when redirected from registration
    useEffect(() => {
        if (registered) {
            success('Registration successful! Please sign in with your credentials.')
        }
    }, [registered, success])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            const errorMessage = 'Please enter a valid email address'
            setError(errorMessage)
            showError(errorMessage)
            setIsLoading(false)
            return
        }

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            if (result?.error) {
                // NextAuth v5 converts errors to "CredentialsSignin"
                // The actual error message is logged server-side but not passed to client
                // We show a generic message, but the server logs will show the actual error
                let errorMessage = 'Invalid email or password'
                
                // Check if error contains any specific information
                if (typeof result.error === 'string' && result.error !== 'CredentialsSignin') {
                    // If NextAuth passes the message through, use it
                    if (result.error.includes('university') || result.error.includes('not registered')) {
                        errorMessage = 'Your university email domain is not registered. Please contact support or request to add your university.'
                    } else if (result.error.includes('banned')) {
                        errorMessage = 'Your account has been banned. Please contact support.'
                    } else {
                        errorMessage = result.error
                    }
                }
                
                setError(errorMessage)
                showError(errorMessage)
            } else if (result?.ok) {
                success('Welcome back! Signing you in...')
                router.push('/dashboard')
                router.refresh()
            }
        } catch (error: any) {
            // Handle any unexpected errors
            const errorMessage = error?.message || 'An error occurred. Please try again.'
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
                            <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
                            <CardDescription className="text-base">
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                {/* Inline error for form validation - toast for API errors */}
                                {error && (
                                    <div className="p-4 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
                                        {error}
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
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                        <Link
                                            href="/forget-password"
                                            className="text-sm text-primary hover:underline font-medium"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            disabled={isLoading}
                                        >
                                            {showPassword ? (
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
                                    {isLoading ? 'Signing in...' : 'Sign in'}
                                </Button>
                                <p className="text-sm text-center text-muted-foreground">
                                    Don&apos;t have an account?{' '}
                                    <Link href="/register" className="text-primary hover:underline font-medium">
                                        Sign up
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

export default function Login() {
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
            <LoginForm />
        </Suspense>
    )
}
