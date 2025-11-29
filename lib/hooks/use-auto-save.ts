'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseAutoSaveOptions<T> {
  projectId?: string // undefined for new projects
  data: T
  enabled: boolean // only auto-save when in draft mode
  debounceMs?: number // default 2000ms
  onSave?: (projectId: string) => void
  onError?: (error: string) => void
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus
  lastSavedAt: Date | null
  save: () => Promise<string | null> // returns projectId on success
  error: string | null
}

/**
 * Auto-save hook with debouncing for project drafts
 * Saves data to /api/projects or /api/projects/[id] depending on whether projectId exists
 */
export function useAutoSave<T extends Record<string, unknown>>({
  projectId,
  data,
  enabled,
  debounceMs = 2000,
  onSave,
  onError,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle')
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // refs to track latest values without triggering effects
  const dataRef = useRef(data)
  const projectIdRef = useRef(projectId)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<string>('')

  // update refs when values change
  useEffect(() => {
    dataRef.current = data
    projectIdRef.current = projectId
  }, [data, projectId])

  // core save function
  const performSave = useCallback(async (): Promise<string | null> => {
    const currentData = dataRef.current
    const currentProjectId = projectIdRef.current
    const dataString = JSON.stringify(currentData)

    // skip if data hasn't changed
    if (dataString === lastSavedDataRef.current) {
      return currentProjectId || null
    }

    setStatus('saving')
    setError(null)

    try {
      let response: Response
      let result: { projectId?: string; message?: string; error?: string }

      if (currentProjectId) {
        // update existing draft via PATCH
        response = await fetch(`/api/projects/${currentProjectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentData, isDraft: true }),
        })
      } else {
        // create new draft via POST
        response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentData, isDraft: true }),
        })
      }

      result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save')
      }

      const savedProjectId = result.projectId || currentProjectId
      lastSavedDataRef.current = dataString
      setLastSavedAt(new Date())
      setStatus('saved')

      if (savedProjectId && onSave) {
        onSave(savedProjectId)
      }

      return savedProjectId || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed'
      setError(errorMessage)
      setStatus('error')
      if (onError) {
        onError(errorMessage)
      }
      return null
    }
  }, [onSave, onError])

  // debounced auto-save effect
  useEffect(() => {
    if (!enabled) {
      return
    }

    // clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      performSave()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, enabled, debounceMs, performSave])

  // manual save function (bypasses debounce)
  const save = useCallback(async (): Promise<string | null> => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    return performSave()
  }, [performSave])

  return {
    status,
    lastSavedAt,
    save,
    error,
  }
}
