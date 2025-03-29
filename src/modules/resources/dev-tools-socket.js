
// Development tools socket module
console.log('Dev tools socket module loaded');

// Create a mock WebSocket for development tools
class DevToolsSocket {
  constructor() {
    this.connected = false;
    this.events = {};
    console.log('DevTools socket initialized');
  }

  connect() {
    console.log('DevTools socket connecting...');
    setTimeout(() => {
      this.connected = true;
      this.trigger('connect', { success: true });
      console.log('DevTools socket connected');
    }, 500);
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  trigger(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  }

  send(data) {
    console.log('DevTools socket send:', data);
    // Echo back for testing
    setTimeout(() => {
      this.trigger('message', {
        type: 'echo',
        data: data,
        timestamp: Date.now()
      });
    }, 100);
  }

  disconnect() {
    if (!this.connected) return;
    this.connected = false;
    this.trigger('disconnect', { reason: 'client_disconnected' });
    console.log('DevTools socket disconnected');
  }
}

// Export the module
export const devToolsSocket = new DevToolsSocket();
export default devToolsSocket;
