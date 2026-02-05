import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.S3_ENDPOINT': JSON.stringify(process.env.S3_ENDPOINT),
    'process.env.S3_REGION': JSON.stringify(process.env.S3_REGION),
    'process.env.S3_ACCESS_KEY': JSON.stringify(process.env.S3_ACCESS_KEY),
    'process.env.S3_SECRET_KEY': JSON.stringify(process.env.S3_SECRET_KEY),
    'process.env.S3_BUCKET_NAME': JSON.stringify(process.env.S3_BUCKET_NAME),
    'process.env.S3_FORCE_PATH_STYLE': JSON.stringify(process.env.S3_FORCE_PATH_STYLE),
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
