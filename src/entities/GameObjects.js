import { GAME_CONFIG } from '../utils/constants.js';

export class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = GAME_CONFIG.POWERUPS.SIZE;
        this.color = GAME_CONFIG.POWERUPS.COLOR;
        this.energyBonus = GAME_CONFIG.POWERUPS.ENERGY_BONUS;
        this.glowIntensity = 0;
        this.animationTime = 0;
    }

    update() {
        this.animationTime += 0.1;
        this.glowIntensity = Math.sin(this.animationTime) * 0.5 + 0.5;
    }

    getCollectionRadius() {
        return this.size * GAME_CONFIG.POWERUPS.COLLECTION_RADIUS_MULTIPLIER;
    }

    static spawnInSafeArea(canvasWidth, canvasHeight, player) {
        let x, y;
        let attempts = 0;
        const minDistance = 80;

        do {
            x = Math.random() * (canvasWidth - 40) + 20;
            y = Math.random() * (canvasHeight - 40) + 20;
            attempts++;
        } while (attempts < 10 &&
                 Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2) < minDistance);

        return new PowerUp(x, y);
    }
}

export class Particle {
    constructor(x, y, vx, vy, life, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color = color;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }

    isDead() {
        return this.life <= 0;
    }

    getAlpha() {
        return this.life / this.maxLife;
    }

    static createShieldParticles(x, y) {
        const particles = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            particles.push(new Particle(
                x, y,
                Math.cos(angle) * 4,
                Math.sin(angle) * 4,
                0.8, 4, '#00ffff'
            ));
        }
        return particles;
    }

    static createCollectionParticles(x, y) {
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            particles.push(new Particle(
                x, y,
                Math.cos(angle) * 3,
                Math.sin(angle) * 3,
                1, 3, '#ffff00'
            ));
        }
        return particles;
    }
}
