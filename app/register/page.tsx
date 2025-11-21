'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotification } from '@/lib/hooks/use-notification'
import { UniversityRequestForm } from '@/components/university-request-form'
import { Eye, EyeOff } from 'lucide-react'

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
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
    const [showUniversityRequestDialog, setShowUniversityRequestDialog] = React.useState(false)
    const router = useRouter()
    const { success, error: showError, info } = useNotification()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
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

        // Basic email format validation (server will check if domain is registered)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            const errorMessage = 'Please enter a valid email address'
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

                // Check if error is due to university not found
                if (errorMessage.includes('university') && (errorMessage.includes('not registered') || errorMessage.includes('not found'))) {
                    // Show university request dialog
                    setShowUniversityRequestDialog(true)
                    info('Your university is not yet supported. Please request to add it below.')
                } else {
                    setError(errorMessage)
                    showError(errorMessage)
                }
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
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="w-full max-w-md mx-auto lg:max-w-2xl">
                    <Card className="w-full">
                        <CardHeader className="space-y-2 pb-6">
                            <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
                            <CardDescription className="text-base">
                                Enter your details to register. Use your university email address.
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
                                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium">University Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="2022is031@ucsc.cmb.ac.lk or student@uom.lk"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={isLoading}
                                        className="h-11"
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            Use your registered university email
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setShowUniversityRequestDialog(true)}
                                            className="text-xs text-primary hover:underline font-medium"
                                            disabled={isLoading}
                                        >
                                            Request new university
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="indexNumber" className="text-sm font-medium">Index Number</Label>
                                        <Input
                                            id="indexNumber"
                                            name="indexNumber"
                                            type="text"
                                            placeholder="2022IS031"
                                            value={formData.indexNumber}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                            className="h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="registrationNumber" className="text-sm font-medium">Reg. Number</Label>
                                        <Input
                                            id="registrationNumber"
                                            name="registrationNumber"
                                            type="text"
                                            placeholder="2022/IS/031"
                                            value={formData.registrationNumber}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
                                            className="h-11"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="At least 8 characters"
                                            value={formData.password}
                                            onChange={handleChange}
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
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Re-enter your password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            required
                                            disabled={isLoading}
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

            {/* University Request Dialog */}
            <Dialog open={showUniversityRequestDialog} onOpenChange={setShowUniversityRequestDialog}>
                <DialogContent className="max-w-3xl sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>University Not Found</DialogTitle>
                        <DialogDescription>
                            Your email domain is not currently supported. Request to add your university below.
                        </DialogDescription>
                    </DialogHeader>
                    <UniversityRequestForm
                        userEmail={formData.email || undefined}
                        onSuccess={() => {
                            setShowUniversityRequestDialog(false)
                            info('Your request has been submitted. Please wait for admin approval before signing up.')
                        }}
                        onCancel={() => {
                            setShowUniversityRequestDialog(false)
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
