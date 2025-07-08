import { Player } from './entities/Player.js';
import { Enemy } from './entities/Enemy.js';
import { GameSystem } from './systems/GameSystem.js';
import { InputSystem } from './systems/InputSystem.js';
import { AbilitySystem } from './systems/AbilitySystem.js';
import { ProgressionSystem } from './systems/ProgressionSystem.js';
import { Renderer } from './systems/Renderer.js';
import { UISystem } from './systems/UISystem.js';
import { GAME_CONFIG } from './utils/constants.js';
import { iconManager } from './utils/icons.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.ui = new UISystem();
        this.ui.adjustCanvasSize(this.canvas);
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.startTime = 0;
        this.lastTime = 0;
        this.lastWave = 0; // Track wave changes for ability selection
        
        // Initialize systems
        this.progressionSystem = new ProgressionSystem();
        this.player = new Player(this.width / 2, this.height / 2, this.progressionSystem);
        this.gameSystem = new GameSystem(this.width, this.height);
        this.inputSystem = new InputSystem();
        this.abilitySystem = new AbilitySystem(this.progressionSystem);
        this.renderer = new Renderer(this.canvas, this.ctx);
        
        // Connect systems
        this.gameSystem.renderer = this.renderer;
        
        // Start with only basic reload ability for emergencies
        this.progressionSystem.abilities.reload.unlocked = true;
        this.progressionSystem.abilities.reload.level = 1;
        
        this.initializeEventListeners();
        this.registerConsoleCommands();
        
        // Precargar iconos para mejor rendimiento
        iconManager.preloadAllIcons().catch(console.warn);
        
        // Show initial ability button
        this.updateAbilityButtons();
        
        // Expose game instance for console commands
        window.game = this;
    }
    
    initializeEventListeners() {
        this.ui.bindButtons({
            stun: () => this.abilitySystem.useStun(this.player, this.gameSystem.enemies),
            reload: () => this.abilitySystem.useReload(this.player),
            dash: () => this.abilitySystem.useDash(this.player, this.inputSystem),
            shield: () => this.abilitySystem.useShield(this.player),
            heal: () => this.abilitySystem.useHeal(this.player),
            speed: () => this.abilitySystem.useSpeedBoost(this.player),
            multiStun: () => this.abilitySystem.useMultiStun(this.player, this.gameSystem.enemies),
            reflect: () => this.abilitySystem.useReflect(this.player),
            restart: () => this.restart()
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.ui.detectMobile()) {
                this.ui.adjustCanvasSize(this.canvas);
                this.width = this.canvas.width;
                this.height = this.canvas.height;
                
                // Reposition player if needed
                this.player.x = Math.max(this.player.size, Math.min(this.width - this.player.size, this.player.x));
                this.player.y = Math.max(this.player.size, Math.min(this.height - this.player.size, this.player.y));
            }
        });
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.gameSystem.waveStartTime = this.startTime;
        this.lastTime = this.startTime;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.isPaused && !this.gameOver) {
            this.update(deltaTime, currentTime);
        }
        
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime, currentTime) {
        // Update input
        this.inputSystem.update();
        
        // Handle abilities
        this.handleAbilities();
        
        // Handle pause
        if (this.inputSystem.abilities.pause) {
            this.togglePause();
        }
        
        // Handle restart
        if (this.inputSystem.abilities.restart && this.gameOver) {
            this.restart();
        }
        
        // Update player
        this.player.update(deltaTime, this.inputSystem, this.width, this.height);
        
        // Update game systems
        this.gameSystem.update(deltaTime, this.player, currentTime);
        this.abilitySystem.update(this.player);
        this.progressionSystem.update(currentTime);
        
        // Check collisions
        if (this.gameSystem.checkCollisions(this.player)) {
            console.log('🚨 COLISIÓN DETECTADA! Terminando juego...');
            this.endGame();
            return;
        }
        
        // Check for wave completion and ability selection
        this.checkWaveCompletion();
        
        // Update UI
        this.ui.updateGameUI(this.gameSystem.currentWave, this.gameSystem.enemies, this.startTime);
        this.ui.updateEnergyUI(this.player.energy);
        this.updateProgressionUI();
        
        // Check game over condition
        if (this.player.energy <= 0) {
            this.endGame();
        }
    }
    
    handleAbilities() {
        if (this.inputSystem.abilities.stun) {
            this.abilitySystem.useStun(this.player, this.gameSystem.enemies);
        }
        
        if (this.inputSystem.abilities.reload) {
            this.abilitySystem.useReload(this.player);
        }
        
        if (this.inputSystem.abilities.dash) {
            this.abilitySystem.useDash(this.player, this.inputSystem);
        }
        
        if (this.inputSystem.abilities.shield) {
            this.abilitySystem.useShield(this.player);
        }
        
        if (this.inputSystem.abilities.heal) {
            this.abilitySystem.useHeal(this.player);
        }
        
        if (this.inputSystem.abilities.speed) {
            this.abilitySystem.useSpeed(this.player);
        }
        
        if (this.inputSystem.abilities.multiStun) {
            this.abilitySystem.useMultiStun(this.player, this.gameSystem.enemies);
        }
        
        if (this.inputSystem.abilities.reflect) {
            this.abilitySystem.useReflect(this.player);
        }
    }
    
    render() {
        // Crear el gameState para el renderer
        const gameState = {
            enemies: this.gameSystem.enemies,
            projectiles: this.gameSystem.projectiles,
            powerUps: this.gameSystem.powerUps,
            particles: this.gameSystem.particles
        };
        
        this.renderer.render(gameState, this.player, this.abilitySystem);
        
        if (this.isPaused) {
            this.renderer.drawPauseOverlay();
        }
    }
    
    togglePause() {
        if (this.gameOver) return;
        this.isPaused = !this.isPaused;
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        this.ui.showGameOver(this.startTime, this.gameSystem.currentWave);
    }
    
    restart() {
        // Reset game state
        this.gameOver = false;
        this.isPaused = false;
        this.lastWave = 1;
        
        // Reset player
        this.player = new Player(this.width / 2, this.height / 2, this.progressionSystem);
        
        // Reset systems
        this.gameSystem.reset();
        this.progressionSystem.reset();
        this.abilitySystem = new AbilitySystem(this.progressionSystem);
        
        // Start with only basic reload ability for emergencies
        this.progressionSystem.abilities.reload.unlocked = true;
        this.progressionSystem.abilities.reload.level = 1;
        
        // Hide game over screen and level up modal
        this.ui.hideGameOver();
        this.hideLevelUpModal();
        
        // Update UI
        this.updateProgressionUI();
        this.updateAbilityButtons();
        
        // Restart game
        this.start();
    }
    
    registerConsoleCommands() {
        window.showHitboxes = (value) => {
            if (value === undefined) {
                console.log(`Hitboxes are currently ${this.renderer.showHitboxes ? 'ON' : 'OFF'}`);
                return this.renderer.showHitboxes;
            }
            this.renderer.showHitboxes = Boolean(value);
            console.log(`Hitboxes ${this.renderer.showHitboxes ? 'enabled' : 'disabled'}`);
            return this.renderer.showHitboxes;
        };
        
        window.giveEnergy = (amount = 50) => {
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + amount);
            console.log(`Added ${amount} energy. Current energy: ${this.player.energy}`);
            return this.player.energy;
        };
        
        window.clearEnemies = () => {
            const count = this.gameSystem.enemies.length;
            this.gameSystem.enemies = [];
            this.gameSystem.projectiles = [];
            console.log(`Cleared ${count} enemies and all projectiles`);
            return count;
        };
        
        window.spawnEnemyNear = () => {
            const enemy = new Enemy(this.player.x + 50, this.player.y + 50, 'basic');
            this.gameSystem.enemies.push(enemy);
            console.log('Spawned basic enemy near player for collision testing');
            console.log(`Player at: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`);
            console.log(`Enemy at: (${Math.floor(enemy.x)}, ${Math.floor(enemy.y)})`);
            return enemy;
        };
        
        window.toggleGodMode = () => {
            if (this.renderer) {
                this.renderer.godModeEnabled = !this.renderer.godModeEnabled;
                console.log(`God mode ${this.renderer.godModeEnabled ? 'enabled' : 'disabled'}`);
                return this.renderer.godModeEnabled;
            }
            return false;
        };
        
        window.checkPlayerState = () => {
            console.log('🎮 Estado del Jugador:');
            console.log(`Posición: (${Math.floor(this.player.x)}, ${Math.floor(this.player.y)})`);
            console.log(`Energía: ${Math.floor(this.player.energy)}/${this.player.maxEnergy}`);
            console.log(`Escudo: ${this.player.hasShield ? 'Sí' : 'No'}`);
            console.log(`Dash: ${this.player.isDashing ? 'Sí' : 'No'}`);
            console.log(`Game Over: ${this.gameOver ? 'Sí' : 'No'}`);
            console.log(`Enemigos: ${this.gameSystem.enemies.length}`);
            console.log(`God Mode: ${this.renderer?.godModeEnabled ? 'Sí' : 'No'}`);
            console.log(`Hitbox radius: ${this.player.getHitboxRadius()}`);
            
            // Show enemy distances
            this.gameSystem.enemies.forEach((enemy, index) => {
                const distance = Math.sqrt(Math.pow(this.player.x - enemy.x, 2) + Math.pow(this.player.y - enemy.y, 2));
                const collisionDistance = this.player.getHitboxRadius() + enemy.getHitboxRadius();
                console.log(`Enemigo ${index}: distancia=${distance.toFixed(2)}, necesaria=${collisionDistance.toFixed(2)}, ¿colisión? ${distance < collisionDistance}`);
            });
            
            return {
                position: { x: this.player.x, y: this.player.y },
                energy: this.player.energy,
                shield: this.player.hasShield,
                dashing: this.player.isDashing,
                gameOver: this.gameOver,
                enemies: this.gameSystem.enemies.length
            };
        };
        
        window.help = () => {
            console.log('🎮 Última Línea - Console Commands:');
            console.log('showHitboxes(true/false) - Toggle collision box visibility');
            console.log('giveEnergy(amount) - Add energy to player');
            console.log('clearEnemies() - Remove all enemies and projectiles');
            console.log('spawnEnemyNear() - Spawn enemy near player for testing');
            console.log('toggleGodMode() - Toggle invincibility mode');
            console.log('checkPlayerState() - Show player status and debug info');
            console.log('forceAbilitySelection() - Force ability selection modal for testing');
            console.log('nextWave() - Force next wave for testing');
            console.log('help() - Show this help message');
            return 'Help displayed';
        };
        
        window.forceAbilitySelection = () => {
            const abilityOptions = this.progressionSystem.generateAbilityOptions();
            this.showAbilitySelectionModal({
                newWave: this.gameSystem.currentWave,
                abilityOptions: abilityOptions
            });
            console.log('Showing ability selection for testing');
            return abilityOptions;
        };
        
        window.nextWave = () => {
            this.gameSystem.enemies = []; // Clear enemies to trigger next wave
            this.gameSystem.projectiles = [];
            console.log('Forced next wave');
            return this.gameSystem.currentWave;
        };
        
        console.log('🎮 Última Línea loaded! Type help() for console commands.');
    }
    
    checkWaveCompletion() {
        // Check if wave changed
        if (this.gameSystem.currentWave > this.lastWave) {
            this.lastWave = this.gameSystem.currentWave;
            
            // Show ability selection after wave 1 (so we get abilities starting from wave 2)
            if (this.gameSystem.currentWave > 1) {
                this.showAbilitySelectionAfterWave();
            }
        }
    }
    
    showAbilitySelectionAfterWave() {
        const abilityOptions = this.progressionSystem.generateAbilityOptions();
        if (abilityOptions && abilityOptions.length > 0) {
            this.showAbilitySelectionModal({
                newWave: this.gameSystem.currentWave,
                abilityOptions: abilityOptions
            });
        }
    }
    
    showAbilitySelectionModal(waveData) {
        const modal = document.getElementById('level-up-modal');
        const newLevelSpan = document.getElementById('new-level');
        const abilityCardsContainer = document.getElementById('ability-cards');
        
        // Update wave number
        newLevelSpan.textContent = waveData.newWave || waveData.newLevel || this.gameSystem.currentWave;
        
        // Generate ability options (cards)
        this.generateAbilityCards(abilityCardsContainer, waveData.abilityOptions);
        
        modal.style.display = 'flex';
        this.isPaused = true;
    }
    
    generateAbilityCards(container, abilityOptions) {
        container.innerHTML = '';
        
        if (!abilityOptions || abilityOptions.length === 0) {
            container.innerHTML = '<p>No hay opciones disponibles</p>';
            return;
        }
        
        abilityOptions.forEach((option, index) => {
            const abilityInfo = this.progressionSystem.getAbilityOptionInfo(option);
            
            const card = document.createElement('div');
            card.className = `ability-card rarity-${abilityInfo.rarity}`;
            card.onclick = () => this.selectAbilityOption(index, abilityOptions);
            
            // Card header
            const header = document.createElement('div');
            header.className = 'card-header';
            
            // Icon container
            const iconContainer = document.createElement('div');
            iconContainer.className = 'ability-icon-container';
            
            // Cargar el icono de forma asíncrona
            iconManager.createIconElement(option.name).then(iconElement => {
                iconContainer.appendChild(iconElement);
            }).catch(error => {
                console.warn(`Error loading icon for ${option.name}:`, error);
                // Fallback icon
                iconContainer.innerHTML = `<div class="ability-icon fallback-icon">${iconManager.getDefaultSymbol(option.name)}</div>`;
            });
            
            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = abilityInfo.displayName;
            
            const rarity = document.createElement('div');
            rarity.className = 'card-rarity';
            rarity.textContent = abilityInfo.rarityName;
            
            const typeDiv = document.createElement('div');
            typeDiv.className = `card-type ${abilityInfo.type}`;
            if (abilityInfo.type === 'unlock') {
                typeDiv.textContent = '🆕 NUEVA';
            } else {
                typeDiv.textContent = `⬆️ MEJORAR`;
            }
            
            header.appendChild(iconContainer);
            header.appendChild(title);
            header.appendChild(rarity);
            header.appendChild(typeDiv);
            
            // Level info (top right corner)
            const levelInfo = document.createElement('div');
            levelInfo.className = 'card-level-info';
            if (abilityInfo.type === 'unlock') {
                levelInfo.textContent = 'Nivel 1';
            } else {
                levelInfo.textContent = `${abilityInfo.currentLevel} → ${abilityInfo.nextLevel}`;
            }
            
            // Description
            const description = document.createElement('div');
            description.className = 'card-description';
            description.textContent = abilityInfo.description;
            
            // Effects
            const effects = document.createElement('ul');
            effects.className = 'card-effects';
            abilityInfo.effects.forEach(effect => {
                const effectLi = document.createElement('li');
                effectLi.textContent = effect;
                effects.appendChild(effectLi);
            });
            
            card.appendChild(levelInfo);
            card.appendChild(header);
            card.appendChild(description);
            card.appendChild(effects);
            
            container.appendChild(card);
        });
    }
    
    selectAbilityOption(optionIndex, abilityOptions) {
        const result = this.progressionSystem.chooseAbilityOption(optionIndex, abilityOptions);
        
        if (result) {
            // Update UI
            this.updateProgressionUI();
            this.updateAbilityButtons();
            
            // Hide modal
            this.hideLevelUpModal();
            
            // Show feedback
            this.showAbilityFeedback(result);
        }
    }
    
    showAbilityFeedback(result) {
        // Crear un mensaje de feedback temporal
        const feedback = document.createElement('div');
        feedback.className = 'ability-feedback';
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 0, 0.9);
            color: black;
            padding: 20px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            z-index: 2000;
            animation: feedbackAnimation 2s ease-out forwards;
        `;
        
        const abilityName = this.progressionSystem.getAbilityDisplayName(result.ability);
        if (result.type === 'unlock') {
            feedback.textContent = `🎉 ${abilityName} DESBLOQUEADA!`;
        } else {
            feedback.textContent = `⬆️ ${abilityName} NIVEL ${result.newLevel}!`;
        }
        
        document.body.appendChild(feedback);
        
        // Remover después de la animación
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 2000);
    }
    
    updateProgressionUI() {
        document.getElementById('player-level').textContent = this.gameSystem.currentWave;
    }
    
    showLevelUpModal(levelUpData) {
        const modal = document.getElementById('level-up-modal');
        const newLevelSpan = document.getElementById('new-level');
        const newAbilityNotification = document.getElementById('new-ability-notification');
        const newAbilityName = document.getElementById('new-ability-name');
        const upgradeOptions = document.getElementById('upgrade-options');
        
        // Update level
        newLevelSpan.textContent = levelUpData.newLevel;
        
        // Show new ability notification if unlocked
        if (levelUpData.newAbility) {
            newAbilityNotification.style.display = 'block';
            newAbilityName.textContent = this.getAbilityDisplayName(levelUpData.newAbility);
        } else {
            newAbilityNotification.style.display = 'none';
        }
        
        // Generate upgrade options
        this.generateUpgradeOptions(upgradeOptions);
        
        modal.style.display = 'flex';
        this.isPaused = true;
    }
    
    hideLevelUpModal() {
        const modal = document.getElementById('level-up-modal');
        modal.style.display = 'none';
        this.isPaused = false;
    }
    
    generateUpgradeOptions(container) {
        container.innerHTML = '';
        
        const availableUpgrades = this.progressionSystem.getAvailableUpgrades();
        
        if (availableUpgrades.length === 0) {
            container.innerHTML = '<p>No hay mejoras disponibles</p>';
            return;
        }
        
        availableUpgrades.forEach(abilityName => {
            const ability = this.progressionSystem.abilities[abilityName];
            const stats = this.progressionSystem.getAbilityStats(abilityName);
            
            const option = document.createElement('div');
            option.className = 'upgrade-option';
            option.onclick = () => this.upgradeAbility(abilityName);
            
            const title = document.createElement('div');
            title.className = 'upgrade-title';
            title.textContent = `${this.getAbilityDisplayName(abilityName)} (Nivel ${ability.level} → ${ability.level + 1})`;
            
            const description = document.createElement('div');
            description.className = 'upgrade-description';
            description.textContent = this.getAbilityDescription(abilityName, ability.level + 1);
            
            const statsDiv = document.createElement('div');
            statsDiv.className = 'upgrade-stats';
            statsDiv.textContent = this.getAbilityUpgradeStats(abilityName, ability.level + 1);
            
            option.appendChild(title);
            option.appendChild(description);
            option.appendChild(statsDiv);
            
            container.appendChild(option);
        });
    }
    
    upgradeAbility(abilityName) {
        if (this.progressionSystem.upgradeAbility(abilityName)) {
            this.updateProgressionUI();
            this.generateUpgradeOptions(document.getElementById('upgrade-options'));
            
            // Show ability button if it was hidden
            const button = document.getElementById(abilityName + '-btn');
            if (button) {
                button.style.display = 'inline-block';
            }
        }
    }
    
    getAbilityDisplayName(abilityName) {
        const names = {
            stun: 'Aturdir',
            dash: 'Dash',
            shield: 'Escudo',
            reload: 'Recarga',
            heal: 'SuperRecarga',
            speed: 'Velocidad',
            energyBoost: 'Energía Extra',
            multiStun: 'Multi-Aturdir',
            reflect: 'Reflejo'
        };
        return names[abilityName] || abilityName;
    }
    
    getAbilityDescription(abilityName, level) {
        const descriptions = {
            stun: 'Aturde a todos los enemigos cercanos',
            dash: 'Movimiento rápido que te hace invulnerable',
            shield: 'Absorbe un ataque enemigo',
            reload: 'Restaura energía básica para emergencias',
            heal: 'Restaura gran cantidad de energía con tecnología avanzada',
            speed: 'Aumenta temporalmente tu velocidad',
            energyBoost: 'Aumenta tu energía máxima permanentemente',
            multiStun: 'Aturde enemigos en ondas expansivas',
            reflect: 'Refleja proyectiles enemigos'
        };
        return descriptions[abilityName] || 'Habilidad misteriosa';
    }
    
    getAbilityUpgradeStats(abilityName, level) {
        // Esto mostraría las mejoras específicas por nivel
        return `Mejora las estadísticas al nivel ${level}`;
    }
    
    updateAbilityButtons() {
        // Show/hide ability buttons based on unlocked abilities
        const abilities = ['stun', 'reload', 'dash', 'shield', 'heal', 'speed', 'multiStun', 'reflect'];
        
        abilities.forEach(abilityName => {
            const button = document.getElementById(abilityName + '-btn');
            if (button) {
                if (this.progressionSystem.abilities[abilityName] && this.progressionSystem.abilities[abilityName].unlocked) {
                    button.style.display = 'inline-block';
                    
                    // Añadir icono al botón si no lo tiene ya
                    if (!button.querySelector('.ability-button-icon')) {
                        this.addIconToButton(button, abilityName);
                    }
                } else {
                    button.style.display = 'none';
                }
            }
        });
    }
    
    addIconToButton(button, abilityName) {
        // Crear contenedor para el icono si no existe
        iconManager.createIconElement(abilityName).then(iconElement => {
            iconElement.className = 'ability-button-icon';
            
            // Insertar el icono al principio del botón
            const originalText = button.textContent;
            button.innerHTML = '';
            button.appendChild(iconElement);
            
            const textSpan = document.createElement('span');
            textSpan.textContent = originalText;
            button.appendChild(textSpan);
        }).catch(error => {
            console.warn(`Error loading button icon for ${abilityName}:`, error);
        });
    }
}

// Initialize and start the game
const game = new Game();
game.start();
