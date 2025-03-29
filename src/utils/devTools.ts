
export const loadRemoteTools = async (): Promise<void> => {
  if (!import.meta.env.PROD) {
    try {
      const res = await fetch('/api/dev-tools'); // Бэкенд отдаёт скрипт только в DEV
      const js = await res.text();
      const script = document.createElement('script');
      script.textContent = js;
      document.body.appendChild(script).remove(); // скрыть из DOM
    } catch {
      // Без ошибок
    }
  }
};
