// Performance monitoring
let fps = 0;
let lastTime = performance.now();
// Ping monitor simulado
function startPingMonitor() {
    setInterval(async () => {
        try {
            // Simular ping variable
            const ping = Math.round(Math.random() * 20 + 5);
            const pingElement = document.getElementById('ping-display');
            if (pingElement) {
                pingElement.textContent = ping;
            }
        } catch (error) {
            const pingElement = document.getElementById('ping-display');
            if (pingElement) {
                pingElement.textContent = '∞';
            }
        }
    }, 2000); // Actualizar cada 2 segundos
}

function updateFPS() {
    frameCount++;
    const currentTime = performance.now();
    if (currentTime - lastTime >= 1000) {
        fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        const fpsElement = document.getElementById('fps-counter');
        if (fpsElement) {
            fpsElement.textContent = fps;
        }
        frameCount = 0;
        lastTime = currentTime;
    }
    requestAnimationFrame(updateFPS);
}

// Server stats functionality
async function toggleStats() {
    const panel = document.getElementById('stats-panel');
    if (!panel) return;
    
    if (panel.style.display === 'none' || !panel.style.display) {
        panel.style.display = 'block';
        await loadServerStats();
    } else {
        panel.style.display = 'none';
    }
}

async function loadServerStats() {
    try {
        // Simular datos del servidor ya que no hay backend real
        const mockData = {
            status: 'Activo (Local)',
            uptime: formatUptime(performance.now()),
            version: '1.0.0',
            ping: Math.round(Math.random() * 10 + 5) // Simular ping bajo
        };
        
        const statusElement = document.getElementById('server-status');
        const uptimeElement = document.getElementById('server-uptime');
        const versionElement = document.getElementById('server-version');
        const pingElement = document.getElementById('ping-display');
        
        if (statusElement) statusElement.textContent = mockData.status;
        if (uptimeElement) uptimeElement.textContent = mockData.uptime;
        if (versionElement) versionElement.textContent = mockData.version;
        if (pingElement) pingElement.textContent = mockData.ping;
        
    } catch (error) {
        console.error('Error loading stats:', error);
        const statusElement = document.getElementById('server-status');
        if (statusElement) {
            statusElement.textContent = 'Error';
        }
    }
}

function formatUptime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

// Debug functionality
let hitboxesVisible = false;
let godModeEnabled = false;

function toggleHitboxes() {
    if (window.game && window.game.renderer) {
        hitboxesVisible = !hitboxesVisible;
        window.game.renderer.showHitboxes = hitboxesVisible;
        
        const btn = document.getElementById('hitbox-toggle');
        if (btn) {
            btn.classList.toggle('active', hitboxesVisible);
            btn.title = hitboxesVisible ? 'Ocultar Hitboxes' : 'Mostrar Hitboxes';
        }
        
        console.log(`Hitboxes ${hitboxesVisible ? 'activados' : 'desactivados'}`);
    }
}

function toggleGodMode() {
    if (window.game && window.game.renderer) {
        godModeEnabled = !godModeEnabled;
        window.game.renderer.godModeEnabled = godModeEnabled;
        
        const btn = document.getElementById('god-mode-toggle');
        if (btn) {
            btn.classList.toggle('active', godModeEnabled);
            btn.title = godModeEnabled ? 'Desactivar Modo Dios' : 'Activar Modo Dios';
        }
        
        console.log(`Modo Dios ${godModeEnabled ? 'activado' : 'desactivado'}`);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Start FPS monitoring
    updateFPS();
    
    // Start ping monitoring
    startPingMonitor();
    
    // Bind close stats button
    const closeStatsBtn = document.getElementById('close-stats');
    if (closeStatsBtn) {
        closeStatsBtn.addEventListener('click', () => {
            const panel = document.getElementById('stats-panel');
            if (panel) {
                panel.style.display = 'none';
            }
        });
    }
    
    // Bind stats toggle button
    const statsToggle = document.getElementById('stats-toggle');
    if (statsToggle) {
        statsToggle.addEventListener('click', toggleStats);
    }
    
    // Bind debug controls
    const hitboxToggle = document.getElementById('hitbox-toggle');
    if (hitboxToggle) {
        hitboxToggle.addEventListener('click', toggleHitboxes);
    }
    
    const godModeToggle = document.getElementById('god-mode-toggle');
    if (godModeToggle) {
        godModeToggle.addEventListener('click', toggleGodMode);
    }
});

// Make functions available globally
window.toggleStats = toggleStats;
window.toggleHitboxes = toggleHitboxes;
window.toggleGodMode = toggleGodMode;
