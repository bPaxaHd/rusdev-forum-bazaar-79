
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";

serve(async (req) => {
  // Проверяем заголовок на наличие WebSocket запроса
  const upgradeHeader = req.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  // Создаем WebSocket соединение
  const { socket, response } = Deno.upgradeWebSocket(req);
  
  // Получаем параметры для Supabase
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Обрабатываем сообщения от клиента
  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.action === 'getScript' && data.name) {
        // Получаем скрипт из базы данных
        const { data: scriptData, error } = await supabase
          .rpc('get_secure_script', { script_name: data.name });
        
        if (error) {
          socket.send(JSON.stringify({ error: 'Failed to load script' }));
          return;
        }
        
        // Отправляем скрипт обратно клиенту
        socket.send(JSON.stringify({ 
          script: scriptData,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      socket.send(JSON.stringify({ error: 'Invalid request' }));
    }
  };

  // Обрабатываем закрытие соединения
  socket.onclose = () => {
    // Очистка ресурсов при необходимости
  };

  // Возвращаем ответ с обновленным соединением
  return response;
});
