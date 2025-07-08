import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware de seguridad
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

// Middleware para compresión
app.use(compression());

// Middleware CORS
app.use(cors());

// Middleware para servir archivos estáticos
app.use(express.static('.', {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0',
    etag: true,
    lastModified: true
}));

// Middleware para logging
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

// Rutas principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoints para estadísticas del juego
app.get('/api/stats', (req, res) => {
    res.json({
        status: 'active',
        version: '1.0.0',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Endpoint para obtener configuración del juego
app.get('/api/config', (req, res) => {
    res.json({
        gameTitle: 'Última Línea',
        version: '1.0.0',
        author: 'Elias',
        features: [
            'Modular Architecture',
            'Mobile Support', 
            'Multiple Enemy Types',
            'Ability System',
            'Wave Progression',
            'Console Commands'
        ]
    });
});

// Middleware para manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Página no encontrada',
        message: 'La ruta solicitada no existe',
        timestamp: new Date().toISOString()
    });
});

// Middleware para manejo de errores del servidor
app.use((err, req, res, next) => {
    console.error('Error del servidor:', err.stack);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'production' ? 'Algo salió mal' : err.message,
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('\n🎮 ÚLTIMA LÍNEA - SERVIDOR INICIADO');
    console.log('=====================================');
    console.log(`🌐 Servidor: http://localhost:${PORT}`);
    console.log(`📱 Local:    http://127.0.0.1:${PORT}`);
    console.log(`🔧 API:      http://localhost:${PORT}/api/stats`);
    console.log(`⚙️  Config:   http://localhost:${PORT}/api/config`);
    console.log(`🛠️  Entorno:  ${process.env.NODE_ENV || 'development'}`);
    console.log('=====================================');
    console.log('✅ Servidor listo para recibir conexiones\n');
});

// Manejo graceful de cierre del servidor
process.on('SIGINT', () => {
    console.log('\n🔄 Cerrando servidor graciosamente...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Cerrando servidor graciosamente...');
    process.exit(0);
});
