
/**
 * DDoS Protection Module for DevTalk Forum
 * Provides defense mechanisms against various DoS and DDoS attacks
 */

// Rate limiting implementation
interface RateLimitEntry {
  count: number;
  lastRequest: number;
  blocked: boolean;
  blockExpiration: number;
}

// Store rate limit data
const ipRateLimits: Map<string, RateLimitEntry> = new Map();
const pathRateLimits: Map<string, Map<string, RateLimitEntry>> = new Map();

// Configuration
const rateLimitConfig = {
  globalRequestsPerMinute: 120,          // Maximum requests per minute from a single IP
  apiRequestsPerMinute: 60,              // Maximum API requests per minute from a single IP
  loginAttemptsPerMinute: 5,             // Maximum login attempts per minute from a single IP
  registrationAttemptsPerHour: 3,        // Maximum registration attempts per hour from a single IP
  blockDurationMinutes: 15,              // How long to block IPs that exceed limits (in minutes)
  ipReputationThreshold: -10,            // Reputation score at which an IP gets blocked
  suspiciousUserAgentsScore: -5,         // Reputation penalty for suspicious user agents
  suspiciousHeadersScore: -3,            // Reputation penalty for suspicious headers
  highFrequencyPenalty: -2,              // Penalty for high frequency requests
  maxConcurrentConnections: 15,          // Maximum concurrent connections from a single IP
  sessionRateLimitThreshold: 300,        // Maximum requests per session per 5 minutes
  browserIntegrityCheck: true,           // Enable browser integrity checks
  challengeThreshold: 80,                // Requests per minute that trigger a challenge
};

// IP reputation system
const ipReputationScores: Map<string, number> = new Map();

// Track concurrent connections
const concurrentConnections: Map<string, number> = new Map();

// Session tracking
const sessionRequests: Map<string, number[]> = new Map();

// List of known bad IPs (could be loaded from a database or external service)
const knownBadIPs: Set<string> = new Set([
  // Example IPs that would be populated from threat intelligence
  // '192.0.2.1', '198.51.100.2', etc.
]);

/**
 * Gets the client IP address from various headers
 * @param headers Request headers
 * @returns The best guess at the client IP address
 */
export const getClientIP = (headers: Headers): string => {
  // Try to get IP from various headers, with Cloudflare or common proxy headers first
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp;
  
  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Get the leftmost non-local IP
    const ips = xForwardedFor.split(',').map(ip => ip.trim());
    for (const ip of ips) {
      if (!isLocalIP(ip)) return ip;
    }
  }
  
  return headers.get('x-real-ip') || 
         headers.get('true-client-ip') || 
         headers.get('x-client-ip') || 
         'unknown';
};

/**
 * Checks if an IP is a local/private IP address
 * @param ip IP address to check
 * @returns True if the IP is local/private
 */
const isLocalIP = (ip: string): boolean => {
  return ip.startsWith('10.') || 
         ip.startsWith('192.168.') || 
         ip.startsWith('172.16.') || 
         ip.startsWith('172.17.') || 
         ip.startsWith('172.18.') || 
         ip.startsWith('172.19.') || 
         ip.startsWith('172.20.') || 
         ip.startsWith('172.21.') || 
         ip.startsWith('172.22.') || 
         ip.startsWith('172.23.') || 
         ip.startsWith('172.24.') || 
         ip.startsWith('172.25.') || 
         ip.startsWith('172.26.') || 
         ip.startsWith('172.27.') || 
         ip.startsWith('172.28.') || 
         ip.startsWith('172.29.') || 
         ip.startsWith('172.30.') || 
         ip.startsWith('172.31.') || 
         ip === '127.0.0.1' || 
         ip === '::1';
};

/**
 * Clears expired rate limit entries
 */
const cleanupRateLimits = (): void => {
  const now = Date.now();
  const expiryTime = now - 60000; // 1 minute
  
  // Clean up global rate limits
  for (const [ip, entry] of ipRateLimits.entries()) {
    if (entry.lastRequest < expiryTime && !entry.blocked) {
      ipRateLimits.delete(ip);
    } else if (entry.blocked && entry.blockExpiration < now) {
      // Unblock IPs whose block time has expired
      entry.blocked = false;
      entry.count = 0;
      entry.blockExpiration = 0;
    }
  }
  
  // Clean up path-specific rate limits
  for (const [path, ipMap] of pathRateLimits.entries()) {
    for (const [ip, entry] of ipMap.entries()) {
      if (entry.lastRequest < expiryTime && !entry.blocked) {
        ipMap.delete(ip);
      } else if (entry.blocked && entry.blockExpiration < now) {
        // Unblock IPs whose block time has expired
        entry.blocked = false;
        entry.count = 0;
        entry.blockExpiration = 0;
      }
    }
    
    // Remove empty path entries
    if (ipMap.size === 0) {
      pathRateLimits.delete(path);
    }
  }
};

// Periodically clean up rate limits
setInterval(cleanupRateLimits, 60000); // Every minute

/**
 * Checks if a request should be blocked based on rate limiting
 * @param ip Client IP address
 * @param url Request URL
 * @param method Request method
 * @param headers Request headers
 * @returns Object indicating if the request should be blocked and why
 */
export const shouldBlockRequest = (
  ip: string, 
  url: string, 
  method: string, 
  headers: Headers
): { blocked: boolean; reason?: string } => {
  const now = Date.now();
  const path = new URL(url, 'http://example.com').pathname;
  
  // 1. Check for known bad IPs
  if (knownBadIPs.has(ip)) {
    return { blocked: true, reason: 'Known malicious IP' };
  }
  
  // 2. Check if IP is already blocked
  const ipEntry = ipRateLimits.get(ip);
  if (ipEntry?.blocked && ipEntry.blockExpiration > now) {
    return { blocked: true, reason: 'IP temporarily blocked due to rate limit violation' };
  }
  
  // 3. Check IP reputation
  const reputation = ipReputationScores.get(ip) || 0;
  if (reputation < rateLimitConfig.ipReputationThreshold) {
    // Block and reset reputation after blocking period
    const blockExpiration = now + rateLimitConfig.blockDurationMinutes * 60000;
    ipRateLimits.set(ip, { count: 0, lastRequest: now, blocked: true, blockExpiration });
    return { blocked: true, reason: 'Poor IP reputation score' };
  }
  
  // 4. Check concurrent connections
  const currentConcurrent = concurrentConnections.get(ip) || 0;
  if (currentConcurrent > rateLimitConfig.maxConcurrentConnections) {
    return { blocked: true, reason: 'Too many concurrent connections' };
  }
  
  // 5. Analyze request headers for potential attacks
  if (detectSuspiciousHeaders(headers)) {
    // Penalize IP reputation
    ipReputationScores.set(ip, (ipReputationScores.get(ip) || 0) + rateLimitConfig.suspiciousHeadersScore);
    return { blocked: true, reason: 'Suspicious request headers' };
  }
  
  // 6. Apply different rate limits based on the request path
  
  // Global rate limiting
  if (!ipEntry) {
    ipRateLimits.set(ip, { count: 1, lastRequest: now, blocked: false, blockExpiration: 0 });
  } else {
    ipEntry.count++;
    ipEntry.lastRequest = now;
    
    // Check if global rate limit is exceeded
    if (ipEntry.count > rateLimitConfig.globalRequestsPerMinute) {
      // Block the IP
      ipEntry.blocked = true;
      ipEntry.blockExpiration = now + rateLimitConfig.blockDurationMinutes * 60000;
      return { blocked: true, reason: 'Global rate limit exceeded' };
    }
  }
  
  // Path-specific rate limiting
  let pathMap = pathRateLimits.get(path);
  if (!pathMap) {
    pathMap = new Map();
    pathRateLimits.set(path, pathMap);
  }
  
  const pathEntry = pathMap.get(ip);
  if (!pathEntry) {
    pathMap.set(ip, { count: 1, lastRequest: now, blocked: false, blockExpiration: 0 });
  } else {
    pathEntry.count++;
    pathEntry.lastRequest = now;
    
    // Apply stricter limits for sensitive paths
    let pathLimit = rateLimitConfig.globalRequestsPerMinute;
    
    if (path.includes('/api/')) {
      pathLimit = rateLimitConfig.apiRequestsPerMinute;
    } else if (path.includes('/login') || path.includes('/signin')) {
      pathLimit = rateLimitConfig.loginAttemptsPerMinute;
    } else if (path.includes('/register') || path.includes('/signup')) {
      pathLimit = rateLimitConfig.registrationAttemptsPerHour;
    }
    
    if (pathEntry.count > pathLimit) {
      // Block the IP for this specific path
      pathEntry.blocked = true;
      pathEntry.blockExpiration = now + rateLimitConfig.blockDurationMinutes * 60000;
      
      // Also penalize the IP reputation
      ipReputationScores.set(ip, (ipReputationScores.get(ip) || 0) + rateLimitConfig.highFrequencyPenalty);
      
      return { blocked: true, reason: `Rate limit exceeded for ${path}` };
    }
  }
  
  // 7. Session-based rate limiting (if session ID is available)
  const sessionId = headers.get('x-session-id');
  if (sessionId) {
    const sessionReqs = sessionRequests.get(sessionId) || [];
    const now = Date.now();
    
    // Remove requests older than 5 minutes
    const recentRequests = sessionReqs.filter(time => now - time < 300000);
    recentRequests.push(now);
    sessionRequests.set(sessionId, recentRequests);
    
    if (recentRequests.length > rateLimitConfig.sessionRateLimitThreshold) {
      return { blocked: true, reason: 'Session rate limit exceeded' };
    }
  }
  
  // If we reach here, request is allowed
  return { blocked: false };
};

/**
 * Updates concurrent connection count
 * @param ip Client IP
 * @param increment Whether to increment (true) or decrement (false) the count
 */
export const updateConcurrentConnections = (ip: string, increment: boolean): void => {
  const current = concurrentConnections.get(ip) || 0;
  
  if (increment) {
    concurrentConnections.set(ip, current + 1);
  } else {
    concurrentConnections.set(ip, Math.max(0, current - 1));
  }
};

/**
 * Detects suspicious request headers that might indicate an attack
 * @param headers Request headers
 * @returns True if suspicious headers are detected
 */
const detectSuspiciousHeaders = (headers: Headers): boolean => {
  const userAgent = headers.get('user-agent') || '';
  
  // Check for missing or suspicious user agents
  if (!userAgent || 
      userAgent.includes('zgrab') || 
      userAgent.includes('python-requests') || 
      userAgent.includes('nmap') || 
      userAgent.includes('masscan') || 
      userAgent.includes('nikto') || 
      userAgent === 'curl' || 
      userAgent === 'wget' || 
      userAgent.length < 10) {
    return true;
  }
  
  // Check for inconsistent headers that might indicate spoofing
  const accept = headers.get('accept');
  const acceptLanguage = headers.get('accept-language');
  const acceptEncoding = headers.get('accept-encoding');
  
  // Browser requests typically have these headers set
  if (!accept || !acceptLanguage || !acceptEncoding) {
    return true;
  }
  
  // Check for headers typically used in HTTP flood attacks
  if (headers.get('cache-control') === 'no-cache' && 
      headers.get('pragma') === 'no-cache' && 
      headers.get('connection') === 'keep-alive') {
    // This combination is often used in flood attacks
    // but could also be legitimate in some cases
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      return true;
    }
  }
  
  return false;
};

/**
 * Generates a browser challenge for suspected bots
 * @returns HTML content with JavaScript challenge
 */
export const generateBrowserChallenge = (): string => {
  const challengeId = Math.random().toString(36).substring(2, 15);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Проверка безопасности</title>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          background-color: #f7f9fc;
          color: #333;
        }
        .container {
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          text-align: center;
        }
        h1 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }
        p {
          margin-bottom: 1.5rem;
          line-height: 1.6;
        }
        .loader {
          border: 4px solid #f3f3f3;
          border-radius: 50%;
          border-top: 4px solid #3498db;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin: 20px auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Проверка безопасности</h1>
        <p>Пожалуйста, подождите, мы проверяем ваш браузер. Это займет всего несколько секунд.</p>
        <div class="loader" id="loader"></div>
        <p id="status">Проверка...</p>
      </div>
      <script>
        // Browser integrity check
        (function() {
          // Create challenge token
          const challengeId = "${challengeId}";
          const timestamp = Date.now();
          
          // Simple computational challenge
          let result = 0;
          for (let i = 0; i < 1000000; i++) {
            result += Math.sqrt(i) * Math.cos(i);
          }
          
          // Get browser fingerprint data
          const fingerprint = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            screens: {
              width: window.screen.width,
              height: window.screen.height,
              availWidth: window.screen.availWidth,
              availHeight: window.screen.availHeight,
              colorDepth: window.screen.colorDepth
            },
            timezoneOffset: new Date().getTimezoneOffset(),
            doNotTrack: navigator.doNotTrack,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            cpuCores: navigator.hardwareConcurrency,
            deviceMemory: navigator.deviceMemory,
            canvas: getCanvasFingerprint(),
            webgl: getWebglFingerprint(),
            challengeResult: result.toString().substring(0, 10),
            solveTime: Date.now() - timestamp
          };
          
          function getCanvasFingerprint() {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = 200;
              canvas.height = 50;
              const ctx = canvas.getContext('2d');
              
              if (!ctx) return "unavailable";
              
              ctx.font = '20px Arial';
              ctx.fillStyle = 'red';
              ctx.fillText('DevTalk Security Check', 10, 30);
              ctx.strokeStyle = 'blue';
              ctx.strokeText('Browser Challenge', 10, 45);
              
              return canvas.toDataURL().substring(0, 100);
            } catch (e) {
              return "error";
            }
          }
          
          function getWebglFingerprint() {
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
              
              if (!gl) return "unavailable";
              
              return {
                vendor: gl.getParameter(gl.VENDOR),
                renderer: gl.getParameter(gl.RENDERER)
              };
            } catch (e) {
              return "error";
            }
          }
          
          // Calculate response token
          const token = btoa(JSON.stringify({
            id: challengeId,
            timestamp: timestamp,
            fp: btoa(JSON.stringify(fingerprint))
          }));
          
          // Submit the challenge response
          setTimeout(() => {
            const statusEl = document.getElementById('status');
            statusEl.textContent = "Перенаправление...";
            
            // Add token to the URL
            const url = new URL(window.location.href);
            url.searchParams.append('challenge_token', token);
            
            // Redirect back to the original page with the token
            window.location.href = url.toString();
          }, 2000);
        })();
      </script>
    </body>
    </html>
  `;
};

/**
 * Validates a challenge token
 * @param token Challenge response token
 * @returns Whether the token is valid
 */
export const validateChallengeToken = (token: string): boolean => {
  try {
    const decoded = JSON.parse(atob(token));
    
    // Verify timestamp is recent (within last 5 minutes)
    const timestamp = decoded.timestamp;
    if (Date.now() - timestamp > 300000) {
      return false;
    }
    
    // Decode fingerprint data
    const fingerprint = JSON.parse(atob(decoded.fp));
    
    // Validate solve time (too fast might indicate automation)
    if (fingerprint.solveTime < 500) {
      return false;
    }
    
    // Check other fingerprint data as needed
    
    return true;
  } catch (e) {
    console.error('Error validating challenge token:', e);
    return false;
  }
};

/**
 * Initialize the DDoS protection system
 */
export const initDDoSProtection = (): void => {
  // Set up the rate limiting cleanups
  cleanupRateLimits();
  
  console.log('DDoS protection system initialized');
  
  // Log periodic statistics (in development environment only)
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      console.log(`DDoS Protection Stats:
        - Tracked IPs: ${ipRateLimits.size}
        - Blocked IPs: ${Array.from(ipRateLimits.values()).filter(entry => entry.blocked).length}
        - Path rate limits: ${pathRateLimits.size}
        - Concurrent connections: ${concurrentConnections.size}
      `);
    }, 60000);
  }
};

/**
 * Middleware function to integrate with XHR/fetch
 */
export const setupDDoSProtectionMiddleware = (): void => {
  // Intercept fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = (input instanceof Request) ? input.url : input.toString();
    const method = (input instanceof Request) ? input.method : (init?.method || 'GET');
    
    // Create headers object from input
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
    
    // Add client timestamp to detect time skew attacks
    headers.set('x-client-time', Date.now().toString());
    
    // Add session ID if available
    const sessionId = sessionStorage.getItem('session_id');
    if (sessionId) {
      headers.set('x-session-id', sessionId);
    }
    
    // For local testing, we'll use a fake IP based on session storage
    // In production, this would be determined by the server
    const clientIP = sessionStorage.getItem('test_client_ip') || '127.0.0.1';
    
    // Update concurrent connections
    updateConcurrentConnections(clientIP, true);
    
    try {
      // Check if request should be blocked
      const blockResult = shouldBlockRequest(clientIP, url, method, headers);
      if (blockResult.blocked) {
        console.warn(`Request to ${url} blocked: ${blockResult.reason}`);
        
        // Return a blocked response
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
          message: blockResult.reason,
          retry_after: rateLimitConfig.blockDurationMinutes * 60
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': (rateLimitConfig.blockDurationMinutes * 60).toString()
          }
        });
      }
      
      // If request is allowed, proceed with the original fetch
      const updatedInit = init ? { ...init } : {};
      if (!updatedInit.headers) {
        updatedInit.headers = headers;
      }
      
      // Make the request
      return await originalFetch(input, updatedInit);
    } finally {
      // Decrement concurrent connections when request is done
      updateConcurrentConnections(clientIP, false);
    }
  } as typeof fetch;
  
  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, username?: string | null, password?: string | null) {
    // Store the URL and method for later use
    this._ddosUrl = url.toString();
    this._ddosMethod = method;
    
    // Add event listener to track request completion
    const clientIP = sessionStorage.getItem('test_client_ip') || '127.0.0.1';
    updateConcurrentConnections(clientIP, true);
    
    this.addEventListener('loadend', () => {
      updateConcurrentConnections(clientIP, false);
    });
    
    // Add custom headers in the send method
    const originalSend = this.send;
    this.send = function(body?: Document | XMLHttpRequestBodyInit | null) {
      // Add client timestamp
      this.setRequestHeader('x-client-time', Date.now().toString());
      
      // Add session ID if available
      const sessionId = sessionStorage.getItem('session_id');
      if (sessionId) {
        this.setRequestHeader('x-session-id', sessionId);
      }
      
      // Check if request should be blocked
      const headers = new Headers();
      this.setRequestHeader = function(name: string, value: string) {
        headers.set(name, value);
      };
      
      const blockResult = shouldBlockRequest(clientIP, this._ddosUrl, this._ddosMethod, headers);
      if (blockResult.blocked) {
        console.warn(`Request to ${this._ddosUrl} blocked: ${blockResult.reason}`);
        
        // Simulate a blocked response
        Object.defineProperty(this, 'status', { value: 429 });
        Object.defineProperty(this, 'statusText', { value: 'Too Many Requests' });
        Object.defineProperty(this, 'responseText', { 
          value: JSON.stringify({
            error: 'Rate limit exceeded',
            message: blockResult.reason,
            retry_after: rateLimitConfig.blockDurationMinutes * 60
          })
        });
        
        // Call appropriate event handlers
        setTimeout(() => {
          const loadEvent = new Event('load');
          this.dispatchEvent(loadEvent);
          
          const loadendEvent = new Event('loadend');
          this.dispatchEvent(loadendEvent);
        }, 0);
        
        return;
      }
      
      // If not blocked, proceed with the original send
      return originalSend.call(this, body);
    };
    
    // Call the original open method
    return originalXHROpen.call(this, method, url, async !== false, username, password);
  };
};

export default {
  initDDoSProtection,
  setupDDoSProtectionMiddleware,
  shouldBlockRequest,
  getClientIP,
  generateBrowserChallenge,
  validateChallengeToken
};
