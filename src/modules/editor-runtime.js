
(function() {
  const editorRuntime = {
    init: function() {
      console.log('Editor runtime initialized');
    },
    load: function() {
      window.__EDITOR_MODE = true;
    }
  };
  
  editorRuntime.init();
  editorRuntime.load();
  
  window.editorRuntime = editorRuntime;
})();
