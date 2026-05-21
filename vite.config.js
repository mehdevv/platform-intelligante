import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Always treat this folder (researcha-app) as project root so .env is found even if the shell cwd is the parent directory.
const appDir = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    root: appDir,
    envDir: appDir,
    plugins: [react()],
    server: {
        // imgBB API has no CORS for some browsers; proxy only in dev.
        proxy: {
            '/__imgbb': {
                target: 'https://api.imgbb.com',
                changeOrigin: true,
                secure: true,
                rewrite: p => p.replace(/^\/__imgbb/, ''),
            },
        },
    },
    resolve: {
        // One pdfjs-dist for react-pdf + app (avoids API/worker split across versions in dev).
        dedupe: ['pdfjs-dist'],
    },
    // Pre-bundle pdf-lib so dev never serves a stale `node_modules/.vite/deps/pdf-lib.js` (504 Outdated Optimize Dep).
    optimizeDeps: {
        include: ['pdf-lib', 'pdfjs-dist'],
    },
})
