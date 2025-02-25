import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// Define dirname equivalent for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Simple check if file exists
const dataFilePath = path.resolve(__dirname, '../data/processed_files.json')
console.log('Data file path:', dataFilePath)
console.log('Data file exists:', fs.existsSync(dataFilePath))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-data-file',
      buildStart() {
        // Create public/data directory
        const publicDir = path.resolve(__dirname, 'public/data')
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true })
        }
        
        // Copy the data file to public/data if it exists
        if (fs.existsSync(dataFilePath)) {
          const destPath = path.resolve(__dirname, 'public/data/processed_files.json')
          try {
            fs.copyFileSync(dataFilePath, destPath)
            console.log('Successfully copied data file to public/data')
          } catch (err) {
            console.error('Error copying data file:', err)
          }
        } else {
          console.error('Data file not found at:', dataFilePath)
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
}) 