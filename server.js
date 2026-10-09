import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:8000';

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = url.pathname;

  // 1. PROXY /api/* to BACKEND at http://localhost:8000
  if (pathname.startsWith('/api/')) {
    const backendTarget = new URL(pathname + url.search, BACKEND_URL);
    
    const proxyReq = http.request(
      backendTarget,
      {
        method: req.method,
        headers: {
          ...req.headers,
          host: backendTarget.host,
        },
      },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      }
    );

    proxyReq.on('error', (err) => {
      console.warn(`[API Proxy Warning] Could not connect to ${BACKEND_URL}${pathname}: ${err.message}`);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          error: 'Backend Offline',
          message: `Unable to connect to backend at ${BACKEND_URL}. Ensure backend is running.`,
          endpoint: pathname,
        })
      );
    });

    req.pipe(proxyReq);
    return;
  }

  // 2. STATIC FILE SERVING
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath)) {
    // Fallback to public/index.html (SPA routing)
    filePath = path.join(__dirname, 'public', 'index.html');
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🚀 TaskMentor.ai Dev Server is listening!`);
  console.log(`🌐 Local Preview:  http://localhost:${PORT}`);
  console.log(`🔗 Backend Target: ${BACKEND_URL}`);
  console.log(`======================================================\n`);
});
