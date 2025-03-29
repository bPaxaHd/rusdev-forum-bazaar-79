import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import JavaScriptObfuscator from 'rollup-plugin-obfuscator';

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'production' && JavaScriptObfuscator({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.5,
        debugProtection: true,
        debugProtectionInterval: 50,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'mangled-shuffled',
        renameGlobals: true,
        rotateStringArray: true,
        selfDefending: true,
        stringArray: true,
        stringArrayEncoding: ['rc4'],
        stringArrayThreshold: 1,
        transformObjectKeys: true,
        unicodeEscapeSequence: true,
        domainLock: [],
        reservedNames: ['React', 'ReactDOM'],
        seed: Math.random() * 10000000,
        sourceMap: false,
        sourceMapMode: 'separate',
        splitStrings: true,
        splitStringsChunkLength: 3,
        stringArrayWrappersCount: 5,
        stringArrayWrappersType: 'function',
        stringArrayWrappersParametersMaxCount: 5,
        stringArrayWrappersChainedCalls: true,
        target: 'browser'
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3,
        toplevel: true,
        unsafe: true,
      },
      mangle: {
        toplevel: true, 
        properties: {
          regex: /^_/,
          keep_quoted: true
        },
        reserved: ['React', 'ReactDOM']
      },
      format: {
        comments: false,
        ascii_only: true,
        ecma: 5
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
          ],
        },
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'import.meta.env.APP_TYPE': JSON.stringify('devtalk-forum'),
    'import.meta.env.ORIGIN': JSON.stringify('internal-development')
  },
  logLevel: mode === 'production' ? 'silent' : 'info'
}));
