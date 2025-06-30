import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    // Output to the dist directory
    outDir: 'dist',
    
    // Generate source maps
    sourcemap: true,
    
    // Don't minify the output
    minify: false,
    
    // Configure the library build
    lib: {
      // The entry point
      entry: resolve(__dirname, 'src/index.ts'),
      
      // Output file name
      name: 'backchannel',
      
      // Output format - IIFE for script tag usage
      formats: ['iife'],
      
      // File name pattern
      fileName: () => 'backchannel.js',
    },
    
    // Make sure all dependencies are bundled
    rollupOptions: {
      output: {
        // Global variable name for IIFE format
        name: 'BackChannel',
        
        // Ensure exports are exposed as properties on the global variable
        extend: true,
      }
    }
  }
})
