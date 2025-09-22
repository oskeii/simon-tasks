import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Determine proxy target based on environment
let proxyTarget = process.env.NODE_ENV === 'development' && process.env.DOCKER_ENV
? 'http://backend:8000' // Docker: use service name
: 'http://localhost:8000'; // Local: use localhost

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 3000,
        host: process.env.DOCKER_ENV ? '0.0.0.0' : 'localhost',
        proxy: {
            '/api': {
                target: proxyTarget,
                changeOrigin: true // match Host header to target
            },
            '/media': {
                target: proxyTarget,
                changeOrigin: true
            },
        },
    },
});

// - --host 0.0.0.0 = tells Vite to accept connections from outside container
// - Default is localhost/127.0.0.1 which only works inside container
// - Without this, you couldn't access the app from your browser