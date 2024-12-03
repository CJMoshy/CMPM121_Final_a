// vite.config.js
import { defineConfig } from "npm:vite";

export default defineConfig({
    base: "./",
    logLevel: 'warning',
    build: {
        outDir: 'dist', // Output directory for production
        assetsInlineLimit: 0, // Disables inlining completely
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        }
    }
})