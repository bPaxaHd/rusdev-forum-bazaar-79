
// Editor Runtime Module
import { editor } from './devtalk-editor.js';

console.log('Editor runtime module loaded');

// Setup runtime environment
const initRuntime = () => {
  if (!editor.isReady()) {
    console.warn('Editor not ready, waiting...');
    setTimeout(initRuntime, 100);
    return;
  }
  
  console.log('Editor runtime initialized, version:', editor.getVersion());
  
  // Additional runtime functionality would go here
  window.__DEVTALK_RUNTIME__ = {
    active: true,
    mode: 'development',
    features: ['syntax-highlighting', 'auto-complete', 'live-preview']
  };
};

// Start initialization process
initRuntime();

// Export runtime functionality
export const runtime = {
  isActive: () => window.__DEVTALK_RUNTIME__?.active || false,
  getMode: () => window.__DEVTALK_RUNTIME__?.mode || 'unknown',
  getFeatures: () => window.__DEVTALK_RUNTIME__?.features || []
};

export default runtime;
