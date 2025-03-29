
/**
 * Development tools loader
 * This file loads external development scripts when in development mode
 */

export const loadDevTools = (): void => {
  if (import.meta.env.DEV) {
    // Create and append script for development tools
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    document.body.appendChild(script);
    
    console.log('Development tools loaded');
  }
};
