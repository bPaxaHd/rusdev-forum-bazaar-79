
// Development tools module
import devToolsSocket from './dev-tools-socket.js';

console.log('Dev tools module loaded');

// Development tools API
class DevTools {
  constructor() {
    this.initialized = false;
    this.activeTools = new Set();
    console.log('DevTools initializing...');
    this.init();
  }

  async init() {
    try {
      // Connect to dev tools socket
      devToolsSocket.connect();
      
      devToolsSocket.on('connect', () => {
        this.initialized = true;
        console.log('DevTools initialization complete');
      });

      devToolsSocket.on('disconnect', () => {
        console.log('DevTools disconnected');
      });
      
      // Register default tools
      this.registerTool('console');
      this.registerTool('inspector');
      this.registerTool('network');
    } catch (error) {
      console.error('DevTools initialization failed:', error);
    }
  }

  registerTool(toolName) {
    if (this.activeTools.has(toolName)) return;
    
    console.log(`Registering dev tool: ${toolName}`);
    this.activeTools.add(toolName);
    
    // Notify about new tool
    if (this.initialized) {
      devToolsSocket.send({
        action: 'tool_registered',
        tool: toolName
      });
    }
  }

  unregisterTool(toolName) {
    if (!this.activeTools.has(toolName)) return;
    
    console.log(`Unregistering dev tool: ${toolName}`);
    this.activeTools.delete(toolName);
    
    // Notify about removed tool
    if (this.initialized) {
      devToolsSocket.send({
        action: 'tool_unregistered',
        tool: toolName
      });
    }
  }

  getActiveTools() {
    return Array.from(this.activeTools);
  }
}

// Create and export instance
export const devTools = new DevTools();
export default devTools;
