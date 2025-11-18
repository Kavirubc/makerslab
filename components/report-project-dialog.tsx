'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { uploadFile, validateImageFile } from '@/lib/firebase-client'
import { REPORT_REASONS, MAX_EVIDENCE_IMAGES, MAX_EVIDENCE_IMAGE_SIZE } from '@/lib/constants/reports'
import { X, Upload, AlertCircle } from 'lucide-react'

interface ReportProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectTitle: string
}

export function ReportProjectDialog({
  open,
  onOpenChange,
  projectId,
  projectTitle,
}: ReportProjectDialogProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState('')

  // Form state
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([])
  const [evidencePreviews, setEvidencePreviews] = useState<string[]>([])

  // Handle evidence image selection
  const handleEvidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Check max images limit
    if (evidenceFiles.length + files.length > MAX_EVIDENCE_IMAGES) {
      setError(`Maximum ${MAX_EVIDENCE_IMAGES} images allowed`)
      return
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > MAX_EVIDENCE_IMAGE_SIZE) {
        setError(`Image "${file.name}" exceeds ${MAX_EVIDENCE_IMAGE_SIZE / (1024 * 1024)}MB limit`)
        return
      }

      // Validate file type
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid image file')
        return
      }
    }

    // Add files and create previews
    setEvidenceFiles([...evidenceFiles, ...files])
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setEvidencePreviews([...evidencePreviews, ...newPreviews])
    setError('')
  }

  // Remove evidence image
  const handleRemoveEvidence = (index: number) => {
    // Revoke object URL to prevent memory leak
    URL.revokeObjectURL(evidencePreviews[index])
    
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index))
    setEvidencePreviews(evidencePreviews.filter((_, i) => i !== index))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate form
    if (!reason) {
      setError('Please select a reason for reporting')
      setIsLoading(false)
      return
    }

    if (!description.trim()) {
      setError('Please provide a description')
      setIsLoading(false)
      return
    }

    try {
      // Upload evidence images to Firebase
      const evidenceUrls: string[] = []
      
      if (evidenceFiles.length > 0) {
        setUploadProgress('Uploading evidence images...')
        
        for (const file of evidenceFiles) {
          const fileName = `report_${Date.now()}_${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`
          const url = await uploadFile(file, 'report-evidence', fileName)
          evidenceUrls.push(url)
        }
      }

      setUploadProgress('Submitting report...')

      // Submit report to API
      const response = await fetch(`/api/projects/${projectId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          description: description.trim(),
          evidenceUrls,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit report')
      }

      // Success - close dialog and refresh
      onOpenChange(false)
      router.refresh()
      
      // Reset form
      setReason('')
      setDescription('')
      setEvidenceFiles([])
      evidencePreviews.forEach(url => URL.revokeObjectURL(url))
      setEvidencePreviews([])
    } catch (err: any) {
      setError(err.message || 'Failed to submit report')
    } finally {
      setIsLoading(false)
      setUploadProgress('')
    }
  }

  // Cleanup preview URLs on unmount
  const handleClose = () => {
    evidencePreviews.forEach(url => URL.revokeObjectURL(url))
    setEvidencePreviews([])
    setEvidenceFiles([])
    setReason('')
    setDescription('')
    setError('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Project</DialogTitle>
          <DialogDescription>
            Report "{projectTitle}" for review. Please provide details about the issue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Reporting *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason" className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <div>
                      <div className="font-medium">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>

          {/* Evidence Upload */}
          <div className="space-y-2">
            <Label htmlFor="evidence">Evidence Images (Optional)</Label>
            <p className="text-sm text-muted-foreground">
              Upload up to {MAX_EVIDENCE_IMAGES} images as evidence. Max {MAX_EVIDENCE_IMAGE_SIZE / (1024 * 1024)}MB per image.
            </p>
            
            {evidenceFiles.length < MAX_EVIDENCE_IMAGES && (
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="evidence"
                  accept="image/*"
                  multiple
                  onChange={handleEvidenceChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label htmlFor="evidence">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isLoading}
                    asChild
                  >
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </span>
                  </Button>
                </label>
              </div>
            )}

            {/* Evidence Previews */}
            {evidencePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {evidencePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-32 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidence(index)}
                      className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Progress */}
          {uploadProgress && (
            <p className="text-sm text-muted-foreground">{uploadProgress}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

