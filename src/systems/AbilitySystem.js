import { GAME_CONFIG } from '../utils/constants.js';

export class AbilitySystem {
    constructor(progressionSystem = null) {
        this.progression = progressionSystem;
        
        // Cooldowns base - se modificarán por el sistema de progresión
        this.stunCooldown = GAME_CONFIG.ABILITIES.STUN.COOLDOWN;
        this.reloadCooldown = GAME_CONFIG.ABILITIES.RELOAD.COOLDOWN;
        this.dashCooldown = GAME_CONFIG.ABILITIES.DASH.COOLDOWN;
        this.shieldCooldown = GAME_CONFIG.ABILITIES.SHIELD.COOLDOWN;
        
        this.lastStunTime = 0;
        this.lastReloadTime = 0;
        this.lastDashTime = 0;
        this.lastShieldTime = 0;
        this.lastHealTime = 0;
        this.lastSpeedTime = 0;
        this.lastMultiStunTime = 0;
        this.lastReflectTime = 0;
        
        this.isStunActive = false;
        this.stunStartTime = 0;
    }
    
    useStun(player, enemies) {
        if (!player || !enemies) return false;
        if (!this.progression?.abilities.stun.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('stun');
        
        if (!this.canUseStun(currentTime, player, stats)) return false;
        
        this.lastStunTime = currentTime;
        this.isStunActive = true;
        this.stunStartTime = currentTime;
        player.energy -= GAME_CONFIG.ABILITIES.STUN.ENERGY_COST;
        
        // Aplicar stun mejorado
        const stunRadius = stats.radius || GAME_CONFIG.ABILITIES.STUN.RADIUS;
        const stunDuration = stats.duration || GAME_CONFIG.ABILITIES.STUN.DURATION;
        
        enemies.forEach(enemy => {
            const distance = Math.sqrt(
                Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
            );
            if (distance <= stunRadius) {
                enemy.stun(currentTime, stunDuration);
            }
        });
        
        return true;
    }
    
    useReload(player) {
        if (!player) return false;
        if (!this.progression?.abilities.reload.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('reload');
        
        if (!this.canUseReload(currentTime, stats)) return false;
        
        this.lastReloadTime = currentTime;
        const healAmount = stats?.heal || GAME_CONFIG.ABILITIES.RELOAD.ENERGY_RESTORE;
        player.energy = Math.min(player.maxEnergy, player.energy + healAmount);
        return true;
    }
    
    useDash(player, input) {
        if (!player || !input) return false;
        if (!this.progression?.abilities.dash.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('dash');
        
        if (!this.canUseDash(currentTime, player, stats)) return false;
        
        this.lastDashTime = currentTime;
        const direction = input.getDashDirection();
        const speedMultiplier = stats?.distance || 1.5;
        player.startDash(direction, speedMultiplier);
        return true;
    }
    
    useShield(player) {
        if (!player) return false;
        if (!this.progression?.abilities.shield.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('shield');
        
        if (!this.canUseShield(currentTime, player, stats)) return false;
        
        this.lastShieldTime = currentTime;
        const duration = stats?.duration || GAME_CONFIG.ABILITIES.SHIELD.DURATION;
        player.activateShield(duration);
        return true;
    }
    
    // Nuevas habilidades roguelike
    useHeal(player) {
        if (!player) return false;
        if (!this.progression?.abilities.heal.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('heal');
        
        if (!this.canUseHeal(currentTime, stats)) return false;
        
        this.lastHealTime = currentTime;
        const healAmount = stats?.heal || 50;
        player.energy = Math.min(player.maxEnergy, player.energy + healAmount);
        return true;
    }
    
    useSpeedBoost(player) {
        if (!player) return false;
        if (!this.progression?.abilities.speed.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('speed');
        
        if (!this.canUseSpeed(currentTime, stats)) return false;
        
        this.lastSpeedTime = currentTime;
        this.progression.activateSpeedBoost();
        return true;
    }
    
    useMultiStun(player, enemies) {
        if (!player || !enemies) return false;
        if (!this.progression?.abilities.multiStun.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('multiStun');
        
        if (!this.canUseMultiStun(currentTime, player, stats)) return false;
        
        this.lastMultiStunTime = currentTime;
        player.energy -= GAME_CONFIG.ABILITIES.STUN.ENERGY_COST * 1.5;
        
        // Stun múltiple con ondas expansivas
        const stunCount = stats?.count || 2;
        for (let i = 0; i < stunCount; i++) {
            setTimeout(() => {
                const radius = 80 + (i * 30);
                enemies.forEach(enemy => {
                    const distance = Math.sqrt(
                        Math.pow(player.x - enemy.x, 2) + Math.pow(player.y - enemy.y, 2)
                    );
                    if (distance <= radius) {
                        enemy.stun(Date.now(), 3000);
                    }
                });
            }, i * 300);
        }
        
        return true;
    }
    
    useReflect(player) {
        if (!player) return false;
        if (!this.progression?.abilities.reflect.unlocked) return false;
        
        const currentTime = Date.now();
        const stats = this.progression.getAbilityStats('reflect');
        
        if (!this.canUseReflect(currentTime, stats)) return false;
        
        this.lastReflectTime = currentTime;
        this.progression.activateReflection();
        return true;
    }
    
    update(player = null) {
        const currentTime = Date.now();
        
        if (this.isStunActive && currentTime - this.stunStartTime > GAME_CONFIG.ABILITIES.STUN.DURATION) {
            this.isStunActive = false;
        }
        
        this.updateUI(player);
    }
    
    canUseStun(currentTime, player, stats = null) {
        if (!player) return false;
        const cooldown = stats?.cooldown || this.stunCooldown;
        return currentTime - this.lastStunTime > cooldown && 
               player.energy >= GAME_CONFIG.ABILITIES.STUN.ENERGY_COST;
    }
    
    canUseReload(currentTime, stats = null) {
        const cooldown = stats?.cooldown || this.reloadCooldown;
        return currentTime - this.lastReloadTime > cooldown;
    }
    
    canUseDash(currentTime, player, stats = null) {
        if (!player) return false;
        const cooldown = stats?.cooldown || this.dashCooldown;
        return currentTime - this.lastDashTime > cooldown && 
               player.energy >= GAME_CONFIG.ABILITIES.DASH.ENERGY_COST;
    }
    
    canUseShield(currentTime, player, stats = null) {
        if (!player) return false;
        const cooldown = stats?.cooldown || this.shieldCooldown;
        return currentTime - this.lastShieldTime > cooldown && 
               player.energy >= GAME_CONFIG.ABILITIES.SHIELD.ENERGY_COST;
    }
    
    canUseHeal(currentTime, stats = null) {
        const cooldown = stats?.cooldown || 15000;
        return currentTime - this.lastHealTime > cooldown;
    }
    
    canUseSpeed(currentTime, stats = null) {
        const cooldown = stats?.cooldown || 12000;
        return currentTime - this.lastSpeedTime > cooldown;
    }
    
    canUseMultiStun(currentTime, player, stats = null) {
        if (!player) return false;
        const cooldown = stats?.cooldown || 8000;
        return currentTime - this.lastMultiStunTime > cooldown && 
               player.energy >= GAME_CONFIG.ABILITIES.STUN.ENERGY_COST * 1.5;
    }
    
    canUseReflect(currentTime, stats = null) {
        const cooldown = stats?.cooldown || 20000;
        return currentTime - this.lastReflectTime > cooldown;
    }
    
    updateUI(player = null) {
        const currentTime = Date.now();
        
        // Solo actualizar botones de habilidades desbloqueadas
        if (this.progression?.abilities.stun.unlocked) {
            const stats = this.progression.getAbilityStats('stun');
            this.updateButton('stun-btn', 'mobile-stun', 'Aturdir (Q)', 'STUN', 
                             this.canUseStun(currentTime, player, stats), stats?.cooldown || this.stunCooldown, this.lastStunTime);
        } else {
            this.hideButton('stun-btn', 'mobile-stun');
        }
        
        if (this.progression?.abilities.reload.unlocked) {
            const stats = this.progression.getAbilityStats('reload');
            this.updateButton('reload-btn', 'mobile-reload', 'Recargar (E)', 'RELOAD', 
                             this.canUseReload(currentTime, stats), stats?.cooldown || this.reloadCooldown, this.lastReloadTime);
        } else {
            this.hideButton('reload-btn', 'mobile-reload');
        }
        
        if (this.progression?.abilities.dash.unlocked) {
            const stats = this.progression.getAbilityStats('dash');
            this.updateButton('dash-btn', 'mobile-dash', 'Dash (F)', 'DASH', 
                             this.canUseDash(currentTime, player, stats), stats?.cooldown || this.dashCooldown, this.lastDashTime);
        } else {
            this.hideButton('dash-btn', 'mobile-dash');
        }
        
        if (this.progression?.abilities.shield.unlocked) {
            const stats = this.progression.getAbilityStats('shield');
            this.updateButton('shield-btn', 'mobile-shield', 'Escudo (C)', 'SHIELD', 
                             this.canUseShield(currentTime, player, stats), stats?.cooldown || this.shieldCooldown, this.lastShieldTime);
        } else {
            this.hideButton('shield-btn', 'mobile-shield');
        }
        
        // Nuevas habilidades
        if (this.progression?.abilities.heal.unlocked) {
            const stats = this.progression.getAbilityStats('heal');
            this.updateButton('heal-btn', 'mobile-heal', 'Curar (H)', 'HEAL', 
                             this.canUseHeal(currentTime, stats), stats?.cooldown || 15000, this.lastHealTime);
        }
        
        if (this.progression?.abilities.speed.unlocked) {
            const stats = this.progression.getAbilityStats('speed');
            this.updateButton('speed-btn', 'mobile-speed', 'Velocidad (V)', 'SPEED', 
                             this.canUseSpeed(currentTime, stats), stats?.cooldown || 12000, this.lastSpeedTime);
        }
    }
    
    hideButton(desktopId, mobileId) {
        const desktopBtn = document.getElementById(desktopId);
        const mobileBtn = document.getElementById(mobileId);
        
        if (desktopBtn) {
            desktopBtn.style.display = 'none';
        }
        if (mobileBtn) {
            mobileBtn.style.display = 'none';
        }
    }
    
    updateButton(desktopId, mobileId, desktopText, mobileText, canUse, cooldown, lastTime) {
        const currentTime = Date.now();
        const ready = canUse;
        const timeSinceLastUse = currentTime - lastTime;
        const remainingTime = Math.max(0, Math.ceil((cooldown - timeSinceLastUse) / 1000));
        
        const desktopBtn = document.getElementById(desktopId);
        const mobileBtn = document.getElementById(mobileId);
        
        if (desktopBtn) {
            desktopBtn.disabled = !ready;
            desktopBtn.className = ready ? 'button' : 'button cooldown';
            if (ready) {
                desktopBtn.textContent = desktopText;
            } else {
                const baseName = desktopText.split(' ')[0];
                desktopBtn.textContent = `${baseName} (${remainingTime}s)`;
            }
        }
        
        if (mobileBtn) {
            mobileBtn.disabled = !ready;
            mobileBtn.className = ready ? 'mobile-btn' : 'mobile-btn cooldown';
            mobileBtn.textContent = ready ? mobileText : remainingTime;
        }
    }
}
