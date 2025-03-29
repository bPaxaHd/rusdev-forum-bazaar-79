/**
 * Security middleware for intercepting and securing various operations
 */
import { sanitizeHtml, sanitizeUrl } from './security';

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
};

/**
 * Initialize all security middleware
 */
export const initSecurityMiddleware = (): void => {
  if (typeof window !== 'undefined') {
    // Only run on client-side
    secureDOM();
    
    // Log security middleware initialization
    console.log('Security middleware initialized');
  }
};

export default {
  secureFormData,
  secureDOM,
  initSecurityMiddleware
};
