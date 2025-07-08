// Configuración de entornos para Última Línea
export const ENV_CONFIG = {
    development: {
        PORT: 9000,
        NODE_ENV: 'development',
        API_BASE_URL: 'http://localhost:9000',
        LOG_LEVEL: 'debug',
        ENABLE_HOT_RELOAD: true,
        CORS_ORIGIN: '*',
        COMPRESSION: false,
        CACHE_CONTROL: 'no-cache',
        SECURITY_HEADERS: false
    },
    
    production: {
        PORT: process.env.PORT || 9000,
        NODE_ENV: 'production',
        API_BASE_URL: process.env.API_BASE_URL || 'https://ultima-linea.com',
        LOG_LEVEL: 'error',
        ENABLE_HOT_RELOAD: false,
        CORS_ORIGIN: process.env.CORS_ORIGIN || 'https://ultima-linea.com',
        COMPRESSION: true,
        CACHE_CONTROL: 'max-age=86400',
        SECURITY_HEADERS: true
    },
    
    test: {
        PORT: 9001,
        NODE_ENV: 'test',
        API_BASE_URL: 'http://localhost:9001',
        LOG_LEVEL: 'silent',
        ENABLE_HOT_RELOAD: false,
        CORS_ORIGIN: '*',
        COMPRESSION: false,
        CACHE_CONTROL: 'no-cache',
        SECURITY_HEADERS: false
    }
};

export const getConfig = () => {
    const env = process.env.NODE_ENV || 'development';
    return ENV_CONFIG[env] || ENV_CONFIG.development;
};
