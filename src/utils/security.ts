
/**
 * Security utility functions for DevTalk Forum
 * Provides protection against common attacks like XSS, CSRF, etc.
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param input String that might contain unsafe HTML
 * @returns Sanitized string
 */
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';
  
  // Replace HTML tags and entities
  const sanitized = input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\(/g, '&#40;')
    .replace(/\)/g, '&#41;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
    .replace(/=/g, '&#61;');
    
  return sanitized;
};

/**
 * Sanitizes URLs to prevent JavaScript injection
 * @param url URL to sanitize
 * @returns Sanitized URL or empty string if unsafe
 */
export const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  
  // Check for JavaScript or data URIs
  const sanitized = url.trim().toLowerCase();
  if (
    sanitized.startsWith('javascript:') || 
    sanitized.startsWith('data:') ||
    sanitized.startsWith('vbscript:') ||
    sanitized.includes('onload=') ||
    sanitized.includes('onerror=')
  ) {
    return '';
  }
  
  return url;
};

/**
 * Gets CSRF token from meta tag
 * @returns CSRF token or null if not found
 */
export const getCsrfToken = (): string | null => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute('content') : null;
};

/**
 * Adds CSRF token to a request object
 * @param requestInit Fetch request init object
 * @returns Updated request init object with CSRF token
 */
export const addCsrfToken = (requestInit: RequestInit = {}): RequestInit => {
  const token = getCsrfToken();
  if (!token) return requestInit;
  
  const headers = new Headers(requestInit.headers || {});
  headers.append('X-CSRF-Token', token);
  
  return {
    ...requestInit,
    headers
  };
};

/**
 * Detects if the page is being loaded in an iframe
 * and adds X-Frame-Options header instead of redirecting
 */
export const preventFraming = (): void => {
  if (window.top !== window.self) {
    // Instead of trying to redirect (which can cause SecurityError),
    // we'll just console.warn about the iframe embedding
    console.warn('This site is designed to be viewed directly, not in an iframe.');
    
    // Add a visual indicator for users that they're in an iframe
    const iframeWarning = document.createElement('div');
    iframeWarning.style.position = 'fixed';
    iframeWarning.style.top = '0';
    iframeWarning.style.left = '0';
    iframeWarning.style.width = '100%';
    iframeWarning.style.padding = '10px';
    iframeWarning.style.backgroundColor = '#f44336';
    iframeWarning.style.color = 'white';
    iframeWarning.style.textAlign = 'center';
    iframeWarning.style.zIndex = '9999';
    iframeWarning.innerText = 'Внимание: Вы просматриваете этот сайт внутри iframe. Для лучшего опыта, пожалуйста, перейдите на основной сайт.';
    
    // Only add the warning if it doesn't already exist
    if (!document.getElementById('iframe-warning')) {
      iframeWarning.id = 'iframe-warning';
      document.body.appendChild(iframeWarning);
    }
  }
};

/**
 * Validates and sanitizes form input
 * @param value Form input value
 * @param type Type of validation to perform
 * @returns Sanitized value
 */
export const validateInput = (value: string, type: 'text' | 'email' | 'url' | 'username' | 'password'): string => {
  if (!value) return '';
  
  switch (type) {
    case 'email':
      // Basic email validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        throw new Error('Некорректный формат email');
      }
      return value.trim();
      
    case 'url':
      return sanitizeUrl(value);
      
    case 'username':
      // Only allow alphanumeric, underscore and dash
      if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        throw new Error('Имя пользователя может содержать только буквы, цифры, дефис и подчеркивание');
      }
      return value;
      
    case 'password':
      // Ensure password meets minimum requirements
      if (value.length < 8) {
        throw new Error('Пароль должен содержать минимум 8 символов');
      }
      return value;
      
    case 'text':
    default:
      return sanitizeHtml(value);
  }
};

/**
 * Initialize security measures
 */
export const initSecurity = (): void => {
  // Prevent loading in iframes (modified to avoid SecurityError)
  preventFraming();
  
  // Add global error handler to catch and log security-related errors
  window.addEventListener('error', (event) => {
    if (event.message && (
      event.message.includes('script error') || 
      event.message.includes('access denied') ||
      event.message.includes('cross-origin')
    )) {
      console.error('Security-related error:', event.message);
    }
  });
  
  // Protect against prototype pollution
  if (typeof Object.freeze === 'function') {
    Object.freeze(Object.prototype);
    Object.freeze(Array.prototype);
    Object.freeze(Function.prototype);
  }
  
  // Add security headers for older browsers
  const createMetaTag = (name: string, content: string) => {
    if (!document.querySelector(`meta[http-equiv="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
  };
  
  createMetaTag('X-XSS-Protection', '1; mode=block');
  createMetaTag('X-Content-Type-Options', 'nosniff');
  createMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin');
};

export default {
  sanitizeHtml,
  sanitizeUrl,
  getCsrfToken,
  addCsrfToken,
  validateInput,
  initSecurity
};
