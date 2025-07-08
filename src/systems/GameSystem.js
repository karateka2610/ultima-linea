import { Enemy } from '../entities/Enemy.js';
import { PowerUp, Particle } from '../entities/GameObjects.js';
import { GAME_CONFIG } from '../utils/constants.js';
import { getDistance } from '../utils/helpers.js';

export class GameSystem {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.renderer = null; // Will be set later
        
        // Game state
        this.currentWave = 1;
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        this.particles = [];
        
        // Debug state
        this.godModeEnabled = false;
        
        // Wave management
        this.waveEnemyCount = GAME_CONFIG.WAVE.INITIAL_ENEMY_COUNT;
        this.enemiesSpawnedThisWave = 0;
        this.waveStartTime = 0;
        this.enemySpawnRate = GAME_CONFIG.ENEMIES.INITIAL_SPAWN_RATE;
        this.lastEnemySpawn = 0;
        this.lastPowerUpSpawn = 0;
        
        // Effects
        this.dangerLevel = 0;
        this.screenShake = false;
    }
    
    update(deltaTime, player, currentTime) {
        this.updateEnemies(player, currentTime);
        this.updateProjectiles();
        this.updatePowerUps(player);
        this.updateParticles();
        this.spawnEnemies(currentTime);
        this.spawnPowerUps(currentTime, player);
        this.updateWaves(currentTime);
        this.updateEffects(player);
        this.checkCollisions(player);
    }
    
    updateEnemies(player, currentTime) {
        this.enemies.forEach(enemy => {
            enemy.update(player, currentTime, this.projectiles);
        });
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            projectile.x += projectile.dirX * projectile.speed;
            projectile.y += projectile.dirY * projectile.speed;
            
            if (this.isOffScreen(projectile.x, projectile.y)) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updatePowerUps(player) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update();
            
            const distance = getDistance(powerUp.x, powerUp.y, player.x, player.y);
            if (distance < powerUp.getCollectionRadius()) {
                player.collectPowerUp(powerUp);
                this.particles.push(...Particle.createCollectionParticles(powerUp.x, powerUp.y));
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    spawnEnemies(currentTime) {
        if (currentTime - this.lastEnemySpawn > this.enemySpawnRate && 
            this.enemiesSpawnedThisWave < this.waveEnemyCount) {
            
            const enemyType = this.getRandomEnemyType();
            const enemy = Enemy.spawnAtEdge(this.canvasWidth, this.canvasHeight, enemyType);
            this.enemies.push(enemy);
            
            this.enemiesSpawnedThisWave++;
            this.lastEnemySpawn = currentTime;
        }
    }
    
    spawnPowerUps(currentTime, player) {
        if (currentTime - this.lastPowerUpSpawn > GAME_CONFIG.POWERUPS.SPAWN_RATE) {
            const powerUp = PowerUp.spawnInSafeArea(this.canvasWidth, this.canvasHeight, player);
            this.powerUps.push(powerUp);
            this.lastPowerUpSpawn = currentTime;
        }
    }
    
    getRandomEnemyType() {
        const wave = this.currentWave;
        const rand = Math.random();
        
        if (wave <= 2) {
            return 'basic';
        } else if (wave <= 5) {
            return rand < 0.7 ? 'basic' : 'fast';
        } else {
            if (rand < 0.5) return 'basic';
            else if (rand < 0.8) return 'fast';
            else return 'shooter';
        }
    }
    
    updateWaves(currentTime) {
        // Check if wave is complete
        if (this.enemiesSpawnedThisWave >= this.waveEnemyCount && this.enemies.length === 0) {
            this.startNextWave(currentTime);
        }
        
        // Auto-advance wave after time limit
        if (currentTime - this.waveStartTime > GAME_CONFIG.WAVE.DURATION) {
            this.startNextWave(currentTime);
        }
    }
    
    startNextWave(currentTime) {
        this.currentWave++;
        this.waveEnemyCount = Math.min(GAME_CONFIG.WAVE.MAX_ENEMIES, 
                                     this.waveEnemyCount + GAME_CONFIG.WAVE.ENEMY_COUNT_INCREMENT);
        this.enemySpawnRate = Math.max(GAME_CONFIG.ENEMIES.MIN_SPAWN_RATE, 
                                     this.enemySpawnRate - GAME_CONFIG.ENEMIES.SPAWN_RATE_DECREMENT);
        
        this.enemiesSpawnedThisWave = 0;
        this.waveStartTime = currentTime;
        this.enemies = [];
    }
    
    updateEffects(player) {
        let nearbyEnemies = 0;
        let closestDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const distance = getDistance(player.x, player.y, enemy.x, enemy.y);
            
            if (distance < 100) nearbyEnemies++;
            closestDistance = Math.min(closestDistance, distance);
        }
        
        // Update danger level
        if (nearbyEnemies >= 3 || closestDistance < 50) {
            this.dangerLevel = 2;
        } else if (nearbyEnemies >= 1 || closestDistance < 100) {
            this.dangerLevel = 1;
        } else {
            this.dangerLevel = 0;
        }
        
        this.updateCanvasEffects();
    }
    
    updateCanvasEffects() {
        const canvas = document.getElementById('gameCanvas');
        canvas.className = '';
        
        if (this.dangerLevel === 2) {
            canvas.classList.add('canvas-danger', 'vibrate');
            this.screenShake = true;
        } else if (this.dangerLevel === 1) {
            canvas.classList.add('canvas-warning');
            this.screenShake = false;
        } else {
            this.screenShake = false;
        }
    }
    
    checkCollisions(player) {
        // Check enemy collisions first
        const enemyCollision = this.checkEnemyCollisions(player);
        if (enemyCollision) {
            return true; // Game over
        }
        
        // Check projectile collisions
        const projectileCollision = this.checkProjectileCollisions(player);
        if (projectileCollision) {
            return true; // Game over
        }
        
        return false; // No collisions
    }
     checkEnemyCollisions(player) {
        // Skip collisions if god mode is enabled
        const godModeEnabled = this.renderer ? this.renderer.godModeEnabled : false;
        if (godModeEnabled) return false;

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const distance = getDistance(player.x, player.y, enemy.x, enemy.y);
            const collisionDistance = player.getHitboxRadius() + enemy.getHitboxRadius();
            
            if (distance < collisionDistance) {
                console.log(`🎯 Colisión detectada! Distancia: ${distance.toFixed(2)}, Necesaria: ${collisionDistance.toFixed(2)}`);
                console.log(`Player: (${Math.floor(player.x)}, ${Math.floor(player.y)}) radio: ${player.getHitboxRadius()}`);
                console.log(`Enemy: (${Math.floor(enemy.x)}, ${Math.floor(enemy.y)}) radio: ${enemy.getHitboxRadius()}`);
                
                if (player.hasShield) {
                    console.log('🛡️ Escudo absorbe el daño');
                    player.hasShield = false;
                    this.enemies.splice(i, 1);
                    this.particles.push(...Particle.createShieldParticles(player.x, player.y));
                } else if (!player.isDashing) {
                    console.log('💥 Colisión mortal - quitando energía');
                    // Reduce less energy and add invincibility frames
                    if (!player.isInvulnerable) {
                        player.energy = Math.max(0, player.energy - 15);
                        player.isInvulnerable = true;
                        player.invulnerabilityStartTime = Date.now();
                        this.enemies.splice(i, 1); // Remove enemy after collision
                        
                        // If energy reaches 0, signal game over
                        if (player.energy <= 0) {
                            console.log('💀 Energía agotada - game over');
                            return true;
                        }
                    }
                } else {
                    console.log('💨 Dash esquiva el daño');
                }
            }
        }
        return false;
    }
     checkProjectileCollisions(player) {
        // Skip projectile collisions if god mode is enabled
        const godModeEnabled = this.renderer ? this.renderer.godModeEnabled : false;
        if (godModeEnabled) return false;

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const distance = getDistance(player.x, player.y, projectile.x, projectile.y);
            const collisionDistance = player.getHitboxRadius() + projectile.size * 0.6;

            if (distance < collisionDistance) {
                console.log(`🎯 Proyectil colisionó! Distancia: ${distance.toFixed(2)}, Necesaria: ${collisionDistance.toFixed(2)}`);
                
                if (player.hasShield) {
                    console.log('🛡️ Escudo bloquea proyectil');
                    this.projectiles.splice(i, 1);
                    this.particles.push(...Particle.createShieldParticles(player.x, player.y));
                } else if (!player.isDashing) {
                    console.log('💥 Proyectil impacta - quitando energía');
                    // Reduce energy instead of instant death
                    player.energy = Math.max(0, player.energy - 15);
                    this.projectiles.splice(i, 1); // Remove projectile after collision
                    
                    // If energy reaches 0, signal game over
                    if (player.energy <= 0) {
                        console.log('💀 Energía agotada por proyectil - game over');
                        return true;
                    }
                } else {
                    console.log('💨 Dash deflecta proyectil');
                    // Dash deflects projectiles
                    this.projectiles.splice(i, 1);
                }
            }
        }
        return false;
    }
    
    isOffScreen(x, y) {
        return x < -10 || x > this.canvasWidth + 10 || y < -10 || y > this.canvasHeight + 10;
    }
    
    reset() {
        this.currentWave = 1;
        this.enemies = [];
        this.projectiles = [];
        this.powerUps = [];
        this.particles = [];
        this.waveEnemyCount = GAME_CONFIG.WAVE.INITIAL_ENEMY_COUNT;
        this.enemiesSpawnedThisWave = 0;
        this.enemySpawnRate = GAME_CONFIG.ENEMIES.INITIAL_SPAWN_RATE;
        this.dangerLevel = 0;
        this.screenShake = false;
        this.lastPowerUpSpawn = 0;
        
        const canvas = document.getElementById('gameCanvas');
        canvas.className = '';
    }
}
