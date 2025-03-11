import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ephemeral Chat',
        short_name: 'EC',
        description: 'A lightweight, anonymous chat application that prioritizes simplicity and privacy.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/public/ephemeral-chat.ico',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/public/ephemeral-chat.ico',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
