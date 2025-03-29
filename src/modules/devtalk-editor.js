
(function() {
  const devtalkEditor = {
    init: function() {
      console.log('DevTalk editor initialized');
    },
    setupEnvironment: function() {
      window.__DEVTALK_ENVIRONMENT = 'internal';
    }
  };
  
  devtalkEditor.init();
  devtalkEditor.setupEnvironment();
  
  window.devtalkEditor = devtalkEditor;
})();
