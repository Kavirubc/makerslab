'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '@/lib/hooks/use-notification'

export default function Register() {
    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        indexNumber: '',
        registrationNumber: ''
    })
    const [error, setError] = React.useState('')
    const [isLoading, setIsLoading] = React.useState(false)
    const router = useRouter()
    const { success, error: showError } = useNotification()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const validateEmail = (email: string): boolean => {
        return email.toLowerCase().endsWith('.ac.lk')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.indexNumber || !formData.registrationNumber) {
            const errorMessage = 'All fields are required'
            setError(errorMessage)
            showError(errorMessage)
            return
        }

        if (!validateEmail(formData.email)) {
            const errorMessage = 'Email must end with .ac.lk (e.g., 2022is031@ucsc.cmb.ac.lk)'
            setError(errorMessage)
            showError(errorMessage)
            return
        }

        if (formData.password.length < 8) {
            const errorMessage = 'Password must be at least 8 characters long'
            setError(errorMessage)
            showError(errorMessage)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            const errorMessage = 'Passwords do not match'
            setError(errorMessage)
            showError(errorMessage)
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    indexNumber: formData.indexNumber,
                    registrationNumber: formData.registrationNumber
                })
            })

            const data = await response.json()

            if (!response.ok) {
                const errorMessage = data.error || 'An error occurred during registration'
                setError(errorMessage)
                showError(errorMessage)
                return
            }

            // Registration successful, redirect to login
            success('Account created successfully! Redirecting to login...')
            router.push('/login?registered=true')
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
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription className="mb-4">
                            Enter your details to register. Only .ac.lk emails are accepted.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {/* Inline error for form validation - toast for API errors */}
                            {error && (
                                <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">University Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="2022is031@ucsc.cmb.ac.lk"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must end with .ac.lk
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="indexNumber">Index Number</Label>
                                    <Input
                                        id="indexNumber"
                                        name="indexNumber"
                                        type="text"
                                        placeholder="2022IS031"
                                        value={formData.indexNumber}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registrationNumber">Reg. Number</Label>
                                    <Input
                                        id="registrationNumber"
                                        name="registrationNumber"
                                        type="text"
                                        placeholder="2022/IS/031"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Re-enter your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 pt-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Creating account...' : 'Create account'}
                            </Button>
                            <p className="text-sm text-center text-muted-foreground">
                                Already have an account?{' '}
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
