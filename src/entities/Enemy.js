import { GAME_CONFIG } from '../utils/constants.js';
import { getDistance } from '../utils/helpers.js';

export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.stunned = false;
        this.stunStartTime = 0;
        this.lastShotTime = 0;
        
        this.setupType();
    }
    
    setupType() {
        const config = GAME_CONFIG.ENEMY_TYPES[this.type.toUpperCase()];
        const baseSize = GAME_CONFIG.ENEMIES.SIZE;
        const baseSpeed = GAME_CONFIG.ENEMIES.INITIAL_SPEED;
        
        this.color = config.COLOR;
        this.size = baseSize * config.SIZE_MULTIPLIER;
        this.speed = baseSpeed * config.SPEED_MULTIPLIER;
        
        if (this.type === 'shooter') {
            this.shootRate = config.SHOOT_RATE;
            this.shootRange = config.SHOOT_RANGE;
        }
    }
    
    update(player, currentTime, projectiles) {
        if (this.stunned) {
            if (currentTime - this.stunStartTime > GAME_CONFIG.ABILITIES.STUN.DURATION) {
                this.stunned = false;
            }
            return;
        }
        
        this.moveTowardsPlayer(player);
        
        if (this.type === 'shooter') {
            this.handleShooting(player, currentTime, projectiles);
        }
    }
    
    moveTowardsPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }
    
    handleShooting(player, currentTime, projectiles) {
        if (currentTime - this.lastShotTime < this.shootRate) return;
        
        const distance = getDistance(this.x, this.y, player.x, player.y);
        if (distance > this.shootRange) return;
        
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        
        projectiles.push({
            x: this.x,
            y: this.y,
            dirX: dx / magnitude,
            dirY: dy / magnitude,
            speed: GAME_CONFIG.PROJECTILES.SPEED,
            size: GAME_CONFIG.PROJECTILES.SIZE,
            color: GAME_CONFIG.PROJECTILES.COLOR
        });
        
        this.lastShotTime = currentTime;
    }
    
    stun(currentTime) {
        this.stunned = true;
        this.stunStartTime = currentTime;
    }
    
    getHitboxRadius() {
        return this.size * 0.7;
    }
    
    static spawnAtEdge(canvasWidth, canvasHeight, type) {
        const side = Math.floor(Math.random() * 4);
        const size = GAME_CONFIG.ENEMIES.SIZE;
        let x, y;
        
        switch (side) {
            case 0: // Top
                x = Math.random() * canvasWidth;
                y = -size;
                break;
            case 1: // Right
                x = canvasWidth + size;
                y = Math.random() * canvasHeight;
                break;
            case 2: // Bottom
                x = Math.random() * canvasWidth;
                y = canvasHeight + size;
                break;
            case 3: // Left
                x = -size;
                y = Math.random() * canvasHeight;
                break;
        }
        
        return new Enemy(x, y, type);
    }
}
