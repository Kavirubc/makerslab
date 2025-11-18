"use client"

import { toast } from "sonner"

/**
 * Custom notification hook that provides easy-to-use toast methods
 * with glassy styling matching the application's color scheme
 */
export const useNotification = () => {
  /**
   * Show a success toast with glassy green styling
   * @param message - Success message to display
   * @param duration - Duration in milliseconds (default: 3000)
   */
  const success = (message: string, duration = 3000) => {
    toast.success(message, {
      duration,
    })
  }

  /**
   * Show an error toast with glassy red styling
   * @param message - Error message to display
   * @param duration - Duration in milliseconds (default: 5000)
   */
  const error = (message: string, duration = 5000) => {
    toast.error(message, {
      duration,
    })
  }

  /**
   * Show a warning toast with yellow styling
   * @param message - Warning message to display
   * @param duration - Duration in milliseconds (default: 4000)
   */
  const warning = (message: string, duration = 4000) => {
    toast.warning(message, {
      duration,
    })
  }

  /**
   * Show an info toast
   * @param message - Info message to display
   * @param duration - Duration in milliseconds (default: 3000)
   */
  const info = (message: string, duration = 3000) => {
    toast.info(message, {
      duration,
    })
  }

  /**
   * Show a loading toast
   * @param message - Loading message to display
   * @returns Toast ID for dismissing later
   */
  const loading = (message: string) => {
    return toast.loading(message)
  }

  /**
   * Dismiss a toast by ID
   * @param toastId - ID of the toast to dismiss
   */
  const dismiss = (toastId: string | number) => {
    toast.dismiss(toastId)
  }

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
  }
}

// Export direct toast functions for convenience
export { toast }

