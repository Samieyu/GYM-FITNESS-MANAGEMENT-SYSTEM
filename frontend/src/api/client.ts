/**
 * Centralized API configuration for POWERZONE Fitness
 * Automatically routes all API calls directly to the live Render backend
 */
export const BACKEND_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_BACKEND_URL) ||
  'https://sweatbox-whn5.onrender.com';

export const API_ROOT = `${BACKEND_URL}/api/v1`;

/**
 * Safely parses JSON from a Response object.
 * Prevents "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
 * by safely reading response text first and providing meaningful diagnostic messages.
 */
export async function safeJson<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  
  if (!text || text.trim() === '') {
    if (!res.ok) {
      if (res.status === 405) {
        throw new Error(
          'HTTP 405 Method Not Allowed: You may be viewing an outdated deployment preview or cached page. Please visit https://sweatbox.pages.dev and hard-refresh (Ctrl + Shift + R).'
        );
      }
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        throw new Error(
          `HTTP ${res.status}: Backend service is waking up from idle on Render free tier. Please wait 30 seconds and retry.`
        );
      }
      throw new Error(`HTTP ${res.status}: Server returned an empty response.`);
    }
    return {} as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (_e) {
    if (!res.ok) {
      // Often an HTML error page from a proxy or hosting provider
      if (text.includes('<html') || text.includes('<!DOCTYPE')) {
        throw new Error(
          `HTTP ${res.status}: Service temporarily unavailable or gateway error. Please try again shortly.`
        );
      }
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 160)}`);
    }
    throw new Error(`Unexpected non-JSON response from server: ${text.slice(0, 100)}`);
  }
}
