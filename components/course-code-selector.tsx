'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { X, Search, Plus } from 'lucide-react'
import { UCSC_COURSE_CODES, searchCourseCodes } from '@/lib/constants/courses'

interface CourseCodeSelectorProps {
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  label?: string
  placeholder?: string
}

export function CourseCodeSelector({
  value,
  onChange,
  disabled,
  label = 'Course Code',
  placeholder = 'Search or enter course code...',
}: CourseCodeSelectorProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<(typeof UCSC_COURSE_CODES)[number][]>([])
  const [customCodes, setCustomCodes] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Debounced search effect (300ms)
  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        // Search predefined codes locally
        const predefinedMatches = searchCourseCodes(query)
        setSuggestions(predefinedMatches)

        // Fetch custom codes from API
        fetchCustomCodes(query)
      }, 300)
      return () => clearTimeout(timeoutId)
    } else {
      setSuggestions([])
      setCustomCodes([])
    }
  }, [query])

  // Fetch custom codes from existing projects
  const fetchCustomCodes = async (searchQuery: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/courses/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()
      setCustomCodes(data.codes || [])
    } catch (error) {
      console.error('Error fetching custom codes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle selection
  const handleSelect = (code: string) => {
    onChange(code)
    setQuery('')
    setIsOpen(false)
  }

  // Handle custom code addition
  const handleAddCustom = () => {
    if (query.trim() && query.trim().length >= 2) {
      onChange(query.trim().toUpperCase())
      setQuery('')
      setIsOpen(false)
    }
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

  // Filter out predefined codes from custom codes to avoid duplicates
  const filteredCustomCodes = customCodes.filter(
    (code) => !UCSC_COURSE_CODES.some((c) => c.code === code)
  )

  return (
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
              {/* Predefined UCSC suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
                    UCSC Courses
                  </p>
                  {suggestions.slice(0, 5).map((course) => (
                    <button
                      key={course.code}
                      type="button"
                      onClick={() => handleSelect(course.code)}
                      className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm"
                    >
                      <span className="font-medium">{course.code}</span>
                      <span className="text-muted-foreground ml-2">
                        - {course.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Custom codes from existing projects */}
              {filteredCustomCodes.length > 0 && (
                <div className="p-2 border-t">
                  <p className="text-xs text-muted-foreground px-2 py-1 font-medium">
                    Used in other projects
                  </p>
                  {filteredCustomCodes.slice(0, 3).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleSelect(code)}
                      className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm"
                    >
                      {code}
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
                    Add &quot;{query.toUpperCase()}&quot; as custom code
                  </Button>
                </div>
              )}

              {/* No results message */}
              {suggestions.length === 0 &&
                filteredCustomCodes.length === 0 &&
                query.length >= 2 &&
                !isLoading && (
                  <p className="p-3 text-sm text-muted-foreground text-center">
                    No matching courses. Add as custom code above.
                  </p>
                )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Search for UCSC course codes or enter a custom code
      </p>
    </div>
  )
}
