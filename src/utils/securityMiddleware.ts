/**
 * Security middleware for intercepting and securing various operations
 */
import { sanitizeHtml, sanitizeUrl, decryptObject, encryptObject, enhanceTransportEncryption } from './security';

/**
 * Secures user input for forms
 */
export const secureFormData = <T extends Record<string, any>>(formData: T): T => {
  const securedData: Record<string, any> = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field name
      if (key.includes('url') || key.includes('link') || key.includes('href')) {
        securedData[key] = sanitizeUrl(value);
      } else if (
        key.includes('content') || 
        key.includes('message') || 
        key.includes('text') || 
        key.includes('description') || 
        key.includes('title')
      ) {
        securedData[key] = sanitizeHtml(value);
      } else {
        securedData[key] = value;
      }
    } else if (Array.isArray(value)) {
      // Handle arrays by sanitizing each element
      securedData[key] = value.map(item => 
        typeof item === 'string' ? sanitizeHtml(item) : item
      );
    } else if (value && typeof value === 'object') {
      // Recursively secure nested objects
      securedData[key] = secureFormData(value);
    } else {
      // Keep other types unchanged
      securedData[key] = value;
    }
  });
  
  return securedData as T;
};

/**
 * Secures and encrypts form data for transmission with enhanced security
 */
export const encryptFormData = <T extends Record<string, any>>(formData: T): string => {
  // First secure the data (sanitize inputs)
  const securedData = secureFormData(formData);
  
  // Add timestamp to prevent replay attacks
  const dataWithTimestamp = {
    ...securedData,
    _timestamp: Date.now(),
    _nonce: Math.random().toString(36).substring(2, 15)
  };
  
  // Encrypt with strong AES encryption
  return encryptObject(dataWithTimestamp);
};

/**
 * Decrypts and validates incoming data with enhanced security checks
 */
export const decryptIncomingData = <T extends Record<string, any>>(encryptedData: string): T | null => {
  // Decrypt the data
  const decryptedData = decryptObject<T & { _timestamp?: number, _nonce?: string }>(encryptedData);
  
  if (!decryptedData) {
    return null;
  }
  
  // Verify timestamp to prevent replay attacks (data must be recent)
  if (decryptedData._timestamp) {
    const currentTime = Date.now();
    const dataTime = decryptedData._timestamp;
    
    // Reject data older than 5 minutes
    if (currentTime - dataTime > 5 * 60 * 1000) {
      console.warn('Rejected old data (possible replay attack)');
      return null;
    }
    
    // Remove timestamp and nonce before returning
    const { _timestamp, _nonce, ...cleanData } = decryptedData;
    
    // Further validate the decrypted data
    return secureFormData(cleanData as T);
  }
  
  // Further validate the decrypted data
  return secureFormData(decryptedData);
};

/**
 * Enhanced interceptor for fetch responses with improved encryption
 */
export const setupResponseInterceptor = (): void => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    try {
      // Add encryption headers
      const secureInit: RequestInit = init || {};
      if (!secureInit.headers) {
        secureInit.headers = {};
      }
      
      const headers = new Headers(secureInit.headers);
      headers.set('X-Secure-Request', 'true');
      headers.set('X-Request-Time', Date.now().toString());
      
      // Unique request ID to prevent replay attacks
      const requestId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      headers.set('X-Request-ID', requestId);
      
      secureInit.headers = headers;
      
      // Make the original request with security headers
      const response = await originalFetch(input, secureInit);
      
      // Clone the response so we can read it multiple times
      const clonedResponse = response.clone();
      
      // Check if response contains encrypted data
      if (response.headers.get('X-Content-Encrypted') === 'true') {
        // Read the response as JSON
        const data = await clonedResponse.json();
        
        if (data && data.encrypted) {
          // Decrypt the data
          const decryptedData = decryptObject(data.encrypted);
          
          // Create a new response with the decrypted data
          return new Response(JSON.stringify(decryptedData), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        }
      }
      
      // Return the original response if not encrypted
      return response;
    } catch (error) {
      console.error('Error in fetch interceptor:', error);
      throw error;
    }
  } as typeof fetch;
};

/**
 * Secures DOM operations by adding safety checks
 */
export const secureDOM = (): void => {
  // Secure innerHTML by overriding its behavior
  const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML')!;
  
  Object.defineProperty(Element.prototype, 'innerHTML', {
    set(value: string) {
      // Sanitize HTML content before setting
      const sanitized = sanitizeHtml(value);
      originalInnerHTML.set!.call(this, sanitized);
    },
    get() {
      return originalInnerHTML.get!.call(this);
    }
  });
  
  // Secure createElement to prevent script injection
  const originalCreateElement = document.createElement;
  
  (document as any).createElement = function(tagName: string) {
    // Convert tagName to lowercase for consistent comparison
    const tag = tagName.toLowerCase();
    
    // Block creation of potentially dangerous elements
    if (tag === 'script' || tag === 'iframe' || tag === 'object' || tag === 'embed') {
      console.warn(`Security: Blocked creation of <${tag}> element`);
      // Create a div instead
      return originalCreateElement.call(document, 'div');
    }
    
    return originalCreateElement.call(document, tagName);
  };
  
  // Protect against click hijacking
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Check if it's a link
    if (target.tagName === 'A' || target.closest('a')) {
      const link = (target.tagName === 'A' ? target : target.closest('a')) as HTMLAnchorElement;
      const href = link.getAttribute('href');
      
      // Check for suspicious URLs
      if (href && (
        href.toLowerCase().startsWith('javascript:') ||
        href.toLowerCase().includes('&#') ||
        href.toLowerCase().includes('%') ||
        href.includes('on') // Block potential event handlers
      )) {
        event.preventDefault();
        console.warn('Security: Blocked navigation to suspicious URL:', href);
      }
    }
  }, true);
  
  // Prevent data exfiltration via clipboard
  document.addEventListener('copy', (event) => {
    const selection = document.getSelection();
    if (selection && selection.toString().length > 1000) {
      // Prevent copying large amounts of data
      event.preventDefault();
      console.warn('Security: Prevented copying large amount of text');
    }
  });
  
  // Secure postMessage communication
  window.addEventListener('message', (event) => {
    // Only accept messages from trusted origins
    const trustedOrigins = [
      window.location.origin,
      'https://bciboexxeayylqcneuqq.supabase.co'
    ];
    
    if (!trustedOrigins.includes(event.origin)) {
      console.warn(`Security: Blocked message from untrusted origin: ${event.origin}`);
      return;
    }
    
    // Parse messages securely
    try {
      const message = typeof event.data === 'string' 
        ? JSON.parse(event.data) 
        : event.data;
      
      // Check for suspicious properties
      if (message && (
        message.script || 
        message.eval || 
        message.code ||
        message.src ||
        message.href
      )) {
        console.warn('Security: Blocked suspicious postMessage content', message);
        return;
      }
      
      // Now it's safe to process the message
      // Add your message handling logic here
    } catch (error) {
      console.error('Error processing message:', error);
    }
  }, false);
};

/**
 * Initialize all security middleware with enhanced encryption
 */
export const initSecurityMiddleware = (): void => {
  if (typeof window !== 'undefined') {
    // Only run on client-side
    secureDOM();
    setupResponseInterceptor();
    enhanceTransportEncryption();
    
    // Add additional content security policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline';";
    document.head.appendChild(meta);
    
    // Log security middleware initialization
    console.log('Enhanced security middleware initialized');
  }
};

export default {
  secureFormData,
  secureDOM,
  initSecurityMiddleware,
  encryptFormData,
  decryptIncomingData,
  setupResponseInterceptor
};
