
// Local implementation of essential selector functionality
// This replaces the external CDN script from gpteng.co

(function() {
  // Version tracking
  window.LOV_SELECTOR_SCRIPT_VERSION = "1.0.0";
  
  // Configuration
  const CONFIG = {
    HIGHLIGHT_COLOR: "#0da2e7",
    HIGHLIGHT_BG: "#0da2e71a",
    Z_INDEX: 10000,
    SELECTED_ATTR: "data-lov-selected",
    HOVERED_ATTR: "data-lov-hovered"
  };
  
  // Communication with parent window
  function sendMessage(message) {
    try {
      if (window.parent && window !== window.parent) {
        window.parent.postMessage({
          type: "SELECTOR_SCRIPT_LOADED",
          payload: { version: window.LOV_SELECTOR_SCRIPT_VERSION }
        }, "*");
      }
    } catch (error) {
      console.log("DevTalk selector initialized");
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    // Only run in iframe mode
    if (window.top === window.self) return;
    
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
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
