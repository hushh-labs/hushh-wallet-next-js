/**
 * Robust fetch helper that prevents "Unexpected token 'A'" JSON parsing errors
 * when the server returns HTML error pages (like 504 timeouts)
 */

export interface FetchOptions extends RequestInit {
  timeout?: number;
}

export class FetchError extends Error {
  public status: number;
  public statusText: string;
  public response?: Response;

  constructor(message: string, status: number, statusText: string, response?: Response) {
    super(message);
    this.name = 'FetchError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

/**
 * Safe JSON fetch that handles non-JSON error responses gracefully
 */
export async function fetchJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Check content type before trying to parse JSON
    const contentType = response.headers.get('content-type') || '';
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status} ${response.statusText}`;
      
      try {
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          // Handle non-JSON error responses (like HTML 504 pages)
          const textError = await response.text();
          if (textError && textError.length < 500) {
            // Only include short error texts to avoid logging huge HTML pages
            errorMessage = `${errorMessage} - ${textError.slice(0, 200)}...`;
          }
        }
      } catch (parseError) {
        // If we can't parse the error response, just use the status
        console.warn('Failed to parse error response:', parseError);
      }

      throw new FetchError(errorMessage, response.status, response.statusText, response);
    }

    // Parse successful response
    if (contentType.includes('application/json')) {
      return await response.json();
    } else {
      // Unexpected content type for successful response
      const text = await response.text();
      throw new Error(`Expected JSON but received ${contentType}: ${text.slice(0, 200)}...`);
    }

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    
    if (error instanceof FetchError) {
      throw error;
    }
    
    // Network errors, etc.
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * POST JSON helper with proper error handling
 */
export async function postJSON<T>(url: string, data: any, options: FetchOptions = {}): Promise<T> {
  return fetchJSON<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Polling utility for checking status endpoints
 */
export async function pollUntil<T>(
  fetchFn: () => Promise<T>,
  condition: (data: T) => boolean,
  options: {
    interval?: number;
    maxAttempts?: number;
    onProgress?: (data: T, attempt: number) => void;
  } = {}
): Promise<T> {
  const { interval = 2000, maxAttempts = 30, onProgress } = options;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const data = await fetchFn();
      
      if (onProgress) {
        onProgress(data, attempt);
      }
      
      if (condition(data)) {
        return data;
      }
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    } catch (error) {
      console.warn(`Poll attempt ${attempt} failed:`, error);
      
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error(`Polling failed after ${maxAttempts} attempts`);
}
