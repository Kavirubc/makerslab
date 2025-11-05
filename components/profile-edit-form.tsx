'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Upload, FileText, Loader2 } from 'lucide-react'
import {
  uploadFile,
  validateImageFile,
  validateImageAspectRatio,
  validateCVFile
} from '@/lib/firebase-client'

interface ProfileEditFormProps {
  user: {
    _id: string
    name: string
    email: string
    profilePicture?: string | null
    bio?: string | null
    cv?: string | null
    cvUpdatedAt?: string | null
    linkedin?: string | null
    github?: string | null
  }
}

export function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  // Form state
  const [bio, setBio] = useState(user.bio || '')
  const [linkedin, setLinkedin] = useState(user.linkedin || '')
  const [github, setGithub] = useState(user.github || '')

  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    user.profilePicture || null
  )

  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvFileName, setCvFileName] = useState<string>(
    user.cv ? 'Current CV' : ''
  )

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file')
      return
    }

    // Validate aspect ratio
    const aspectValidation = await validateImageAspectRatio(file)
    if (!aspectValidation.valid) {
      setError(aspectValidation.error || 'Invalid image dimensions')
      return
    }

    setProfilePicture(file)
    setProfilePicturePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleCVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateCVFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid CV file')
      return
    }

    setCvFile(file)
    setCvFileName(file.name)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      let profilePictureUrl = user.profilePicture
      let cvUrl = user.cv

      // Upload profile picture if changed
      if (profilePicture) {
        setUploadProgress('Uploading profile picture...')
        const fileName = `${user._id}_${Date.now()}.${profilePicture.name.split('.').pop()}`
        profilePictureUrl = await uploadFile(profilePicture, 'profile-pictures', fileName)
      }

      // Upload CV if changed
      if (cvFile) {
        setUploadProgress('Uploading CV...')
        const fileName = `${user._id}_cv_${Date.now()}.pdf`
        cvUrl = await uploadFile(cvFile, 'cvs', fileName)
      }

      setUploadProgress('Saving profile...')

      // Update profile via API
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio,
          linkedin: linkedin || undefined,
          github: github || undefined,
          profilePicture: profilePictureUrl || undefined,
          cv: cvUrl || undefined,
          cvUpdatedAt: cvFile ? new Date().toISOString() : user.cvUpdatedAt
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      router.push(`/profile/${user._id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
      setUploadProgress('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-md">
          {error}
        </div>
      )}

      {uploadProgress && (
        <div className="p-3 text-sm text-primary bg-primary/10 border border-primary/20 rounded-md flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {uploadProgress}
        </div>
      )}

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-4">
            <Label>Profile Picture</Label>
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profilePicturePreview || undefined} />
                <AvatarFallback className="text-2xl">
                  {user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  disabled={isLoading}
                  className="hidden"
                />
                <label htmlFor="profilePicture">
                  <Button type="button" variant="outline" disabled={isLoading} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {profilePicturePreview ? 'Change Photo' : 'Upload Photo'}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground mt-2">
                  Square image (1:1), max 2MB. PNG, JPG accepted.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself, your interests, and what you're working on..."
              rows={4}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">CV/Resume</h3>

          <div className="space-y-2">
            <Label htmlFor="cv">Upload CV (PDF only)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="cv"
                type="file"
                accept=".pdf"
                onChange={handleCVChange}
                disabled={isLoading}
                className="hidden"
              />
              <label htmlFor="cv" className="flex-1">
                <Button type="button" variant="outline" disabled={isLoading} className="w-full" asChild>
                  <span>
                    <FileText className="h-4 w-4 mr-2" />
                    {cvFileName || 'Choose PDF'}
                  </span>
                </Button>
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              PDF only, max 5MB. {user.cvUpdatedAt && `Last updated: ${new Date(user.cvUpdatedAt).toLocaleDateString()}`}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold">Social Links</h3>

          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="github">GitHub Profile</Label>
            <Input
              id="github"
              type="url"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/yourusername"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
