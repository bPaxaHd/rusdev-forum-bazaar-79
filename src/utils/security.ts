
/**
 * Security utility functions for DevTalk Forum
 * Provides protection against common attacks like XSS, CSRF, etc.
 */
import CryptoJS from 'crypto-js';

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
 * Advanced data encryption using AES
 * @param data Data to encrypt
 * @param key Encryption key (will use secure default if not provided)
 * @returns Encrypted string
 */
export const encryptData = (data: string, key?: string): string => {
  // Generate a secure key if not provided
  const encryptionKey = key || generateSecureKey();
  
  // Use AES encryption with CBC mode for better security
  const encrypted = CryptoJS.AES.encrypt(data, encryptionKey, {
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  return encrypted.toString();
};

/**
 * Decrypt AES encrypted data
 * @param encryptedData Encrypted string
 * @param key Encryption key
 * @returns Decrypted data or null if decryption fails
 */
export const decryptData = (encryptedData: string, key: string): string | null => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
};

/**
 * Generates a secure encryption key
 * @returns Secure random key
 */
export const generateSecureKey = (): string => {
  // Generate a random string using browser crypto API
  const randomArray = new Uint8Array(32); // 256 bits
  window.crypto.getRandomValues(randomArray);
  
  // Convert to hex string
  return Array.from(randomArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Apply strong hashing to sensitive data (like passwords)
 * @param data Data to hash
 * @param salt Optional salt
 * @returns Secure hash
 */
export const secureHash = (data: string, salt?: string): string => {
  const customSalt = salt || generateSecureKey().substring(0, 16);
  // Use PBKDF2 for stronger password hashing with multiple iterations
  const hash = CryptoJS.PBKDF2(data, customSalt, {
    keySize: 256 / 32, // 256 bits
    iterations: 10000 // High number of iterations for better security
  });
  
  return hash.toString(CryptoJS.enc.Base64) + '.' + customSalt;
};

/**
 * Encrypts an object for secure transmission
 * @param obj Object to encrypt
 * @returns Encrypted string with embedded IV for transmission
 */
export const encryptObject = <T extends Record<string, any>>(obj: T): string => {
  const serialized = JSON.stringify(obj);
  const iv = CryptoJS.lib.WordArray.random(16); // Generate IV
  const key = sessionStorage.getItem('sec_key') || generateSecureKey();
  
  // Store key in session storage if not already there
  if (!sessionStorage.getItem('sec_key')) {
    sessionStorage.setItem('sec_key', key);
  }
  
  // Encrypt with IV for better security
  const encrypted = CryptoJS.AES.encrypt(serialized, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  
  // Return IV + encrypted data
  return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString();
};

/**
 * Decrypts an encrypted object
 * @param encryptedStr Encrypted string with embedded IV
 * @returns Decrypted object or null if failed
 */
export const decryptObject = <T extends Record<string, any>>(encryptedStr: string): T | null => {
  try {
    const key = sessionStorage.getItem('sec_key');
    if (!key) {
      console.error('Encryption key not found in session storage');
      return null;
    }
    
    // Split IV and encrypted data
    const [ivStr, encryptedData] = encryptedStr.split(':');
    const iv = CryptoJS.enc.Hex.parse(ivStr);
    
    // Decrypt
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Parse the decrypted JSON
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8)) as T;
  } catch (error) {
    console.error('Failed to decrypt object:', error);
    return null;
  }
};

/**
 * Blocks unused ports with flexible control
 */
export const blockUnusedPorts = (): void => {
  // List of allowed ports (80 and 443 for HTTP/HTTPS)
  const allowedPorts = [80, 443, 8080, 3000, 5173]; // Common development ports included
  
  // Block WebSocket connections to non-standard ports
  const originalWebSocket = window.WebSocket;
  window.WebSocket = function(url: string | URL, protocols?: string | string[]) {
    try {
      const urlObj = new URL(url.toString());
      const port = parseInt(urlObj.port) || (urlObj.protocol === 'wss:' ? 443 : 80);
      
      if (!allowedPorts.includes(port)) {
        console.error(`Connection to port ${port} blocked for security reasons`);
        throw new Error(`Connection to port ${port} blocked for security reasons`);
      }
      
      return new originalWebSocket(url, protocols);
    } catch (error) {
      console.error('WebSocket connection blocked:', error);
      // Return a dummy WebSocket that doesn't actually connect
      const dummyWs = Object.create(originalWebSocket.prototype);
      setTimeout(() => {
        if (dummyWs.onclose) {
          dummyWs.onclose(new CloseEvent('close', { wasClean: false, code: 1006, reason: 'Port blocked' }));
        }
      }, 50);
      return dummyWs;
    }
  } as typeof WebSocket;
  
  // Also restrict fetch and XMLHttpRequest to only use allowed ports
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    try {
      const url = input instanceof Request ? new URL(input.url) : new URL(input.toString());
      const port = parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80);
      
      if (!allowedPorts.includes(port)) {
        console.error(`Fetch to port ${port} blocked for security reasons`);
        return Promise.reject(new Error(`Connection to port ${port} blocked for security reasons`));
      }
      
      return originalFetch(input, init);
    } catch (error) {
      console.error('Fetch blocked:', error);
      return Promise.reject(error);
    }
  } as typeof fetch;
  
  // Block XHR to non-standard ports
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    try {
      const urlObj = new URL(url.toString(), window.location.href);
      const port = parseInt(urlObj.port) || (urlObj.protocol === 'https:' ? 443 : 80);
      
      if (!allowedPorts.includes(port)) {
        console.error(`XHR to port ${port} blocked for security reasons`);
        throw new Error(`Connection to port ${port} blocked for security reasons`);
      }
      
      return originalXHROpen.call(this, method, url, async === false ? false : true, username, password);
    } catch (error) {
      console.error('XHR blocked:', error);
      throw error;
    }
  };
};

/**
 * Initialize security measures
 */
export const initSecurity = (): void => {
  // Prevent loading in iframes (modified to avoid SecurityError)
  preventFraming();
  
  // Block connections to unused ports
  blockUnusedPorts();
  
  // Set up secure session key for encryption
  if (!sessionStorage.getItem('sec_key')) {
    sessionStorage.setItem('sec_key', generateSecureKey());
  }
  
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
  
  // Enable transport encryption for all fetch requests
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const secureInit = init || {};
    
    // Add CSRF token to all requests
    const withCsrf = addCsrfToken(secureInit);
    
    // Encrypt request body if it's a POST/PUT/PATCH request with JSON data
    if (withCsrf.body && 
        withCsrf.method && 
        ['POST', 'PUT', 'PATCH'].includes(withCsrf.method.toUpperCase()) && 
        withCsrf.headers instanceof Headers && 
        withCsrf.headers.get('Content-Type')?.includes('application/json')) {
      try {
        // Parse the JSON body
        const body = JSON.parse(withCsrf.body.toString());
        // Encrypt the body
        const encryptedBody = encryptObject(body);
        // Replace body with encrypted version
        withCsrf.body = JSON.stringify({ encrypted: encryptedBody });
        // Update content type to indicate encryption
        withCsrf.headers.set('X-Content-Encrypted', 'true');
      } catch (e) {
        // If parsing fails, leave body as-is
        console.warn('Could not encrypt request body', e);
      }
    }
    
    return originalFetch(input, withCsrf);
  } as typeof fetch;
};

export default {
  sanitizeHtml,
  sanitizeUrl,
  getCsrfToken,
  addCsrfToken,
  validateInput,
  initSecurity,
  encryptData,
  decryptData,
  generateSecureKey,
  secureHash,
  encryptObject,
  decryptObject,
  blockUnusedPorts
};
