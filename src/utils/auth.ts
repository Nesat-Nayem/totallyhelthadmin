/**
 * Authentication utility functions
 */

/**
 * Get the authentication token from localStorage
 * @returns The token string or null if not found
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  
  try {
    return localStorage.getItem('backend_token')
  } catch (error) {
    console.error('Error getting auth token:', error)
    return null
  }
}

/**
 * Set the authentication token in localStorage
 * @param token The token to store
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('backend_token', token)
    console.log('Auth token stored successfully')
  } catch (error) {
    console.error('Error setting auth token:', error)
  }
}

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem('backend_token')
    console.log('Auth token removed')
  } catch (error) {
    console.error('Error removing auth token:', error)
  }
}

/**
 * Check if user is authenticated (has a valid token)
 * @returns True if authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken()
  return token !== null && token.length > 0
}

/**
 * Get authorization header for API requests
 * @returns Authorization header object or empty object if no token
 */
export const getAuthHeaders = (): { Authorization?: string } => {
  const token = getAuthToken()
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

