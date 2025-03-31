
// Local implementation of essential selector functionality
// This replaces the external CDN script from gpteng.co

(function() {
  // Version tracking
  window.LOV_SELECTOR_SCRIPT_VERSION = "1.0.1";
  
  // Configuration
  const CONFIG = {
    HIGHLIGHT_COLOR: "#0da2e7",
    HIGHLIGHT_BG: "#0da2e71a",
    Z_INDEX: 10000,
    SELECTED_ATTR: "data-lov-selected",
    HOVERED_ATTR: "data-lov-hovered"
  };
  
  // Communication with parent window (secured to prevent any external access)
  function sendMessage(message) {
    try {
      if (window.parent && window !== window.parent) {
        // Only send to same origin
        if (window.location.origin === window.parent.location.origin) {
          window.parent.postMessage({
            type: "SELECTOR_SCRIPT_LOADED",
            payload: { version: window.LOV_SELECTOR_SCRIPT_VERSION }
          }, window.location.origin);
        }
      }
    } catch (error) {
      console.log("DevTalk selector initialized");
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    // Signal that selector script is loaded
    sendMessage();
    
    // Add custom styles for selection highlighting
    const style = document.createElement('style');
    style.textContent = `
      [${CONFIG.SELECTED_ATTR}] {
        position: relative;
      }
      [${CONFIG.SELECTED_ATTR}]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        outline: 1px dashed ${CONFIG.HIGHLIGHT_COLOR} !important;
        outline-offset: 3px !important;
        z-index: ${CONFIG.Z_INDEX};
        pointer-events: none;
      }
      [${CONFIG.HOVERED_ATTR}] {
        position: relative;
      }
      [${CONFIG.HOVERED_ATTR}]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        outline: 1px dashed ${CONFIG.HIGHLIGHT_COLOR} !important;
        background-color: ${CONFIG.HIGHLIGHT_BG} !important;
        z-index: ${CONFIG.Z_INDEX};
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Block any attempts to inject external scripts
  function blockExternalScripts() {
    // Intercept script element creation
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(document, tagName);
      
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute;
        
        element.setAttribute = function(name, value) {
          if (name === 'src' && typeof value === 'string') {
            // Block external scripts from suspicious domains
            if (value.includes('gpteng.co') || 
                value.includes('gptengineer') ||
                (value.includes('cdn.') && !value.includes('jsdelivr'))) {
              console.warn('Blocked attempt to load external script:', value);
              return;
            }
          }
          return originalSetAttribute.call(this, name, value);
        };
      }
      
      return element;
    };
    
    // Intercept appendChild to prevent script injection
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(node) {
      if (node.tagName === 'SCRIPT' && node.src) {
        // Block external scripts from suspicious domains
        if (node.src.includes('gpteng.co') || 
            node.src.includes('gptengineer') ||
            (node.src.includes('cdn.') && !node.src.includes('jsdelivr'))) {
          console.warn('Blocked attempt to append external script:', node.src);
          return document.createComment('Blocked script');
        }
      }
      return originalAppendChild.call(this, node);
    };
  }
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      blockExternalScripts();
    });
  } else {
    init();
    blockExternalScripts();
  }
})();
