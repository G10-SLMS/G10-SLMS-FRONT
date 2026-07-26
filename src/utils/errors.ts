import { isAxiosError } from 'axios'

export interface ExtractErrorMessageOptions {
  networkMessage?: string
  serverErrorMessage?: string
}

export function extractErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
  options: ExtractErrorMessageOptions = {},
): string {
  if (isAxiosError(error)) {
    if (!error.response && options.networkMessage) {
      return options.networkMessage
    }

    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined

    if (data?.errors) {
      const firstField = Object.keys(data.errors)[0]
      const firstMessage = data.errors[firstField]?.[0]
      if (firstMessage) return firstMessage
    }
    if (data?.message) return data.message

    const status = error.response?.status
    if (status && status >= 500 && options.serverErrorMessage) {
      return `${options.serverErrorMessage} (${status}).`
    }
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return fallback
}
