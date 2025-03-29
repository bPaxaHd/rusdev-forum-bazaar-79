
(function() {
  const devTools = {
    version: '1.0.0',
    init: function() {
      console.log('DevTools initialized');
    }
  };
  
  devTools.init();
  
  window.devTools = devTools;
})();
