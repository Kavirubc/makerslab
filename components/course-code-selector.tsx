'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { X, Search, Plus, Clock } from 'lucide-react'
import { useNotification } from '@/lib/hooks/use-notification'

interface CourseResult {
  code: string
  name: string
  year?: number
  source: 'catalog' | 'projects'
}

interface CourseCodeSelectorProps {
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  label?: string
  placeholder?: string
  projectId?: string // Optional project ID to associate with request
}

export function CourseCodeSelector({
  value,
  onChange,
  disabled,
  label = 'Course Code',
  placeholder = 'Search or enter course code...',
  projectId,
}: CourseCodeSelectorProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [courses, setCourses] = useState<CourseResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [pendingCode, setPendingCode] = useState('')
  const [courseName, setCourseName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { success, error: showError } = useNotification()

  // Debounced search effect (300ms)
  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        fetchCourses(query)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setCourses([])
    }
  }, [query])

  // Fetch courses from API (filtered by user's university)
  const fetchCourses = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/courses/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      setCourses(data.courses || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle selection from catalog
  const handleSelect = (code: string) => {
    onChange(code)
    setQuery('')
    setIsOpen(false)
  }

  // Handle custom code - open dialog to get more info and submit request
  const handleAddCustom = () => {
    if (query.trim() && query.trim().length >= 2) {
      const code = query.trim().toUpperCase()
      // Check if this code is already in catalog
      const isInCatalog = courses.some(
        (c) => c.source === 'catalog' && c.code.toUpperCase() === code
      )

      if (isInCatalog) {
        // Just select it directly
        handleSelect(code)
      } else {
        // Open dialog to submit request
        setPendingCode(code)
        setCourseName('')
        setRequestDialogOpen(true)
        setIsOpen(false)
      }
    }
  }

  // Submit course request
  const handleSubmitRequest = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/courses/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: pendingCode,
          name: courseName,
          projectId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        success('Course request submitted for admin approval')
        // Still set the code on the project - it will work once approved
        onChange(pendingCode)
        setRequestDialogOpen(false)
        setQuery('')
      } else if (response.status === 400 && data.courseId) {
        // Course already exists in catalog
        onChange(pendingCode)
        setRequestDialogOpen(false)
        setQuery('')
      } else {
        throw new Error(data.error || 'Failed to submit request')
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit request'
      showError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Skip request and just use code
  const handleSkipRequest = () => {
    onChange(pendingCode)
    setRequestDialogOpen(false)
    setQuery('')
  }

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Separate courses by source
  const catalogCourses = courses.filter((c) => c.source === 'catalog')
  const projectCourses = courses.filter((c) => c.source === 'projects')

  return (
    <>
      <div className="space-y-2" ref={wrapperRef}>
        <Label>{label}</Label>

        {/* Selected value display */}
        {value && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              {value}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => !disabled && onChange('')}
              />
            </Badge>
          </div>
        )}

        {/* Search input - only show when no value selected */}
        {!value && (
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setIsOpen(true)
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                disabled={disabled}
                className="pl-9"
              />
              {isLoading && (
                <div className="absolute right-3 top-2.5 text-muted-foreground text-sm">
                  ...
                </div>
              )}
            </div>

            {/* Suggestions dropdown */}
            {isOpen && query.length >= 2 && (
              <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
                {/* Catalog courses (from admin-managed course list) */}
                {catalogCourses.length > 0 && (
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
                      University Courses
                    </p>
                    {catalogCourses.slice(0, 8).map((course) => (
                      <button
                        key={course.code}
                        type="button"
                        onClick={() => handleSelect(course.code)}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm"
                      >
                        <span className="font-medium">{course.code}</span>
                        {course.name && (
                          <span className="text-muted-foreground ml-2">
                            - {course.name}
                          </span>
                        )}
                        {course.year && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (Year {course.year})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Project codes (from existing projects) */}
                {projectCourses.length > 0 && (
                  <div className="p-2 border-t">
                    <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
                      Used in other projects
                    </p>
                    {projectCourses.slice(0, 3).map((course) => (
                      <button
                        key={course.code}
                        type="button"
                        onClick={() => handleSelect(course.code)}
                        className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm"
                      >
                        {course.code}
                      </button>
                    ))}
                  </div>
                )}

                {/* Add custom code option */}
                {query.length >= 2 && (
                  <div className="p-2 border-t">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddCustom}
                      className="w-full justify-start text-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Request &quot;{query.toUpperCase()}&quot; as new course
                    </Button>
                  </div>
                )}

                {/* No results message */}
                {courses.length === 0 && query.length >= 2 && !isLoading && (
                  <p className="p-3 text-sm text-muted-foreground text-center">
                    No matching courses. Request a new course above.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Search for course codes or request a new one
        </p>
      </div>

      {/* Request Dialog */}
      <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Request New Course
            </DialogTitle>
            <DialogDescription>
              This course code isn&apos;t in our catalog yet. Submit a request for admin approval.
              You can still use this code on your project while it&apos;s pending.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Course Code</Label>
              <Input value={pendingCode} disabled className="font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Course Name (optional but helpful)</Label>
              <Input
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Database Management Systems"
              />
              <p className="text-xs text-muted-foreground">
                Providing a name helps admins approve your request faster
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleSkipRequest}>
              Skip & Use Code
            </Button>
            <Button onClick={handleSubmitRequest} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
