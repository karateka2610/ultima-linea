import { GAME_CONFIG } from '../utils/constants.js';
import { getDistance } from '../utils/helpers.js';

export class Player {
    constructor(x, y, progressionSystem = null) {
        this.x = x;
        this.y = y;
        this.size = GAME_CONFIG.PLAYER.SIZE;
        this.speed = GAME_CONFIG.PLAYER.SPEED;
        this.color = GAME_CONFIG.PLAYER.COLOR;
        this.progression = progressionSystem;
        
        this.maxEnergy = this.progression ? this.progression.getMaxEnergy() : GAME_CONFIG.PLAYER.MAX_ENERGY;
        this.energy = this.maxEnergy;
        
        // States
        this.isDashing = false;
        this.hasShield = false;
        this.isInvulnerable = false;
        this.dashDirection = { x: 0, y: 0 };
        this.dashStartTime = 0;
        this.shieldStartTime = 0;
        this.invulnerabilityStartTime = 0;
        this.dashSpeedMultiplier = 1.5;
        this.shieldDuration = GAME_CONFIG.ABILITIES.SHIELD.DURATION;
    }
    
    update(deltaTime, input, canvasWidth, canvasHeight) {
        this.handleMovement(input, canvasWidth, canvasHeight);
        this.updateStates();
        this.drainEnergy();
    }
    
    handleMovement(input, canvasWidth, canvasHeight) {
        let dx = 0, dy = 0;
        
        // Apply speed boost if active
        const speedMultiplier = this.progression ? this.progression.getSpeedMultiplier() : 1;
        const currentSpeed = this.speed * speedMultiplier;
        
        if (this.isDashing) {
            const currentTime = Date.now();
            if (currentTime - this.dashStartTime < GAME_CONFIG.ABILITIES.DASH.DURATION) {
                dx = this.dashDirection.x * currentSpeed * this.dashSpeedMultiplier;
                dy = this.dashDirection.y * currentSpeed * this.dashSpeedMultiplier;
            } else {
                this.isDashing = false;
            }
        } else {
            dx = input.movement.x * currentSpeed;
            dy = input.movement.y * currentSpeed;
        }
        
        this.x += dx;
        this.y += dy;
        
        // Keep in bounds
        this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
    }
    
    updateStates() {
        const currentTime = Date.now();
        
        // Update dash state
        if (this.isDashing && currentTime - this.dashStartTime >= GAME_CONFIG.ABILITIES.DASH.DURATION) {
            this.isDashing = false;
        }
        
        // Update shield state
        if (this.hasShield && currentTime - this.shieldStartTime > this.shieldDuration) {
            this.hasShield = false;
        }
        
        // Update invulnerability state (1 second)
        if (this.isInvulnerable && currentTime - this.invulnerabilityStartTime >= 1000) {
            this.isInvulnerable = false;
        }
        
        // Update max energy if progression system is available
        if (this.progression) {
            this.maxEnergy = this.progression.getMaxEnergy();
        }
    }
    
    drainEnergy() {
        this.energy = Math.max(0, this.energy - GAME_CONFIG.PLAYER.ENERGY_DRAIN_RATE);
    }
    
    startDash(direction, speedMultiplier = null) {
        this.isDashing = true;
        this.dashStartTime = Date.now();
        this.dashDirection = direction;
        this.energy -= GAME_CONFIG.ABILITIES.DASH.ENERGY_COST;
        
        if (speedMultiplier !== null) {
            this.dashSpeedMultiplier = speedMultiplier;
        }
    }
    
    activateShield(duration = null) {
        this.hasShield = true;
        this.shieldStartTime = Date.now();
        this.energy -= GAME_CONFIG.ABILITIES.SHIELD.ENERGY_COST;
        
        if (duration !== null) {
            this.shieldDuration = duration;
        }
    }
    
    collectPowerUp(powerUp) {
        this.energy = Math.min(this.maxEnergy, this.energy + powerUp.energyBonus);
    }
    
    getHitboxRadius() {
        return this.size * 0.6;
    }
}
