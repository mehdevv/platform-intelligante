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
})
