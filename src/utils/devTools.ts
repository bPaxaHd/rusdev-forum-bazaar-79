
export const loadDevTools = (): void => {
  if (import.meta.env.DEV) {
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    document.body.appendChild(script);
  }
};
