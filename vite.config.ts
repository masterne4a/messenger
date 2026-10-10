import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// в CI GITHUB_REPOSITORY = "owner/repo" → base = "/<repo>/" для project pages
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: repo ? `/${repo}/` : '/',
  plugins: [react()],
})
