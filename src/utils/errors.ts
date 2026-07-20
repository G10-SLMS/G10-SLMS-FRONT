import { isAxiosError } from 'axios'

export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined

    if (data?.errors) {
      const firstField = Object.keys(data.errors)[0]
      const firstMessage = data.errors[firstField]?.[0]
      if (firstMessage) return firstMessage
    }
    if (data?.message) return data.message
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
