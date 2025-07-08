import { GAME_CONFIG } from '../utils/constants.js';

export class ProgressionSystem {
    constructor() {
        // Habilidades disponibles y sus niveles
        this.abilities = {
            stun: { unlocked: false, level: 0, maxLevel: 5 },
            dash: { unlocked: false, level: 0, maxLevel: 5 },
            shield: { unlocked: false, level: 0, maxLevel: 5 },
            reload: { unlocked: false, level: 0, maxLevel: 5 },
            // Nuevas habilidades roguelike
            heal: { unlocked: false, level: 0, maxLevel: 3 },
            speed: { unlocked: false, level: 0, maxLevel: 4 },
            energyBoost: { unlocked: false, level: 0, maxLevel: 3 },
            multiStun: { unlocked: false, level: 0, maxLevel: 2 },
            reflect: { unlocked: false, level: 0, maxLevel: 3 }
        };

        // Experiencia y nivel del jugador
        this.experience = 0;
        this.level = 1;
        this.skillPoints = 0;

        // Lista de habilidades por desbloquear (orden aleatorio cada partida)
        this.unlockOrder = this.generateRandomUnlockOrder();
        this.nextUnlockIndex = 0;

        // Configuraciones de habilidades mejoradas
        this.abilityConfigs = {
            stun: {
                baseDuration: 2000,
                levelBonus: 500,
                baseRadius: 60,
                radiusBonus: 15,
                baseCooldown: 5000,
                cooldownReduction: 500
            },
            dash: {
                baseDistance: 1.5,
                distanceBonus: 0.3,
                baseCooldown: 3000,
                cooldownReduction: 300,
                baseInvulnerability: 200,
                invulnerabilityBonus: 50
            },
            shield: {
                baseDuration: 3000,
                durationBonus: 800,
                baseCooldown: 8000,
                cooldownReduction: 1000,
                baseReflection: false // Se activa en nivel 3+
            },
            reload: {
                baseHeal: 25,
                healBonus: 10,
                baseCooldown: 20000, // 20 segundos - para emergencias
                cooldownReduction: 2000
            },
            heal: {
                baseHeal: 50,
                healBonus: 25,
                baseCooldown: 15000,
                cooldownReduction: 2000
            },
            speed: {
                baseBoost: 0.2,
                boostBonus: 0.15,
                baseDuration: 5000,
                durationBonus: 1500
            },
            energyBoost: {
                baseBoost: 50,
                boostBonus: 30,
                baseDuration: 0 // Permanente
            },
            multiStun: {
                baseCount: 2,
                countBonus: 1,
                baseCooldown: 8000,
                cooldownReduction: 1000
            },
            reflect: {
                baseChance: 0.3,
                chanceBonus: 0.2,
                baseDuration: 10000,
                durationBonus: 3000
            }
        };

        // Efectos activos
        this.activeEffects = {
            speedBoost: { active: false, endTime: 0, multiplier: 1 },
            reflection: { active: false, endTime: 0, chance: 0 }
        };
    }

    generateRandomUnlockOrder() {
        const abilities = ['stun', 'dash', 'shield', 'reload', 'heal', 'speed', 'energyBoost', 'multiStun', 'reflect'];
        // Shuffle array
        for (let i = abilities.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [abilities[i], abilities[j]] = [abilities[j], abilities[i]];
        }
        return abilities;
    }

    addExperience(amount) {
        this.experience += amount;
        const expNeeded = this.getExperienceNeeded();

        if (this.experience >= expNeeded) {
            this.levelUp();
        }
    }

    getExperienceNeeded() {
        return this.level * 100 + (this.level - 1) * 50; // Escalamiento exponencial
    }

    levelUp() {
        this.experience = 0;
        this.level++;

        // En lugar de dar skill points, generamos opciones de habilidades
        const abilityOptions = this.generateAbilityOptions();

        return {
            levelUp: true,
            newLevel: this.level,
            abilityOptions: abilityOptions
        };
    }

    generateAbilityOptions(count = 3) {
        const allAbilities = Object.keys(this.abilities);
        const options = [];

        // Crear un pool de habilidades disponibles
        const availableAbilities = [];

        allAbilities.forEach(abilityName => {
            const ability = this.abilities[abilityName];

            if (!ability.unlocked) {
                // Habilidad no desbloqueada - puede aparecer
                availableAbilities.push({
                    name: abilityName,
                    type: 'unlock',
                    level: 0,
                    rarity: this.getAbilityRarity(abilityName)
                });
            } else if (ability.level < ability.maxLevel) {
                // Habilidad ya desbloqueada pero puede mejorar
                availableAbilities.push({
                    name: abilityName,
                    type: 'upgrade',
                    level: ability.level,
                    rarity: this.getAbilityRarity(abilityName) - 1 // Más fácil de conseguir si ya la tienes
                });
            }
        });

        // Seleccionar opciones basadas en rareza
        const selectedOptions = [];
        const usedAbilities = new Set();

        for (let i = 0; i < count && availableAbilities.length > 0; i++) {
            const option = this.selectWeightedOption(availableAbilities, usedAbilities);
            if (option) {
                selectedOptions.push(option);
                usedAbilities.add(option.name);
            }
        }

        return selectedOptions;
    }

    getAbilityRarity(abilityName) {
        const rarities = {
            // Habilidades básicas (más comunes)
            stun: 1,
            reload: 1,
            dash: 2,
            shield: 2,
            // Habilidades avanzadas (menos comunes)
            heal: 3,
            speed: 3,
            energyBoost: 4,
            // Habilidades raras (muy poco comunes)
            multiStun: 5,
            reflect: 5
        };
        return rarities[abilityName] || 3;
    }

    selectWeightedOption(availableAbilities, usedAbilities) {
        // Filtrar habilidades ya usadas en esta selección
        const filteredAbilities = availableAbilities.filter(ability =>
            !usedAbilities.has(ability.name)
        );

        if (filteredAbilities.length === 0) return null;

        // Calcular pesos (rareza más alta = menos probable)
        const weights = filteredAbilities.map(ability => {
            const baseWeight = 10 - ability.rarity; // Rareza 1 = peso 9, rareza 5 = peso 5
            return Math.max(1, baseWeight);
        });

        // Selección aleatoria ponderada
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < filteredAbilities.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return filteredAbilities[i];
            }
        }

        return filteredAbilities[0]; // Fallback
    }

    chooseAbilityOption(optionIndex, options) {
        if (!options || optionIndex >= options.length) return false;

        const option = options[optionIndex];
        const ability = this.abilities[option.name];

        if (option.type === 'unlock') {
            // Desbloquear nueva habilidad
            ability.unlocked = true;
            ability.level = 1;
            return {
                type: 'unlock',
                ability: option.name,
                newLevel: 1
            };
        } else if (option.type === 'upgrade') {
            // Mejorar habilidad existente
            ability.level++;
            return {
                type: 'upgrade',
                ability: option.name,
                newLevel: ability.level
            };
        }

        return false;
    }

    unlockRandomAbility() {
        if (this.nextUnlockIndex < this.unlockOrder.length) {
            const abilityName = this.unlockOrder[this.nextUnlockIndex];
            this.abilities[abilityName].unlocked = true;
            this.nextUnlockIndex++;
            return abilityName;
        }
        return null;
    }

    upgradeAbility(abilityName) {
        const ability = this.abilities[abilityName];
        if (!ability || !ability.unlocked || ability.level >= ability.maxLevel || this.skillPoints <= 0) {
            return false;
        }

        ability.level++;
        this.skillPoints--;
        return true;
    }

    getAbilityStats(abilityName) {
        const ability = this.abilities[abilityName];
        const config = this.abilityConfigs[abilityName];

        if (!ability || !config || !ability.unlocked) {
            return null;
        }

        const stats = {};

        // Calcular estadísticas basadas en el nivel
        Object.keys(config).forEach(key => {
            if (key.startsWith('base')) {
                const statName = key.replace('base', '').toLowerCase();
                const bonusKey = key.replace('base', '') + 'Bonus';
                const bonusKey2 = key.replace('base', '').toLowerCase() + 'Bonus';

                if (config[bonusKey] !== undefined) {
                    stats[statName] = config[key] + (config[bonusKey] * ability.level);
                } else if (config[bonusKey2] !== undefined) {
                    stats[statName] = config[key] + (config[bonusKey2] * ability.level);
                } else {
                    stats[statName] = config[key];
                }
            }
        });

        return stats;
    }

    update(currentTime) {
        // Actualizar efectos activos
        if (this.activeEffects.speedBoost.active && currentTime > this.activeEffects.speedBoost.endTime) {
            this.activeEffects.speedBoost.active = false;
            this.activeEffects.speedBoost.multiplier = 1;
        }

        if (this.activeEffects.reflection.active && currentTime > this.activeEffects.reflection.endTime) {
            this.activeEffects.reflection.active = false;
            this.activeEffects.reflection.chance = 0;
        }
    }

    activateSpeedBoost() {
        if (!this.abilities.speed.unlocked) return false;

        const stats = this.getAbilityStats('speed');
        const currentTime = Date.now();

        this.activeEffects.speedBoost = {
            active: true,
            endTime: currentTime + stats.duration,
            multiplier: 1 + stats.boost
        };

        return true;
    }

    activateReflection() {
        if (!this.abilities.reflect.unlocked) return false;

        const stats = this.getAbilityStats('reflect');
        const currentTime = Date.now();

        this.activeEffects.reflection = {
            active: true,
            endTime: currentTime + stats.duration,
            chance: stats.chance
        };

        return true;
    }

    getSpeedMultiplier() {
        return this.activeEffects.speedBoost.multiplier;
    }

    getReflectionChance() {
        return this.activeEffects.reflection.chance;
    }

    getMaxEnergy() {
        if (!this.abilities.energyBoost.unlocked) return GAME_CONFIG.PLAYER.MAX_ENERGY;

        const stats = this.getAbilityStats('energyBoost');
        return GAME_CONFIG.PLAYER.MAX_ENERGY + stats.boost;
    }

    getUnlockedAbilities() {
        return Object.keys(this.abilities).filter(name => this.abilities[name].unlocked);
    }

    getAvailableUpgrades() {
        return Object.keys(this.abilities).filter(name => {
            const ability = this.abilities[name];
            return ability.unlocked && ability.level < ability.maxLevel;
        });
    }

    reset() {
        // Reset para nueva partida
        Object.keys(this.abilities).forEach(name => {
            this.abilities[name].unlocked = false;
            this.abilities[name].level = 0;
        });

        this.experience = 0;
        this.level = 1;
        this.skillPoints = 0;
        this.unlockOrder = this.generateRandomUnlockOrder();
        this.nextUnlockIndex = 0;

        this.activeEffects = {
            speedBoost: { active: false, endTime: 0, multiplier: 1 },
            reflection: { active: false, endTime: 0, chance: 0 }
        };
    }

    getAbilityOptionInfo(option) {
        const abilityName = option.name;
        const ability = this.abilities[abilityName];
        const config = this.abilityConfigs[abilityName];

        const info = {
            name: abilityName,
            displayName: this.getAbilityDisplayName(abilityName),
            description: this.getAbilityDescription(abilityName),
            type: option.type,
            currentLevel: ability.level,
            nextLevel: option.type === 'unlock' ? 1 : ability.level + 1,
            rarity: this.getAbilityRarity(abilityName),
            rarityName: this.getRarityName(this.getAbilityRarity(abilityName)),
            effects: this.getAbilityEffects(abilityName, option.type === 'unlock' ? 1 : ability.level + 1)
        };

        return info;
    }

    getAbilityDisplayName(abilityName) {
        const names = {
            stun: '⚡ Descarga Eléctrica',
            dash: '💨 Dash Fantasmal',
            shield: '🛡️ Escudo Energético',
            reload: '🔋 Recarga Rápida',
            heal: '⚡ SuperRecarga',
            speed: '🏃 Velocidad Supersónica',
            energyBoost: '⭐ Cristal de Poder',
            multiStun: '🌊 Onda de Choque',
            reflect: '🪞 Barrera Reflectante'
        };
        return names[abilityName] || abilityName;
    }

    getAbilityDescription(abilityName) {
        const descriptions = {
            stun: 'Libera una descarga eléctrica que aturde a todos los enemigos cercanos',
            dash: 'Te mueves a velocidad supersónica siendo invulnerable durante el movimiento',
            shield: 'Crea un escudo de energía que absorbe el próximo ataque enemigo',
            reload: 'Restaura tu energía básicamente mediante nanotecnología',
            heal: 'Tecnología avanzada que restaura una gran cantidad de energía instantáneamente',
            speed: 'Mejora temporalmente tu velocidad de movimiento con impulso cuántico',
            energyBoost: 'Un cristal de poder aumenta permanentemente tu energía máxima',
            multiStun: 'Genera ondas de choque expansivas que aturden enemigos en múltiples pulsos',
            reflect: 'Crea una barrera que refleja proyectiles enemigos de vuelta a ellos'
        };
        return descriptions[abilityName] || 'Habilidad misteriosa';
    }

    getRarityName(rarity) {
        const rarityNames = {
            1: 'Común',
            2: 'Poco Común',
            3: 'Raro',
            4: 'Épico',
            5: 'Legendario'
        };
        return rarityNames[rarity] || 'Desconocido';
    }

    getAbilityEffects(abilityName, level) {
        const config = this.abilityConfigs[abilityName];
        if (!config) return [];

        const effects = [];

        switch (abilityName) {
        case 'stun': {
            const duration = (config.baseDuration + config.levelBonus * (level - 1)) / 1000;
            const radius = config.baseRadius + config.radiusBonus * (level - 1);
            const cooldown = (config.baseCooldown - config.cooldownReduction * (level - 1)) / 1000;
            effects.push(`Duración: ${duration}s`);
            effects.push(`Radio: ${radius} píxeles`);
            effects.push(`Cooldown: ${cooldown}s`);
            break;
        }

        case 'dash': {
            const distance = config.baseDistance + config.distanceBonus * (level - 1);
            const dashCooldown = (config.baseCooldown - config.cooldownReduction * (level - 1)) / 1000;
            const invulnerability = (config.baseInvulnerability + config.invulnerabilityBonus * (level - 1)) / 1000;
            effects.push(`Distancia: ${distance.toFixed(1)}x`);
            effects.push(`Invulnerabilidad: ${invulnerability}s`);
            effects.push(`Cooldown: ${dashCooldown}s`);
            break;
        }

        case 'shield': {
            const shieldDuration = (config.baseDuration + config.durationBonus * (level - 1)) / 1000;
            const shieldCooldown = (config.baseCooldown - config.cooldownReduction * (level - 1)) / 1000;
            effects.push(`Duración: ${shieldDuration}s`);
            effects.push(`Cooldown: ${shieldCooldown}s`);
            if (level >= 3) effects.push('🌟 Refleja proyectiles');
            break;
        }

        case 'reload': {
            const heal = config.baseHeal + config.healBonus * (level - 1);
            const reloadCooldown = (config.baseCooldown - config.cooldownReduction * (level - 1)) / 1000;
            effects.push(`Curación: ${heal} energía`);
            effects.push(`Cooldown: ${reloadCooldown}s`);
            break;
        }

        case 'heal': {
            const healAmount = config.baseHeal + config.healBonus * (level - 1);
            const healCooldown = (config.baseCooldown - config.cooldownReduction * (level - 1)) / 1000;
            effects.push(`Curación: ${healAmount} energía`);
            effects.push(`Cooldown: ${healCooldown}s`);
            break;
        }

        case 'speed': {
            const speedBoost = ((config.baseBoost + config.boostBonus * (level - 1)) * 100).toFixed(0);
            const speedDuration = (config.baseDuration + config.durationBonus * (level - 1)) / 1000;
            effects.push(`Velocidad: +${speedBoost}%`);
            effects.push(`Duración: ${speedDuration}s`);
            break;
        }

        case 'energyBoost': {
            const energyBoost = config.baseBoost + config.boostBonus * (level - 1);
            effects.push(`Energía máxima: +${energyBoost}`);
            effects.push('🌟 Efecto permanente');
            break;
        }

        case 'multiStun': {
            const pulses = config.baseCount + config.countBonus * (level - 1);
            const multiCooldown = (config.baseCooldown - config.cooldownReduction * (level - 1)) / 1000;
            effects.push(`Pulsos: ${pulses} ondas`);
            effects.push(`Cooldown: ${multiCooldown}s`);
            break;
        }

        case 'reflect': {
            const chance = ((config.baseChance + config.chanceBonus * (level - 1)) * 100).toFixed(0);
            const reflectDuration = (config.baseDuration + config.durationBonus * (level - 1)) / 1000;
            effects.push(`Probabilidad: ${chance}%`);
            effects.push(`Duración: ${reflectDuration}s`);
            break;
        }
        }

        return effects;
    }
}
