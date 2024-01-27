import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000, // Set your Vite development server port
  },
};