
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const encryptScript = (script: string, nonce: string = ''): string => {
  const key = nonce ? nonce.substring(0, 8) : Math.random().toString(36).substring(2, 10);
  
  const encryptChar = (c: string, index: number): string => {
    const charCode = c.charCodeAt(0);
    const keyChar = key.charCodeAt(index % key.length);
    return String.fromCharCode(charCode ^ keyChar);
  };
  
  const encryptedScript = script.split('')
    .map((char, index) => encryptChar(char, index))
    .join('');
  
  return btoa(encryptedScript);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    let nonce = '';
    try {
      const url = new URL(req.url);
      nonce = url.searchParams.get('nonce') || '';
    } catch {
      nonce = Math.random().toString(36).substring(2, 15);
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .rpc('get_secure_script', { script_name: 'devTools' });
    
    if (error) throw error;
    
    const encryptedScript = encryptScript(data, nonce);
    
    const obfuscatedScript = `
    (function() {
      try {
        const decrypt = function(encryptedData, key) {
          const dynamicKey = key || (window.navigator.userAgent.length % 10).toString() 
            + (new Date().getHours()).toString();
          
          const encryptedString = atob(encryptedData);
          
          const decryptChar = function(c, index) {
            const charCode = c.charCodeAt(0);
            const keyChar = dynamicKey.charCodeAt(index % dynamicKey.length);
            return String.fromCharCode(charCode ^ keyChar);
          };
          
          return encryptedString.split('').map(decryptChar).join('');
        };
        
        const secureEval = function(code) {
          const timestamp = Date.now();
          try {
            debugger;
            if (Date.now() - timestamp > 100) {
              console.clear();
              return;
            }
            
            new Function(code)();
          } catch (e) {
            console.log('Development tools not available');
          }
        };
        
        const scriptContent = atob("${encryptedScript}");
        
        setTimeout(function() {
          const originalToString = Function.prototype.toString;
          Function.prototype.toString = function() {
            if (this === secureEval || this === decrypt) {
              return "function() { [native code] }";
            }
            return originalToString.call(this);
          };
          
          secureEval(decrypt(scriptContent, "${nonce}"));
        }, Math.random() * 50 + 10);
      } catch (e) {
        console.log('Development tools not available');
      }
    })();
    `;
    
    const randomExpires = new Date();
    randomExpires.setSeconds(randomExpires.getSeconds() + Math.floor(Math.random() * 60) + 30);
    
    const securityHeaders = {
      ...corsHeaders,
      'Content-Type': 'application/javascript',
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': randomExpires.toUTCString(),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-Request-ID': Math.random().toString(36).substring(2, 15),
      'Content-Security-Policy': "default-src 'none'; script-src 'unsafe-eval'"
    };
    
    return new Response(obfuscatedScript, { headers: securityHeaders });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
