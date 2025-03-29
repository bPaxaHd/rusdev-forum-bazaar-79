
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
        // Максимальная обфускация
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 1, // Максимальный уровень
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.5,
        debugProtection: true,
        debugProtectionInterval: true, // Включаем интервал для постоянной защиты
        disableConsoleOutput: true,
        identifierNamesGenerator: 'mangled-shuffled', // Улучшенная генерация имен
        renameGlobals: true, // Переименовываем глобальные переменные
        rotateStringArray: true,
        selfDefending: true,
        stringArray: true,
        stringArrayEncoding: ['rc4'], // Более надежное шифрование
        stringArrayThreshold: 1, // Максимальный уровень
        transformObjectKeys: true,
        unicodeEscapeSequence: true, // Включаем для лучшей обфускации строк
        // Расширенные настройки для максимальной защиты
        domainLock: [], // Можно добавить домены для lock
        reservedNames: ['React', 'ReactDOM'],
        seed: Math.random() * 10000000,
        sourceMap: false,
        sourceMapMode: 'separate',
        splitStrings: true,
        splitStringsChunkLength: 3, // Уменьшаем для большей защиты
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
        passes: 3, // Увеличиваем количество проходов для лучшей оптимизации
        toplevel: true, // Позволяет удалять неиспользуемые функции на верхнем уровне
        unsafe: true, // Включаем небезопасные оптимизации для лучшей обфускации
      },
      mangle: {
        toplevel: true, 
        properties: {
          regex: /^_/,
          keep_quoted: true // Сохраняем только свойства в кавычках
        },
        reserved: ['React', 'ReactDOM'] // Сохраняем важные имена
      },
      format: {
        comments: false,
        ascii_only: true, // Используем только ASCII символы
        ecma: 5 // Совместимость со старыми браузерами для максимальной поддержки
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
        // Добавляем модификацию имен файлов для затруднения определения содержимого
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]'
      }
    }
  },
  // Добавляем кастомные определения для предотвращения утечек
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'import.meta.env.APP_TYPE': JSON.stringify('devtalk-forum'),
    'import.meta.env.ORIGIN': JSON.stringify('internal-development')
  },
  // Блокировка генерации деталей в ошибках
  logLevel: mode === 'production' ? 'silent' : 'info'
}));
