'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotification } from '@/lib/hooks/use-notification'
import { isValidAcademicEmail, extractEmailDomain } from '@/lib/utils/email'

interface UniversityRequestFormProps {
  userEmail?: string // Pre-fill email domain from user's email
  onSuccess?: () => void // Callback when request is successfully submitted
  onCancel?: () => void // Callback when user cancels
}

export function UniversityRequestForm({ userEmail, onSuccess, onCancel }: UniversityRequestFormProps) {
  const [formData, setFormData] = React.useState({
    name: '',
    facultyName: '',
    district: '',
    province: '',
    emailDomain: userEmail ? extractEmailDomain(userEmail) : '',
    reason: ''
  })
  const [error, setError] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const { success, error: showError } = useNotification()

  // Update email domain when userEmail changes
  React.useEffect(() => {
    if (userEmail) {
      const domain = extractEmailDomain(userEmail)
      setFormData(prev => ({ ...prev, emailDomain: domain }))
    }
  }, [userEmail])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const validateForm = (): boolean => {
    // Validate required fields
    if (!formData.name.trim()) {
      setError('University name is required')
      showError('University name is required')
      return false
    }

    if (!formData.district.trim()) {
      setError('District is required')
      showError('District is required')
      return false
    }

    if (!formData.province.trim()) {
      setError('Province is required')
      showError('Province is required')
      return false
    }

    if (!formData.emailDomain.trim()) {
      setError('Email domain is required')
      showError('Email domain is required')
      return false
    }

    // Validate email domain format (basic structure check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(`test@${formData.emailDomain}`)) {
      setError('Please enter a valid email domain format (e.g., ucsc.cmb.ac.lk or uom.lk)')
      showError('Please enter a valid email domain format (e.g., ucsc.cmb.ac.lk or uom.lk)')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/universities/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          facultyName: formData.facultyName.trim() || null,
          district: formData.district.trim(),
          province: formData.province.trim(),
          emailDomain: formData.emailDomain.trim(),
          reason: formData.reason.trim() || null,
          // Only send userEmail if it's a valid email format (for tracking purposes)
          userEmail: (userEmail && isValidAcademicEmail(userEmail)) ? userEmail : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to submit university request'
        setError(errorMessage)
        showError(errorMessage)
        return
      }

      // Success - show message and call callback
      success('University request submitted successfully! An admin will review your request shortly.')

      // Reset form
      setFormData({
        name: '',
        facultyName: '',
        district: '',
        province: '',
        emailDomain: userEmail ? extractEmailDomain(userEmail) : '',
        reason: ''
      })

      // Call success callback if provided
      if (onSuccess) {
        onSuccess()
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Request University Addition</CardTitle>
        <CardDescription>
          Your email domain is not currently supported. Please provide details about your university so we can add it to the platform.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Error display */}
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
              {error}
            </div>
          )}

          {/* University Name */}
          <div className="space-y-2">
            <Label htmlFor="name">University Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="University of Colombo School of Computing"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          {/* Faculty Name - Optional */}
          <div className="space-y-2">
            <Label htmlFor="facultyName">Faculty Name (Optional)</Label>
            <Input
              id="facultyName"
              name="facultyName"
              type="text"
              placeholder="Faculty of Engineering"
              value={formData.facultyName}
              onChange={handleChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Only include if your university has different email domains for different faculties.
              This helps other students from the same faculty find and add their faculty if needed.
            </p>
          </div>

          {/* Email Domain */}
          <div className="space-y-2">
            <Label htmlFor="emailDomain">Email Domain *</Label>
            <Input
              id="emailDomain"
              name="emailDomain"
              type="text"
              placeholder="ucsc.cmb.ac.lk or uom.lk"
              value={formData.emailDomain}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the email domain (e.g., ucsc.cmb.ac.lk, uom.lk, pdn.ac.lk)
            </p>
          </div>

          {/* District and Province */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                name="district"
                type="text"
                placeholder="Colombo"
                value={formData.district}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Input
                id="province"
                name="province"
                type="text"
                placeholder="Western"
                value={formData.province}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Reason - Optional */}
          <div className="space-y-2">
            <Label htmlFor="reason">Additional Information (Optional)</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Any additional information about your university or faculty..."
              value={formData.reason}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </CardContent>
        <div className="px-6 flex gap-3 mt-5">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            className={onCancel ? "flex-1" : "w-full"}
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

