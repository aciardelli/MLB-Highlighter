import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const clientPort = parseInt(env.VITE_PORT || '3000')
    const serverPort = env.VITE_SERVER_PORT || '8000'

    return {
        plugins: [react()],
        server: {
            port: clientPort,
            proxy: {
                '/api': {
                    target: `http://localhost:${serverPort}`,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api/, ''),
                },
                '/video': {
                    target: `http://127.0.0.1:${serverPort}/video`,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/video/, ''),
                },
            },
        },
    }
})
