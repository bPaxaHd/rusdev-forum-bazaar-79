
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    
    // Создаем клиент Supabase c сервисным ключом для обхода RLS
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Получаем скрипт из базы данных
    const { data, error } = await supabase
      .rpc('get_secure_script', { script_name: 'devTools' });
    
    if (error) throw error;
    
    // Добавляем "маскировку" для доп. безопасности
    const obfuscatedScript = `
    /* DevTalk Production Tools */
    try {
      const scriptContent = atob("${data}");
      const execScript = new Function(scriptContent);
      execScript();
    } catch (e) {
      console.log('Development tools not available');
    }
    `;
    
    return new Response(obfuscatedScript, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/javascript' 
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
