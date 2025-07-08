# 🎮 Última Línea - Survival Roguelike Game

Un juego de supervivencia roguelike modular en HTML5 donde debes sobrevivir oleadas infinitas de enemigos usando habilidades estratégicas. Sistema de progresión por rondas con selector de cartas horizontal e iconos SVG personalizados.

## ✨ Características Principales

### 🎯 **Sistema Roguelike**
- **Progresión por rondas** en lugar de experiencia/niveles
- **Selector de cartas horizontal** al completar cada ronda  
- **Mejora de habilidades** eligiendo cartas repetidas
- **9 habilidades únicas** con iconos SVG personalizados

### 📱 **Controles Adaptativos**
- **Detección automática de móvil** 
- **Joystick virtual** para movimiento táctil
- **Botones de habilidades** optimizados para móvil
- **Controles de teclado** para desktop (WASD + Q,E,F,C,H,V,Z,X)

### 🎨 **UI Profesional**
- **Iconos SVG personalizados** para cada habilidad
- **Efectos de rareza** con brillos y animaciones
- **Diseño responsivo** que se adapta a cualquier pantalla
- **Interfaz moderna** con gradientes y efectos visuales

## 📁 Estructura del Proyecto

```
ultima_linea/
├── index.html             # Página principal del juego
├── css/
│   ├── game.css          # Estilos principales + iconos
│   └── mobile.css        # Controles móviles adaptativos  
├── src/
│   ├── main.js           # Lógica principal del juego
│   ├── entities/         # Jugador, enemigos, objetos
│   │   ├── Player.js     # Sistema de jugador con invulnerabilidad
│   │   ├── Enemy.js      # Tipos de enemigos y comportamientos
│   │   └── GameObjects.js # PowerUps y partículas
│   ├── systems/          # Sistemas modulares del juego
│   │   ├── GameSystem.js # Mecánicas principales y colisiones
│   │   ├── InputSystem.js # Entrada táctil y teclado
│   │   ├── AbilitySystem.js # Sistema completo de habilidades
│   │   ├── ProgressionSystem.js # Progresión roguelike
│   │   ├── Renderer.js   # Renderizado con efectos
│   │   └── UISystem.js   # Interfaz de usuario
│   └── utils/            # Utilidades y configuración
│       ├── constants.js  # Configuración del juego
│       ├── helpers.js    # Funciones auxiliares
│       └── icons.js      # Gestión de iconos SVG
└── src/ui-scripts.js     # Scripts de interfaz y estadísticas
```

## 🎯 Características

- **Modular**: Cada archivo < 200 líneas, responsabilidad única
- **Sin duplicación**: Configuración centralizada, funciones reutilizables
- **Escalable**: Fácil añadir nuevas entidades y sistemas
- **Mantenible**: Separación clara de responsabilidades

## 🎮 Controles

### Escritorio
- **WASD** - Mover
- **Q** - Aturdir (3s cooldown)
- **E** - Recargar energía (5s cooldown)
- **F** - Dash rápido (4s cooldown)
- **C** - Escudo (8s cooldown)
- **ESPACIO** - Pausar

### Móvil
- **Joystick virtual** - Movimiento
- **Botones táctiles** - Habilidades

## 🚀 Ejecutar

Simplemente abre `index.html` en un navegador moderno.

## 🛠️ Desarrollo

### Añadir nuevo enemigo:
1. Agregar tipo en `constants.js`
2. Implementar lógica en `Enemy.js`
3. Añadir renderizado en `Renderer.js`

### Añadir nueva habilidad:
1. Configurar en `constants.js`
2. Implementar en `AbilitySystem.js`
3. Agregar input en `InputSystem.js`

### Comandos de consola:
- `showHitboxes(true/false)` - Mostrar cajas de colisión
- `giveEnergy(amount)` - Dar energía al jugador
- `clearEnemies()` - Limpiar enemigos
- `help()` - Mostrar ayuda

## 🚀 Nuevas Características con Node.js

### **🌐 Servidor Express Profesional**
- **Puerto 9000**: Servidor optimizado con middleware de seguridad
- **Compresión**: Compresión gzip para mejor rendimiento
- **Seguridad**: Headers de seguridad con Helmet.js
- **CORS**: Configuración de CORS para desarrollo
- **API REST**: Endpoints para estadísticas y configuración

### **📊 Monitor de Rendimiento**
- **FPS Counter**: Monitor en tiempo real de frames por segundo
- **Ping Monitor**: Latencia del servidor en tiempo real
- **Estadísticas del Servidor**: Panel con información del servidor
- **Performance Metrics**: Métricas de rendimiento integradas

### **🧪 Sistema de Testing**
- **Tests Automatizados**: Suite completa de tests para todas las clases
- **19 Tests**: Cobertura completa de funcionalidades críticas
- **CI/CD Ready**: Tests preparados para integración continua
- **Coverage Reports**: Reportes de cobertura de código

### **🛠️ Herramientas de Desarrollo**
- **ESLint**: Linting automático con reglas personalizadas
- **Nodemon**: Recarga automática en desarrollo
- **Build System**: Minificación de CSS y JS para producción
- **Package Scripts**: Scripts NPM para todas las tareas

### **📱 API Endpoints**
- `GET /api/stats` - Estadísticas del servidor
- `GET /api/config` - Configuración del juego
- `GET /` - Juego principal

## 📋 Scripts NPM Disponibles

```bash
# Desarrollo
npm start              # Iniciar servidor en puerto 9000
npm run dev           # Desarrollo con recarga automática (nodemon)
npm run watch         # Vigilar cambios y rebuild automático

# Testing y Calidad
npm test              # Ejecutar suite de tests
npm run lint          # Análisis de código con ESLint

# Producción
npm run build         # Construir versión de producción
npm run minify:css    # Minificar archivos CSS
npm run minify:js     # Minificar archivos JavaScript
```

## 🔧 Configuración y Desarrollo

### **Instalación**
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### **Testing**
```bash
# Ejecutar todos los tests
npm test

# El sistema ejecuta 19 tests cubriendo:
# - Configuración y constantes
# - Lógica del jugador
# - Comportamiento de enemigos  
# - Funciones auxiliares
```

### **Producción**
```bash
# Construir para producción
npm run build

# Iniciar servidor de producción
NODE_ENV=production npm start
```
