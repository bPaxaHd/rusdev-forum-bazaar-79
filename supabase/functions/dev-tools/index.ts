
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Функция для шифрования скрипта с дополнительной защитой
const encryptScript = (script: string, nonce: string = ''): string => {
  // Используем nonce как дополнительный ключ для шифрования
  const key = nonce ? nonce.substring(0, 8) : Math.random().toString(36).substring(2, 10);
  
  // Шифрование на основе XOR с динамическим ключом
  const encryptChar = (c: string, index: number): string => {
    const charCode = c.charCodeAt(0);
    const keyChar = key.charCodeAt(index % key.length);
    return String.fromCharCode(charCode ^ keyChar);
  };
  
  // Шифруем скрипт
  const encryptedScript = script.split('')
    .map((char, index) => encryptChar(char, index))
    .join('');
  
  // Возвращаем Base64-кодированную строку
  return btoa(encryptedScript);
};

serve(async (req) => {
  // Обрабатываем CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Не используем хардкод, а читаем переменные из окружения
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Получаем nonce из запроса для дополнительного шифрования
    let nonce = '';
    try {
      // Пытаемся получить nonce из параметров запроса
      const url = new URL(req.url);
      nonce = url.searchParams.get('nonce') || '';
    } catch {
      // Используем запасной вариант, если не можем получить nonce
      nonce = Math.random().toString(36).substring(2, 15);
    }
    
    // Создаем клиент Supabase c сервисным ключом для обхода RLS
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Получаем скрипт из базы данных
    const { data, error } = await supabase
      .rpc('get_secure_script', { script_name: 'devTools' });
    
    if (error) throw error;
    
    // Шифруем скрипт с двойной защитой
    const encryptedScript = encryptScript(data, nonce);
    
    // Создаем обфусцированный скрипт с механизмом дешифрования и защитой от анализа
    const obfuscatedScript = `
    /* DevTalk Production Tools */
    (function() {
      try {
        // Расшифровка с помощью динамического ключа
        const decrypt = function(encryptedData, key) {
          // Ключ генерируется на основе информации из среды
          const dynamicKey = key || (window.navigator.userAgent.length % 10).toString() 
            + (new Date().getHours()).toString();
          
          // Декодируем Base64
          const encryptedString = atob(encryptedData);
          
          // Расшифровываем с помощью XOR
          const decryptChar = function(c, index) {
            const charCode = c.charCodeAt(0);
            const keyChar = dynamicKey.charCodeAt(index % dynamicKey.length);
            return String.fromCharCode(charCode ^ keyChar);
          };
          
          // Применяем расшифровку
          return encryptedString.split('').map(decryptChar).join('');
        };
        
        // Динамическое выполнение с защитой от отладки
        const secureEval = function(code) {
          const timestamp = Date.now();
          try {
            // Защита от отладки
            debugger;
            if (Date.now() - timestamp > 100) {
              // Обнаружена попытка отладки
              console.clear();
              return;
            }
            
            // Защищенное выполнение
            new Function(code)();
          } catch (e) {
            // Скрываем ошибки
            console.log('Development tools not available');
          }
        };
        
        // Нестандартная обработка для обхода простых анализаторов
        const scriptContent = atob("${encryptedScript}");
        
        // Добавляем задержку для защиты от автоматизированного анализа
        setTimeout(function() {
          // Добавляем защиту от инспекции
          const originalToString = Function.prototype.toString;
          Function.prototype.toString = function() {
            if (this === secureEval || this === decrypt) {
              return "function() { [native code] }";
            }
            return originalToString.call(this);
          };
          
          // Выполняем с нестандартной задержкой
          secureEval(decrypt(scriptContent, "${nonce}"));
        }, Math.random() * 50 + 10);
      } catch (e) {
        console.log('Development tools not available');
      }
    })();
    `;
    
    // Генерируем случайные заголовки для дополнительной защиты
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
