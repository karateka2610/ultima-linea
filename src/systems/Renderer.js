import { GAME_CONFIG } from '../utils/constants.js';

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.showHitboxes = false;
        this.godModeEnabled = false;
    }

    render(gameState, player, abilities) {
        this.clear();
        this.drawGrid();
        this.drawPowerUps(gameState.powerUps);
        this.drawEnemies(gameState.enemies);
        this.drawProjectiles(gameState.projectiles);
        this.drawParticles(gameState.particles);
        this.drawPlayer(player);

        if (this.showHitboxes) {
            this.drawHitboxes(player, gameState);
        }

        if (abilities.isStunActive) {
            this.drawStunEffect(player);
        }

        if (player.hasShield) {
            this.drawShieldEffect(player);
        }
    }

    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = '#111';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.canvas.width; x += GAME_CONFIG.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += GAME_CONFIG.GRID_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawPlayer(player) {
        // Debug: verificar que el jugador tiene valores válidos
        if (!player || isNaN(player.x) || isNaN(player.y)) {
            console.error('Player has invalid position:', player);
            return;
        }

        // Flashing effect for invulnerability
        if (player.isInvulnerable) {
            const flashInterval = 150; // milliseconds
            const currentTime = Date.now();
            const shouldShow = Math.floor((currentTime - player.invulnerabilityStartTime) / flashInterval) % 2 === 0;
            if (!shouldShow) return; // Skip rendering to create flashing effect
        }

        this.ctx.fillStyle = player.color;
        this.ctx.fillRect(
            player.x - player.size / 2,
            player.y - player.size / 2,
            player.size,
            player.size
        );

        this.drawEnergyBar(player);

        // God mode indicator
        if (this.godModeEnabled) {
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = '12px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GOD MODE', player.x, player.y - player.size - 20);
        }
    }

    drawEnergyBar(player) {
        const barWidth = player.size * 2;
        const barHeight = 4;
        const barX = player.x - barWidth / 2;
        const barY = player.y - player.size / 2 - 10;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);

        const energyWidth = (player.energy / player.maxEnergy) * barWidth;
        this.ctx.fillStyle = player.energy > 30 ? '#00ff00' : '#ff4444';
        this.ctx.fillRect(barX, barY, energyWidth, barHeight);
    }

    drawEnemies(enemies) {
        enemies.forEach(enemy => this.drawEnemy(enemy));
    }

    drawEnemy(enemy) {
        this.ctx.fillStyle = enemy.stunned ? '#ffff00' : enemy.color;

        if (enemy.type === 'shooter') {
            this.ctx.fillRect(
                enemy.x - enemy.size / 2,
                enemy.y - enemy.size / 2,
                enemy.size,
                enemy.size
            );
        } else {
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        if (enemy.stunned) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        if (enemy.type === 'fast' && !enemy.stunned) {
            this.ctx.strokeStyle = '#44ff44';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }

    drawProjectiles(projectiles) {
        projectiles.forEach(projectile => {
            this.ctx.fillStyle = projectile.color;
            this.ctx.shadowColor = projectile.color;
            this.ctx.shadowBlur = 10;

            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.shadowBlur = 0;
        });
    }

    drawPowerUps(powerUps) {
        powerUps.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.color;
            this.ctx.shadowColor = powerUp.color;
            this.ctx.shadowBlur = 15 * powerUp.glowIntensity;

            // Lightning bolt shape
            this.ctx.beginPath();
            this.ctx.moveTo(powerUp.x - 6, powerUp.y - 8);
            this.ctx.lineTo(powerUp.x + 2, powerUp.y - 8);
            this.ctx.lineTo(powerUp.x - 4, powerUp.y);
            this.ctx.lineTo(powerUp.x + 6, powerUp.y);
            this.ctx.lineTo(powerUp.x - 2, powerUp.y + 8);
            this.ctx.lineTo(powerUp.x + 4, powerUp.y + 8);
            this.ctx.lineTo(powerUp.x + 4, powerUp.y);
            this.ctx.lineTo(powerUp.x - 6, powerUp.y);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.shadowBlur = 0;
        });
    }

    drawParticles(particles) {
        particles.forEach(particle => {
            const alpha = particle.getAlpha();
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawStunEffect(player) {
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 50, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, 80, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawShieldEffect(player) {
        const currentTime = Date.now();
        const pulseIntensity = Math.sin((currentTime - player.shieldStartTime) / 200) * 0.3 + 0.7;

        this.ctx.strokeStyle = `rgba(0, 255, 255, ${pulseIntensity})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.size + 8, 0, Math.PI * 2);
        this.ctx.stroke();

        this.ctx.strokeStyle = `rgba(0, 255, 255, ${pulseIntensity * 0.5})`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.size + 12, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSADO', this.canvas.width / 2, this.canvas.height / 2);

        this.ctx.font = '12px Courier New';
        this.ctx.fillText('Presiona ESPACIO para continuar', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    drawHitboxes(player, gameState) {
        // Player hitbox
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(player.x, player.y, player.getHitboxRadius(), 0, Math.PI * 2);
        this.ctx.stroke();

        // Enemy hitboxes
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        gameState.enemies.forEach(enemy => {
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.getHitboxRadius(), 0, Math.PI * 2);
            this.ctx.stroke();
        });

        // Projectile hitboxes
        this.ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        gameState.projectiles.forEach(projectile => {
            this.ctx.beginPath();
            this.ctx.arc(projectile.x, projectile.y, projectile.size * 0.6, 0, Math.PI * 2);
            this.ctx.stroke();
        });

        // Power-up collection areas
        this.ctx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
        gameState.powerUps.forEach(powerUp => {
            this.ctx.beginPath();
            this.ctx.arc(powerUp.x, powerUp.y, powerUp.getCollectionRadius(), 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }

    toggleGodMode() {
        this.godModeEnabled = !this.godModeEnabled;
        return this.godModeEnabled;
    }
}
