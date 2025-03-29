
// Custom source file for DevTalk Forum project
// Based on similar implementation from FERVENT project

// Initialize application configuration
const initConfig = () => {
  console.log('DevTalk Forum - Custom source initialization');
  
  // Security and performance enhancements
  const securityLayer = {
    preventCopy: (event) => {
      if (process.env.NODE_ENV === 'production') {
        event.preventDefault();
        console.warn('Copying is disabled in production environment');
      }
    },
    
    preventInspect: () => {
      // Advanced DevTools detection
      const startTime = Date.now();
      
      setInterval(() => {
        const currentTime = Date.now();
        const timeDifference = currentTime - startTime;
        
        if (timeDifference > 200) {
          console.warn('DevTools detected');
          document.body.innerHTML = '<div class="p-6">Для продолжения работы закройте инструменты разработчика</div>';
        }
      }, 1000);
    },
    
    secureApp: () => {
      // Prevent common attack vectors
      document.addEventListener('contextmenu', (e) => e.preventDefault());
      document.addEventListener('copy', securityLayer.preventCopy);
      document.addEventListener('cut', securityLayer.preventCopy);
      
      // Prevent keyboard shortcuts for developer tools
      document.addEventListener('keydown', (e) => {
        if (
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
        }
      });
    }
  };
  
  // Initialize application features
  const initializeFeatures = () => {
    // Add additional initialization code here
    console.log('DevTalk features initialized');
    
    // In production, apply security measures
    if (process.env.NODE_ENV === 'production') {
      securityLayer.secureApp();
      securityLayer.preventInspect();
    }
  };
  
  // Optimize performance
  const optimizePerformance = () => {
    // Perform runtime optimizations
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 100) {
          console.warn(`Performance issue detected: ${entry.name} took ${entry.duration}ms`);
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource', 'navigation', 'longtask'] });
  };
  
  // Application monitoring
  const setupMonitoring = () => {
    window.addEventListener('error', (event) => {
      console.error('Application error:', event.error);
      // Here you could implement error reporting to a backend service
    });
  };
  
  // Execute initialization
  initializeFeatures();
  optimizePerformance();
  setupMonitoring();
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initConfig);

// Expose global API for application use
window.DevTalkAPI = {
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  ready: () => console.log('DevTalk API is ready')
};

// Export for module usage
export default {
  init: initConfig,
  version: '1.0.0'
};
