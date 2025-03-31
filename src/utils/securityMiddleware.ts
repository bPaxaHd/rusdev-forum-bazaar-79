/**
 * Security middleware for intercepting and securing various operations
 */
import { sanitizeHtml, sanitizeUrl, decryptObject, encryptObject, enhanceTransportEncryption } from './security';
import { shouldBlockRequest, getClientIP, generateBrowserChallenge, validateChallengeToken } from './ddosProtection';

/**
 * Secures user input for forms
 */
export const secureFormData = <T extends Record<string, any>>(formData: T): T => {
  const securedData: Record<string, any> = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field name
      if (key.includes('url') || key.includes('link') || key.includes('href')) {
        // Принудительно использовать HTTPS для всех URL
        let sanitizedUrl = sanitizeUrl(value);
        if (sanitizedUrl && sanitizedUrl.startsWith('http:')) {
          sanitizedUrl = sanitizedUrl.replace('http:', 'https:');
        }
        securedData[key] = sanitizedUrl;
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
      // Принудительно использовать HTTPS
      let url: URL;
      if (input instanceof Request) {
        url = new URL(input.url);
        if (url.protocol === 'http:' && url.hostname !== 'localhost') {
          const httpsUrl = input.url.replace('http:', 'https:');
          input = new Request(httpsUrl, input);
        }
      } else if (typeof input === 'string') {
        if (input.startsWith('http:') && !input.includes('localhost')) {
          input = input.replace('http:', 'https:');
        }
      }
      
      // Get headers from input
      const headers = new Headers();
      if (input instanceof Request) {
        input.headers.forEach((value, key) => {
          headers.set(key, value);
        });
      }
      if (init?.headers) {
        const initHeaders = new Headers(init.headers);
        initHeaders.forEach((value, key) => {
          headers.set(key, value);
        });
      }
      
      // Get client IP (for development - in production this would be done server-side)
      const clientIP = sessionStorage.getItem('test_client_ip') || '127.0.0.1';
      
      // Check for DDoS protection if the feature is enabled
      if (typeof shouldBlockRequest === 'function') {
        const urlString = input instanceof Request ? input.url : input.toString();
        const method = input instanceof Request ? input.method : (init?.method || 'GET');
        
        const blockResult = shouldBlockRequest(clientIP, urlString, method, headers);
        if (blockResult.blocked) {
          console.warn(`Request blocked by DDoS protection: ${blockResult.reason}`);
          return new Response(JSON.stringify({
            error: 'Too many requests',
            message: blockResult.reason
          }), {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': '300'
            }
          });
        }
      }
      
      // Add encryption headers
      const secureInit: RequestInit = init || {};
      if (!secureInit.headers) {
        secureInit.headers = {};
      }
      
      const requestHeaders = new Headers(secureInit.headers);
      requestHeaders.set('X-Secure-Request', 'true');
      requestHeaders.set('X-Request-Time', Date.now().toString());
      requestHeaders.set('X-Forced-HTTPS', 'true');
      
      // Unique request ID to prevent replay attacks
      const requestId = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
      requestHeaders.set('X-Request-ID', requestId);
      
      secureInit.headers = requestHeaders;
      
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
 * Проверяет, является ли URL безопасным (HTTPS)
 */
const isSecureUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.hostname === 'localhost';
  } catch {
    return false;
  }
};

/**
 * Файервол на клиентской стороне - блокирует нежелательный трафик с DDoS защитой
 */
export const setupClientFirewall = (): void => {
  const blockedIps = new Set<string>();
  const suspiciousPatterns = [
    /eval\(|document\.cookie|alert\(|prompt\(|confirm\(/i,
    /script>|<\/script|<iframe|<object/i,
    /onload=|onerror=|onclick=/i,
    /data:text\/html|javascript:/i
  ];
  
  // DDoS protection - Track request frequencies
  const requestCounts: Map<string, { count: number, timestamp: number }> = new Map();
  const maxRequestsPerMinute = 120;
  
  // Флаг для отслеживания подозрительной активности
  let suspiciousActivityCount = 0;
  
  // Блокировка подозрительных запросов
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string, ...args: any[]) {
    // Проверка URL на безопасность
    if (typeof url === 'string') {
      // Принудительно использовать HTTPS
      if (url.startsWith('http:') && !url.includes('localhost')) {
        url = url.replace('http:', 'https:');
      }
      
      // DDoS protection - Track and limit request frequency
      const clientIP = sessionStorage.getItem('test_client_ip') || '127.0.0.1';
      const now = Date.now();
      const entry = requestCounts.get(clientIP) || { count: 0, timestamp: now };
      
      // Reset counter if it's been more than a minute
      if (now - entry.timestamp > 60000) {
        entry.count = 1;
        entry.timestamp = now;
      } else {
        entry.count++;
      }
      
      requestCounts.set(clientIP, entry);
      
      // Block if too many requests in a short time
      if (entry.count > maxRequestsPerMinute) {
        console.warn('Firewall: Blocked possible DDoS attempt:', url);
        throw new Error('Request blocked: Rate limit exceeded');
      }
      
      // Проверка URL на подозрительные паттерны
      if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        console.warn('Firewall: Blocked suspicious XHR request:', url);
        suspiciousActivityCount++;
        throw new Error('Firewall blocked this request');
      }
    }
    
    return originalOpen.call(this, method, url, ...args);
  };
  
  // Мониторинг и блокировка подозрительной активности
  document.addEventListener('submit', (event) => {
    const form = event.target as HTMLFormElement;
    
    // Проверка формы на безопасность
    if (form.action && !isSecureUrl(form.action)) {
      console.warn('Firewall: Blocked form submission to non-HTTPS endpoint');
      event.preventDefault();
      suspiciousActivityCount++;
    }
    
    // Проверка данных формы
    Array.from(new FormData(form)).forEach(([key, value]) => {
      if (typeof value === 'string' && suspiciousPatterns.some(pattern => pattern.test(value))) {
        console.warn('Firewall: Blocked form with suspicious data');
        event.preventDefault();
        suspiciousActivityCount++;
      }
    });
  }, true);
  
  // Блокировка внешних скриптов от ненадежных источников
  const originalSetAttribute = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name: string, value: string) {
    if ((name === 'src' || name === 'href') && typeof value === 'string') {
      // Принудительно использовать HTTPS
      if (value.startsWith('http:') && !value.includes('localhost')) {
        value = value.replace('http:', 'https:');
      }
      
      // Проверка на подозрительные паттерны
      if (suspiciousPatterns.some(pattern => pattern.test(value))) {
        console.warn('Firewall: Blocked setting suspicious attribute:', name, value);
        suspiciousActivityCount++;
        return;
      }
    }
    
    return originalSetAttribute.call(this, name, value);
  };
  
  // DDoS protection - Track and handle burst requests
  let requestBurst = 0;
  let burstStart = Date.now();
  const maxBurst = 30; // Maximum number of requests in a burst
  const burstWindow = 5000; // Time window for a burst (ms)
  const burstCooldown = 30000; // Cooldown period after a burst is detected (ms)
  let burstBlocked = false;
  let burstCooldownEnd = 0;
  
  // Track overall requests per second
  const requestTimestamps: number[] = [];
  const maxRPS = 20; // Maximum requests per second
  
  // Intercept all fetch requests to implement burst protection
  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const now = Date.now();
    
    // Check if in cooldown period
    if (burstBlocked && now < burstCooldownEnd) {
      console.warn('Request blocked: In burst cooldown period');
      
      // Return a 429 Too Many Requests response
      return new Response(JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded',
        retry_after: Math.ceil((burstCooldownEnd - now) / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((burstCooldownEnd - now) / 1000).toString()
        }
      });
    }
    
    // Reset burst counter if window has passed
    if (now - burstStart > burstWindow) {
      requestBurst = 0;
      burstStart = now;
    }
    
    // Increment burst counter
    requestBurst++;
    
    // Check for burst attacks
    if (requestBurst > maxBurst) {
      console.warn('Possible DDoS attack detected: Request burst');
      burstBlocked = true;
      burstCooldownEnd = now + burstCooldown;
      
      return new Response(JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded',
        retry_after: Math.ceil(burstCooldown / 1000)
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil(burstCooldown / 1000).toString()
        }
      });
    }
    
    // Track requests per second
    requestTimestamps.push(now);
    
    // Keep only timestamps from the last second
    const oneSecondAgo = now - 1000;
    while (requestTimestamps.length > 0 && requestTimestamps[0] < oneSecondAgo) {
      requestTimestamps.shift();
    }
    
    // Check if RPS exceeds limit
    if (requestTimestamps.length > maxRPS) {
      console.warn('Possible DDoS attack detected: Requests per second limit exceeded');
      
      return new Response(JSON.stringify({
        error: 'Too many requests',
        message: 'Rate limit exceeded',
        retry_after: 5
      }), {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '5'
        }
      });
    }
    
    // If no problems detected, proceed with the original fetch
    return originalFetch(input, init);
  } as typeof fetch;
  
  // Активация механизма защиты от частых атак
  setInterval(() => {
    if (suspiciousActivityCount > 5) {
      console.warn('Firewall: High suspicious activity detected. Enhanced protection enabled.');
      
      // Добавить дополнительную защиту при обнаружении атаки
      document.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', e => {
          const input = e.target as HTMLInputElement;
          if (suspiciousPatterns.some(pattern => pattern.test(input.value))) {
            input.value = sanitizeHtml(input.value);
          }
        });
      });
    }
    
    // Сбрасываем счетчик каждую минуту
    suspiciousActivityCount = 0;
  }, 60000);
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
      
      // Принудительно использовать HTTPS
      if (href && href.startsWith('http:') && !href.includes('localhost')) {
        link.setAttribute('href', href.replace('http:', 'https:'));
      }
      
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
 * Initialize all security middleware with enhanced encryption and DDoS protection
 */
export const initSecurityMiddleware = (): void => {
  if (typeof window !== 'undefined') {
    // Only run on client-side
    secureDOM();
    setupResponseInterceptor();
    enhanceTransportEncryption();
    setupClientFirewall();
    
    // Принудительно перенаправлять с HTTP на HTTPS
    if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
      window.location.href = window.location.href.replace('http:', 'https:');
    }
    
    // Add additional content security policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests;";
    document.head.appendChild(meta);
    
    // Добавляем заголовок для принудительного HTTPS
    const httpsEnforcer = document.createElement('meta');
    httpsEnforcer.httpEquiv = 'Content-Security-Policy';
    httpsEnforcer.content = 'upgrade-insecure-requests';
    document.head.appendChild(httpsEnforcer);
    
    // Добавляем HSTS заголовок
    const hstsHeader = document.createElement('meta');
    hstsHeader.httpEquiv = 'Strict-Transport-Security';
    hstsHeader.content = 'max-age=31536000; includeSubDomains; preload';
    document.head.appendChild(hstsHeader);
    
    // Log security middleware initialization
    console.log('Enhanced security middleware initialized with client-side firewall and DDoS protection');
  }
};

export default {
  secureFormData,
  secureDOM,
  initSecurityMiddleware,
  encryptFormData,
  decryptIncomingData,
  setupResponseInterceptor,
  setupClientFirewall
};
