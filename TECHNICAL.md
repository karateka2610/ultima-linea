# 📋 Documentación Técnica - Última Línea

## 🏗️ Arquitectura del Sistema

### **Backend (Node.js + Express)**
- **Framework**: Express.js 4.18.2
- **Puerto**: 9000 (configurable)
- **Middleware**: Helmet, Compression, CORS
- **API**: RESTful endpoints para estadísticas

### **Frontend (Vanilla JavaScript ES6+)**
- **Módulos ES6**: Importación nativa de módulos
- **Canvas API**: Renderizado 2D con optimizaciones
- **Arquitectura**: Sistema de entidades y componentes
- **Performance**: 60 FPS targeting con monitoring

### **Herramientas de Desarrollo**
- **Testing**: Suite personalizada con 19 tests
- **Linting**: ESLint con reglas personalizadas
- **Bundling**: Terser para minificación
- **Hot Reload**: Nodemon para desarrollo

## 🔧 Configuración Técnica

### **Variables de Entorno**
```bash
NODE_ENV=development          # Entorno de ejecución
PORT=9000                    # Puerto del servidor
CORS_ORIGIN=*               # Origen CORS permitido
API_BASE_URL=localhost:9000  # URL base de la API
```

### **Estructura de Datos**

#### **Game State**
```javascript
{
    isRunning: boolean,
    isPaused: boolean,
    gameOver: boolean,
    startTime: timestamp,
    currentWave: number,
    enemies: Enemy[],
    projectiles: Projectile[],
    powerUps: PowerUp[],
    particles: Particle[]
}
```

#### **Player State**
```javascript
{
    x: number,
    y: number,
    size: number,
    speed: number,
    energy: number,
    isDashing: boolean,
    hasShield: boolean,
    abilities: {
        stun: { cooldown, active },
        reload: { cooldown, active },
        dash: { cooldown, active },
        shield: { cooldown, active }
    }
}
```

## 📊 APIs Disponibles

### **GET /api/stats**
Estadísticas del servidor en tiempo real
```json
{
    "status": "active",
    "version": "1.0.0",
    "uptime": 3600,
    "timestamp": "2025-07-08T12:00:00.000Z",
    "environment": "development"
}
```

### **GET /api/config**
Configuración del juego
```json
{
    "gameTitle": "Última Línea",
    "version": "1.0.0",
    "author": "Elias",
    "features": [
        "Modular Architecture",
        "Mobile Support",
        "Multiple Enemy Types",
        "Ability System",
        "Wave Progression",
        "Console Commands"
    ]
}
```

## 🧪 Sistema de Testing

### **Cobertura de Tests**
- ✅ **Constants Tests** (5 tests): Validación de configuración
- ✅ **Player Tests** (5 tests): Lógica del jugador
- ✅ **Enemy Tests** (6 tests): Comportamiento de enemigos
- ✅ **Helpers Tests** (3 tests): Funciones auxiliares

### **Comandos de Testing**
```bash
npm test              # Ejecutar todos los tests
npm run test:watch    # Tests en modo watch
npm run lint          # Análisis de código
npm run lint:fix      # Corrección automática
```

## 🚀 Optimizaciones de Rendimiento

### **Frontend**
- **Canvas Optimization**: Clear solo las áreas necesarias
- **Object Pooling**: Reutilización de objetos para partículas
- **Event Delegation**: Listeners eficientes para UI
- **RAF Loop**: RequestAnimationFrame para smooth 60fps

### **Backend**
- **Compression**: Gzip para todos los assets estáticos
- **Caching**: Headers de caché optimizados
- **Security**: Headers de seguridad con Helmet
- **Logging**: Logging estructurado con timestamps

## 🔒 Seguridad

### **Content Security Policy**
```javascript
{
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "blob:"],
    connectSrc: ["'self'"],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"]
}
```

### **Headers de Seguridad**
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (en producción)

## 📱 Soporte Móvil

### **Responsive Design**
- Viewport adaptativo
- Controles táctiles optimizados
- UI escalable según tamaño de pantalla

### **Touch Controls**
- Joystick virtual para movimiento
- Botones táctiles para habilidades
- Gestos nativos soportados

## 🔍 Debugging y Monitoreo

### **Console Commands**
```javascript
showHitboxes(true/false)  // Mostrar hitboxes
giveEnergy(amount)        // Dar energía al jugador  
clearEnemies()           // Limpiar enemigos
help()                   // Mostrar ayuda
```

### **Performance Monitor**
- FPS counter en tiempo real
- Ping monitor del servidor
- Métricas de memoria (próximamente)

## 🚦 CI/CD Ready

### **GitHub Actions Template**
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run lint
      - run: npm run build
```

### **Deployment**
- Docker ready (Dockerfile incluido próximamente)
- Heroku compatible
- Vercel/Netlify ready
