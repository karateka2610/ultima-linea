class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Adjust canvas size for mobile
        this.adjustCanvasSize();
        
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.startTime = 0;
        this.lastTime = 0;
        
        // Player
        this.player = {
            x: this.width / 2,
            y: this.height / 2,
            size: 15,
            speed: 3,
            color: '#00ff00',
            energy: 100,
            maxEnergy: 100
        };
        
        // Enemies
        this.enemies = [];
        this.enemySpawnRate = 1000; // milliseconds
        this.lastEnemySpawn = 0;
        this.enemySpeed = 1;
        this.enemySize = 12;
        
        // Wave system
        this.currentWave = 1;
        this.waveEnemyCount = 5;
        this.enemiesSpawnedThisWave = 0;
        this.enemiesKilledThisWave = 0;
        this.waveStartTime = 0;
        this.waveDuration = 30000; // 30 seconds per wave
        
        // Abilities
        this.stunCooldown = 3000;
        this.lastStunTime = 0;
        this.reloadCooldown = 5000;
        this.lastReloadTime = 0;
        this.stunDuration = 2000;
        this.isStunActive = false;
        this.stunStartTime = 0;
        
        // Effects
        this.screenShake = false;
        this.shakeIntensity = 0;
        this.dangerLevel = 0; // 0 = safe, 1 = warning, 2 = danger
        
        // Input
        this.keys = {};
        
        // Mobile touch controls
        this.isMobile = this.detectMobile();
        this.touchInput = {
            x: 0,
            y: 0,
            active: false
        };
        this.joystickCenter = { x: 60, y: 60 };
        this.joystickRadius = 50;
        this.isDragging = false;
        
        this.initializeEventListeners();
        this.updateUI();
    }
    
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }
    
    adjustCanvasSize() {
        if (this.detectMobile()) {
            const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 400);
            this.canvas.width = maxSize;
            this.canvas.height = maxSize;
            this.canvas.style.width = maxSize + 'px';
            this.canvas.style.height = maxSize + 'px';
        }
    }
    
    initializeEventListeners() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key.toLowerCase() === 'q') {
                this.useStun();
            } else if (e.key.toLowerCase() === 'e') {
                this.useReload();
            } else if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            } else if (e.key.toLowerCase() === 'r' && this.gameOver) {
                this.restart();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Button clicks
        document.getElementById('stun-btn').addEventListener('click', () => this.useStun());
        document.getElementById('reload-btn').addEventListener('click', () => this.useReload());
        document.getElementById('restart-btn').addEventListener('click', () => this.restart());
        
        // Mobile controls
        if (this.isMobile) {
            this.initializeMobileControls();
        }
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent scrolling on mobile
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        // Handle orientation changes
        window.addEventListener('resize', () => {
            if (this.isMobile) {
                this.adjustCanvasSize();
                this.width = this.canvas.width;
                this.height = this.canvas.height;
                
                // Reposition player if needed
                this.player.x = Math.max(this.player.size, Math.min(this.width - this.player.size, this.player.x));
                this.player.y = Math.max(this.player.size, Math.min(this.height - this.player.size, this.player.y));
            }
        });
    }
    
    initializeMobileControls() {
        const joystickBase = document.querySelector('.joystick-base');
        const joystickKnob = document.getElementById('joystick-knob');
        
        // Joystick touch events
        joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDragging = true;
            this.handleJoystickMove(e.touches[0], joystickBase, joystickKnob);
        });
        
        joystickBase.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDragging) {
                this.handleJoystickMove(e.touches[0], joystickBase, joystickKnob);
            }
        });
        
        joystickBase.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDragging = false;
            this.touchInput.x = 0;
            this.touchInput.y = 0;
            this.touchInput.active = false;
            
            // Reset joystick position
            joystickKnob.style.left = '50%';
            joystickKnob.style.top = '50%';
        });
        
        // Mobile button events
        document.getElementById('mobile-stun').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.useStun();
        });
        
        document.getElementById('mobile-reload').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.useReload();
        });
        
        document.getElementById('mobile-pause').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.togglePause();
        });
    }
    
    handleJoystickMove(touch, joystickBase, joystickKnob) {
        const rect = joystickBase.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = touch.clientX - centerX;
        const deltaY = touch.clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = rect.width / 2 - 20;
        
        if (distance <= maxDistance) {
            joystickKnob.style.left = `${50 + (deltaX / maxDistance) * 30}%`;
            joystickKnob.style.top = `${50 + (deltaY / maxDistance) * 30}%`;
            
            this.touchInput.x = deltaX / maxDistance;
            this.touchInput.y = deltaY / maxDistance;
        } else {
            const angle = Math.atan2(deltaY, deltaX);
            const limitedX = Math.cos(angle) * maxDistance;
            const limitedY = Math.sin(angle) * maxDistance;
            
            joystickKnob.style.left = `${50 + (limitedX / maxDistance) * 30}%`;
            joystickKnob.style.top = `${50 + (limitedY / maxDistance) * 30}%`;
            
            this.touchInput.x = limitedX / maxDistance;
            this.touchInput.y = limitedY / maxDistance;
        }
        
        this.touchInput.active = true;
    }
    
    start() {
        this.isRunning = true;
        this.startTime = Date.now();
        this.waveStartTime = this.startTime;
        this.lastTime = this.startTime;
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.isPaused && !this.gameOver) {
            this.update(deltaTime);
        }
        
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update(deltaTime) {
        // Update player
        this.updatePlayer();
        
        // Update enemies
        this.updateEnemies();
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Check collisions
        this.checkCollisions();
        
        // Update abilities
        this.updateAbilities();
        
        // Update wave system
        this.updateWaves();
        
        // Update effects
        this.updateEffects();
        
        // Update UI
        this.updateUI();
        
        // Decrease energy over time
        this.player.energy = Math.max(0, this.player.energy - 0.05);
        
        // Check game over conditions
        if (this.player.energy <= 0) {
            this.endGame();
        }
    }
    
    updatePlayer() {
        let dx = 0;
        let dy = 0;
        
        // Handle keyboard input
        if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
        if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
        if (this.keys['d'] || this.keys['arrowright']) dx += 1;
        
        // Handle mobile touch input
        if (this.touchInput.active) {
            dx = this.touchInput.x;
            dy = this.touchInput.y;
        }
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Apply movement
        this.player.x += dx * this.player.speed;
        this.player.y += dy * this.player.speed;
        
        // Keep player in bounds
        this.player.x = Math.max(this.player.size, Math.min(this.width - this.player.size, this.player.x));
        this.player.y = Math.max(this.player.size, Math.min(this.height - this.player.size, this.player.y));
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.stunned) {
                // Check if stun has worn off
                if (Date.now() - enemy.stunStartTime > this.stunDuration) {
                    enemy.stunned = false;
                }
                continue;
            }
            
            // Move enemy towards player
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
        }
    }
    
    spawnEnemies() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastEnemySpawn > this.enemySpawnRate && 
            this.enemiesSpawnedThisWave < this.waveEnemyCount) {
            
            this.spawnEnemy();
            this.lastEnemySpawn = currentTime;
        }
    }
    
    spawnEnemy() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0: // Top
                x = Math.random() * this.width;
                y = -this.enemySize;
                break;
            case 1: // Right
                x = this.width + this.enemySize;
                y = Math.random() * this.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.width;
                y = this.height + this.enemySize;
                break;
            case 3: // Left
                x = -this.enemySize;
                y = Math.random() * this.height;
                break;
        }
        
        this.enemies.push({
            x: x,
            y: y,
            size: this.enemySize,
            speed: this.enemySpeed,
            color: '#ff4444',
            stunned: false,
            stunStartTime: 0
        });
        
        this.enemiesSpawnedThisWave++;
    }
    
    checkCollisions() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + enemy.size) {
                this.endGame();
                return;
            }
        }
    }
    
    updateAbilities() {
        const currentTime = Date.now();
        
        // Update stun effect
        if (this.isStunActive && currentTime - this.stunStartTime > this.stunDuration) {
            this.isStunActive = false;
        }
        
        // Update button states
        const stunBtn = document.getElementById('stun-btn');
        const reloadBtn = document.getElementById('reload-btn');
        const mobileStunBtn = document.getElementById('mobile-stun');
        const mobileReloadBtn = document.getElementById('mobile-reload');
        
        const stunReady = currentTime - this.lastStunTime > this.stunCooldown;
        const reloadReady = currentTime - this.lastReloadTime > this.reloadCooldown;
        
        // Desktop buttons
        stunBtn.disabled = !stunReady;
        stunBtn.className = stunReady ? 'button' : 'button cooldown';
        stunBtn.textContent = stunReady ? 'Aturdir (Q)' : `Aturdir (${Math.ceil((this.stunCooldown - (currentTime - this.lastStunTime)) / 1000)}s)`;
        
        reloadBtn.disabled = !reloadReady;
        reloadBtn.className = reloadReady ? 'button' : 'button cooldown';
        reloadBtn.textContent = reloadReady ? 'Recargar (E)' : `Recargar (${Math.ceil((this.reloadCooldown - (currentTime - this.lastReloadTime)) / 1000)}s)`;
        
        // Mobile buttons
        if (mobileStunBtn && mobileReloadBtn) {
            mobileStunBtn.disabled = !stunReady;
            mobileStunBtn.className = stunReady ? 'mobile-btn' : 'mobile-btn cooldown';
            mobileStunBtn.textContent = stunReady ? 'STUN' : Math.ceil((this.stunCooldown - (currentTime - this.lastStunTime)) / 1000);
            
            mobileReloadBtn.disabled = !reloadReady;
            mobileReloadBtn.className = reloadReady ? 'mobile-btn' : 'mobile-btn cooldown';
            mobileReloadBtn.textContent = reloadReady ? 'RELOAD' : Math.ceil((this.reloadCooldown - (currentTime - this.lastReloadTime)) / 1000);
        }
    }
    
    updateWaves() {
        const currentTime = Date.now();
        
        // Check if wave is complete
        if (this.enemiesSpawnedThisWave >= this.waveEnemyCount && this.enemies.length === 0) {
            this.startNextWave();
        }
        
        // Auto-advance wave after time limit
        if (currentTime - this.waveStartTime > this.waveDuration) {
            this.startNextWave();
        }
    }
    
    startNextWave() {
        this.currentWave++;
        this.waveEnemyCount = Math.min(20, this.waveEnemyCount + 2);
        this.enemySpeed = Math.min(3, this.enemySpeed + 0.2);
        this.enemySpawnRate = Math.max(300, this.enemySpawnRate - 50);
        this.enemiesSpawnedThisWave = 0;
        this.enemiesKilledThisWave = 0;
        this.waveStartTime = Date.now();
        
        // Clear existing enemies
        this.enemies = [];
        
        // Restore some energy as wave bonus
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 20);
    }
    
    updateEffects() {
        // Calculate danger level based on nearby enemies
        let nearbyEnemies = 0;
        let closestDistance = Infinity;
        
        for (const enemy of this.enemies) {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                nearbyEnemies++;
            }
            
            closestDistance = Math.min(closestDistance, distance);
        }
        
        // Update danger level
        if (nearbyEnemies >= 3 || closestDistance < 50) {
            this.dangerLevel = 2; // High danger
        } else if (nearbyEnemies >= 1 || closestDistance < 100) {
            this.dangerLevel = 1; // Warning
        } else {
            this.dangerLevel = 0; // Safe
        }
        
        // Update canvas style based on danger level
        this.canvas.className = '';
        if (this.dangerLevel === 2) {
            this.canvas.classList.add('canvas-danger');
            if (!this.screenShake) {
                this.startScreenShake();
            }
        } else if (this.dangerLevel === 1) {
            this.canvas.classList.add('canvas-warning');
            this.stopScreenShake();
        } else {
            this.stopScreenShake();
        }
    }
    
    startScreenShake() {
        this.screenShake = true;
        this.canvas.classList.add('vibrate');
    }
    
    stopScreenShake() {
        this.screenShake = false;
        this.canvas.classList.remove('vibrate');
    }
    
    useStun() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastStunTime > this.stunCooldown && this.player.energy >= 20) {
            this.lastStunTime = currentTime;
            this.isStunActive = true;
            this.stunStartTime = currentTime;
            this.player.energy -= 20;
            
            // Stun all enemies
            for (const enemy of this.enemies) {
                enemy.stunned = true;
                enemy.stunStartTime = currentTime;
            }
        }
    }
    
    useReload() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastReloadTime > this.reloadCooldown) {
            this.lastReloadTime = currentTime;
            this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 40);
        }
    }
    
    togglePause() {
        if (this.gameOver) return;
        
        this.isPaused = !this.isPaused;
    }
    
    updateUI() {
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        document.getElementById('wave').textContent = this.currentWave;
        document.getElementById('timer').textContent = elapsedTime;
        document.getElementById('enemies').textContent = this.enemies.length;
        document.getElementById('energy').textContent = Math.floor(this.player.energy);
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw background grid
        this.drawGrid();
        
        // Draw enemies
        for (const enemy of this.enemies) {
            this.drawEnemy(enemy);
        }
        
        // Draw player
        this.drawPlayer();
        
        // Draw effects
        if (this.isStunActive) {
            this.drawStunEffect();
        }
        
        // Draw pause overlay
        if (this.isPaused) {
            this.drawPauseOverlay();
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#111';
        this.ctx.lineWidth = 1;
        
        const gridSize = 20;
        
        for (let x = 0; x <= this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(
            this.player.x - this.player.size / 2,
            this.player.y - this.player.size / 2,
            this.player.size,
            this.player.size
        );
        
        // Draw energy bar
        const barWidth = this.player.size * 2;
        const barHeight = 4;
        const barX = this.player.x - barWidth / 2;
        const barY = this.player.y - this.player.size / 2 - 10;
        
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const energyWidth = (this.player.energy / this.player.maxEnergy) * barWidth;
        this.ctx.fillStyle = this.player.energy > 30 ? '#00ff00' : '#ff4444';
        this.ctx.fillRect(barX, barY, energyWidth, barHeight);
    }
    
    drawEnemy(enemy) {
        if (enemy.stunned) {
            this.ctx.fillStyle = '#ffff00';
        } else {
            this.ctx.fillStyle = enemy.color;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw stun indicator
        if (enemy.stunned) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
    }
    
    drawStunEffect() {
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, 50, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, 80, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawPauseOverlay() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSADO', this.width / 2, this.height / 2);
        
        this.ctx.font = '12px Courier New';
        this.ctx.fillText('Presiona ESPACIO para continuar', this.width / 2, this.height / 2 + 30);
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        
        const elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        document.getElementById('final-time').textContent = elapsedTime;
        document.getElementById('final-waves').textContent = this.currentWave - 1;
        document.getElementById('game-over').style.display = 'block';
    }
    
    restart() {
        // Reset all game state
        this.gameOver = false;
        this.isPaused = false;
        this.currentWave = 1;
        this.enemies = [];
        this.enemiesSpawnedThisWave = 0;
        this.enemiesKilledThisWave = 0;
        this.enemySpawnRate = 1000;
        this.enemySpeed = 1;
        this.waveEnemyCount = 5;
        this.dangerLevel = 0;
        
        // Reset player
        this.player.x = this.width / 2;
        this.player.y = this.height / 2;
        this.player.energy = 100;
        
        // Reset abilities
        this.lastStunTime = 0;
        this.lastReloadTime = 0;
        this.isStunActive = false;
        
        // Reset effects
        this.stopScreenShake();
        this.canvas.className = '';
        
        // Hide game over screen
        document.getElementById('game-over').style.display = 'none';
        
        // Restart game
        this.start();
    }
}

// Initialize and start the game
const game = new Game();
game.start();
