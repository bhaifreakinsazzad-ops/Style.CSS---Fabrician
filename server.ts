import 'dotenv/config';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import metaCapiHandler from './api/meta-capi.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portFlagIdx = process.argv.indexOf('--port');
  if (portFlagIdx !== -1 && process.argv[portFlagIdx + 1]) {
    const parsed = Number(process.argv[portFlagIdx + 1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const envPort = Number(process.env.PORT);
  if (Number.isFinite(envPort) && envPort > 0) {
    if (process.env.NGINX_PORT && String(envPort) === process.env.NGINX_PORT) {
      return Number(process.env.DEFAULT_APP_PORT || 3000);
    }
    return envPort;
  }
  return Number(process.env.DEFAULT_APP_PORT || 3000);
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  const port = resolvePort();
  const isProd = process.env.NODE_ENV === 'production';

  app.set('trust proxy', true);
  app.use(express.json({ limit: '256kb' }));

  app.all('/api/meta-capi', (req, res) => {
    void metaCapiHandler(req, res);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: hmrDisabled ? false : { server: httpServer },
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`FABRICIAN server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
  process.exit(1);
});
