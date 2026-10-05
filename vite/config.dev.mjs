import { defineConfig } from 'vite';

function ttsProxyPlugin() {
    return {
        name: 'tts-proxy-plugin',
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (req.url && req.url.startsWith('/api/tts')) {
                    const parsedUrl = new URL(req.url, 'http://localhost:8080');
                    const text = parsedUrl.searchParams.get('text');
                    if (!text) {
                        res.statusCode = 400;
                        res.end('Missing text parameter');
                        return;
                    }
                    try {
                        const googleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
                        const response = await fetch(googleUrl, {
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });
                        if (!response.ok) {
                            res.statusCode = response.status;
                            res.end('Upstream TTS error');
                            return;
                        }
                        const arrayBuffer = await response.arrayBuffer();
                        res.setHeader('Content-Type', 'audio/mpeg');
                        res.setHeader('Cache-Control', 'public, max-age=86400');
                        res.end(Buffer.from(arrayBuffer));
                    } catch (e) {
                        res.statusCode = 500;
                        res.end(e.message);
                    }
                    return;
                }
                next();
            });
        }
    };
}

export default defineConfig({
    base: './',
    plugins: [ttsProxyPlugin()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']
                }
            }
        },
    },
    server: {
        port: 8080
    }
});
