import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No Coolify/Docker, as variáveis estão no process.env
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    'process.env.MINIO_ENDPOINT': JSON.stringify(process.env.MINIO_ENDPOINT || ''),
    'process.env.MINIO_REGION': JSON.stringify(process.env.MINIO_REGION || 'us-east-1'),
    'process.env.MINIO_ACCESS_KEY': JSON.stringify(process.env.MINIO_ACCESS_KEY || ''),
    'process.env.MINIO_SECRET_KEY': JSON.stringify(process.env.MINIO_SECRET_KEY || ''),
    'process.env.MINIO_BUCKET': JSON.stringify(process.env.MINIO_BUCKET || 'typebot'),
    'process.env.MINIO_PUBLIC_URL': JSON.stringify(process.env.MINIO_PUBLIC_URL || ''),
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});