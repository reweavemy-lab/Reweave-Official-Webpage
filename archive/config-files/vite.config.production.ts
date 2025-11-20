import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import compression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'
import purgecss from 'vite-plugin-purgecss'

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    purgecss({
      content: [
        './src/**/*.tsx',
        './src/**/*.ts',
        './index.html',
      ],
      safelist: [
        // Tailwind CSS classes that are used dynamically
        /^bg-/,
        /^text-/,
        /^border-/,
        /^hover:/,
        /^focus:/,
        /^active:/,
        /^disabled:/,
        /^btn-/,
        /^card-/,
        /^modal-/,
        /^form-/,
        /^input-/,
        /^select-/,
        /^textarea-/,
        /^checkbox-/,
        /^radio-/,
        // Animation classes
        /^animate-/,
        /^transition-/,
        /^duration-/,
        /^delay-/,
        /^ease-/,
        // Grid and flexbox
        /^grid-/,
        /^col-/,
        /^row-/,
        /^gap-/,
        /^justify-/,
        /^items-/,
        /^content-/,
        /^self-/,
        /^flex-/,
        // Spacing
        /^p-/,
        /^px-/,
        /^py-/,
        /^pt-/,
        /^pr-/,
        /^pb-/,
        /^pl-/,
        /^m-/,
        /^mx-/,
        /^my-/,
        /^mt-/,
        /^mr-/,
        /^mb-/,
        /^ml-/,
        // Sizing
        /^w-/,
        /^h-/,
        /^min-w-/,
        /^min-h-/,
        /^max-w-/,
        /^max-h-/,
        // Typography
        /^font-/,
        /^text-/,
        /^leading-/,
        /^tracking-/,
        /^list-/,
        // Backgrounds
        /^bg-/,
        /^from-/,
        /^via-/,
        /^to-/,
        // Borders
        /^border-/,
        /^rounded-/,
        // Effects
        /^shadow-/,
        /^opacity-/,
        /^mix-blend-/,
        /^bg-blend-/,
        // Filters
        /^blur-/,
        /^brightness-/,
        /^contrast-/,
        /^drop-shadow-/,
        /^grayscale-/,
        /^hue-rotate-/,
        /^invert-/,
        /^saturate-/,
        /^sepia-/,
        // Tables
        /^table-/,
        // Transforms
        /^transform$/,
        /^scale-/,
        /^rotate-/,
        /^translate-/,
        /^skew-/,
        // Interactivity
        /^appearance-/,
        /^cursor-/,
        /^outline-/,
        /^pointer-events-/,
        /^resize$/,
        /^select-/,
        /^user-select-/,
        // SVG
        /^fill-/,
        /^stroke-/,
        // Accessibility
        /^sr-only$/,
        /^not-sr-only$/,
        // Layout
        /^container$/,
        /^box-/,
        /^clear-/,
        /^float-/,
        /^object-/,
        /^overflow-/,
        /^overscroll-/,
        /^position-/,
        /^inset-/,
        /^visible$/,
        /^invisible$/,
        /^z-/,
        // Reweave specific colors
        'text-indigo',
        'bg-indigo',
        'text-sage',
        'bg-sage',
        'text-gold',
        'bg-gold',
        'text-terracotta',
        'bg-terracotta',
        'text-ivory',
        'bg-ivory',
        'text-sand',
        'bg-sand',
        'text-pebble',
        'bg-pebble',
        'text-navy',
        'bg-navy',
      ],
    }),
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor libraries
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react', '@headlessui/react'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers'],
          'utils-vendor': ['axios', 'date-fns', 'clsx', 'class-variance-authority'],
          'charts-vendor': ['chart.js', 'react-chartjs-2'],
          'editor-vendor': ['react-quill'],
          // Admin specific
          'admin-vendor': ['react-router-dom', 'chart.js', 'react-chartjs-2'],
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name;
          if (name.includes('vendor')) {
            return `assets/vendor/${name}-[hash].js`;
          }
          return `assets/[name]-[hash].js`;
        },
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
    emptyOutDir: true,
    sourcemap: false, // Disable in production for security
  },
  server: {
    port: 5173,
    host: true,
    cors: {
      origin: [
        'https://reweave.my',
        'https://www.reweave.my',
        'https://admin.reweave.my',
      ],
      credentials: true,
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'axios',
      'date-fns',
      'chart.js',
      'react-chartjs-2',
      'react-hook-form',
      '@hookform/resolvers',
    ],
  },
  define: {
    __VITE_PRODUCTION__: true,
  },
})