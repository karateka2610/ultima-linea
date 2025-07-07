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
        
        // Enemy projectiles
        this.projectiles = [];
        this.lastProjectileTime = 0;
        this.projectileSpeed = 2;
        
        // Power-ups (rayos amarillos)
        this.powerUps = [];
        this.powerUpSpawnRate = 8000; // 8 seconds
        this.lastPowerUpSpawn = 0;
        
        // Particle effects
        this.particles = [];
        
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
        
        // New abilities
        this.dashCooldown = 4000;
        this.lastDashTime = 0;
        this.dashDuration = 200;
        this.isDashing = false;
        this.dashStartTime = 0;
        this.dashDirection = { x: 0, y: 0 };
        
        this.shieldCooldown = 8000;
        this.lastShieldTime = 0;
        this.shieldDuration = 3000;
        this.hasShield = false;
        this.shieldStartTime = 0;
        
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
            } else if (e.key.toLowerCase() === 'f') {
                this.useDash();
            } else if (e.key.toLowerCase() === 'c') {
                this.useShield();
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
        
        // New ability buttons
        if (document.getElementById('dash-btn')) {
            document.getElementById('dash-btn').addEventListener('click', () => this.useDash());
        }
        if (document.getElementById('shield-btn')) {
            document.getElementById('shield-btn').addEventListener('click', () => this.useShield());
        }
        
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
        
        document.getElementById('mobile-dash').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.useDash();
        });
        
        document.getElementById('mobile-shield').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.useShield();
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
        
        // Update projectiles
        this.updateProjectiles();
        
        // Update power-ups
        this.updatePowerUps();
        
        // Update particles
        this.updateParticles();
        
        // Spawn enemies
        this.spawnEnemies();
        
        // Spawn power-ups
        this.spawnPowerUps();
        
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
        
        // Handle dash movement
        if (this.isDashing) {
            const currentTime = Date.now();
            if (currentTime - this.dashStartTime < this.dashDuration) {
                dx = this.dashDirection.x * this.player.speed * 3;
                dy = this.dashDirection.y * this.player.speed * 3;
            } else {
                this.isDashing = false;
            }
        } else {
            // Normal movement
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
            
            // Apply normal speed
            dx *= this.player.speed;
            dy *= this.player.speed;
        }
        
        // Apply movement
        this.player.x += dx;
        this.player.y += dy;
        
        // Keep player in bounds
        this.player.x = Math.max(this.player.size, Math.min(this.width - this.player.size, this.player.x));
        this.player.y = Math.max(this.player.size, Math.min(this.height - this.player.size, this.player.y));
        
        // Update shield
        if (this.hasShield && Date.now() - this.shieldStartTime > this.shieldDuration) {
            this.hasShield = false;
        }
    }
    
    updateEnemies() {
        const currentTime = Date.now();
        
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.stunned) {
                // Check if stun has worn off
                if (currentTime - enemy.stunStartTime > this.stunDuration) {
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
            
            // Shooter enemies shoot projectiles
            if (enemy.type === 'shooter' && currentTime - enemy.lastShotTime > enemy.shootRate) {
                if (distance < 150) { // Only shoot when close enough
                    this.createProjectile(enemy.x, enemy.y, dx / distance, dy / distance);
                    enemy.lastShotTime = currentTime;
                }
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
        
        // Determine enemy type based on wave
        const enemyType = this.getRandomEnemyType();
        
        const enemy = {
            x: x,
            y: y,
            size: this.enemySize,
            speed: this.enemySpeed,
            stunned: false,
            stunStartTime: 0,
            type: enemyType,
            lastShotTime: 0,
            health: 1
        };
        
        // Configure enemy based on type
        switch (enemyType) {
            case 'basic':
                enemy.color = '#ff4444';
                enemy.speed = this.enemySpeed;
                break;
            case 'fast':
                enemy.color = '#44ff44';
                enemy.speed = this.enemySpeed * 1.8;
                enemy.size = this.enemySize * 0.8;
                break;
            case 'shooter':
                enemy.color = '#4444ff';
                enemy.speed = this.enemySpeed * 0.6;
                enemy.size = this.enemySize * 1.2;
                enemy.shootRate = 2000; // shoot every 2 seconds
                break;
        }
        
        this.enemies.push(enemy);
        this.enemiesSpawnedThisWave++;
    }
    
    getRandomEnemyType() {
        const wave = this.currentWave;
        const rand = Math.random();
        
        if (wave <= 2) {
            return 'basic';
        } else if (wave <= 5) {
            if (rand < 0.7) return 'basic';
            else return 'fast';
        } else {
            if (rand < 0.5) return 'basic';
            else if (rand < 0.8) return 'fast';
            else return 'shooter';
        }
    }
    
    checkCollisions() {
        // Check enemy collisions
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + enemy.size) {
                if (this.hasShield) {
                    // Shield absorbs the hit
                    this.hasShield = false;
                    this.enemies.splice(i, 1);
                    this.createShieldParticles(this.player.x, this.player.y);
                } else if (!this.isDashing) {
                    this.endGame();
                    return;
                }
            }
        }
        
        // Check projectile collisions
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            const dx = this.player.x - projectile.x;
            const dy = this.player.y - projectile.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + projectile.size) {
                if (this.hasShield) {
                    // Shield absorbs the projectile
                    this.projectiles.splice(i, 1);
                    this.createShieldParticles(this.player.x, this.player.y);
                } else if (!this.isDashing) {
                    this.endGame();
                    return;
                } else {
                    // Dash deflects projectiles
                    this.projectiles.splice(i, 1);
                }
            }
        }
    }
    
    createShieldParticles(x, y) {
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                life: 0.8,
                maxLife: 0.8,
                size: 4,
                color: '#00ffff'
            });
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
        const dashBtn = document.getElementById('dash-btn');
        const shieldBtn = document.getElementById('shield-btn');
        const mobileStunBtn = document.getElementById('mobile-stun');
        const mobileReloadBtn = document.getElementById('mobile-reload');
        const mobileDashBtn = document.getElementById('mobile-dash');
        const mobileShieldBtn = document.getElementById('mobile-shield');
        
        const stunReady = currentTime - this.lastStunTime > this.stunCooldown;
        const reloadReady = currentTime - this.lastReloadTime > this.reloadCooldown;
        const dashReady = currentTime - this.lastDashTime > this.dashCooldown;
        const shieldReady = currentTime - this.lastShieldTime > this.shieldCooldown;
        
        // Desktop buttons
        stunBtn.disabled = !stunReady;
        stunBtn.className = stunReady ? 'button' : 'button cooldown';
        stunBtn.textContent = stunReady ? 'Aturdir (Q)' : `Aturdir (${Math.ceil((this.stunCooldown - (currentTime - this.lastStunTime)) / 1000)}s)`;
        
        reloadBtn.disabled = !reloadReady;
        reloadBtn.className = reloadReady ? 'button' : 'button cooldown';
        reloadBtn.textContent = reloadReady ? 'Recargar (E)' : `Recargar (${Math.ceil((this.reloadCooldown - (currentTime - this.lastReloadTime)) / 1000)}s)`;
        
        if (dashBtn) {
            dashBtn.disabled = !dashReady;
            dashBtn.className = dashReady ? 'button' : 'button cooldown';
            dashBtn.textContent = dashReady ? 'Dash (F)' : `Dash (${Math.ceil((this.dashCooldown - (currentTime - this.lastDashTime)) / 1000)}s)`;
        }
        
        if (shieldBtn) {
            shieldBtn.disabled = !shieldReady;
            shieldBtn.className = shieldReady ? 'button' : 'button cooldown';
            shieldBtn.textContent = shieldReady ? 'Escudo (C)' : `Escudo (${Math.ceil((this.shieldCooldown - (currentTime - this.lastShieldTime)) / 1000)}s)`;
        }
        
        // Mobile buttons
        if (mobileStunBtn && mobileReloadBtn) {
            mobileStunBtn.disabled = !stunReady;
            mobileStunBtn.className = stunReady ? 'mobile-btn' : 'mobile-btn cooldown';
            mobileStunBtn.textContent = stunReady ? 'STUN' : Math.ceil((this.stunCooldown - (currentTime - this.lastStunTime)) / 1000);
            
            mobileReloadBtn.disabled = !reloadReady;
            mobileReloadBtn.className = reloadReady ? 'mobile-btn' : 'mobile-btn cooldown';
            mobileReloadBtn.textContent = reloadReady ? 'RELOAD' : Math.ceil((this.reloadCooldown - (currentTime - this.lastReloadTime)) / 1000);
            
            if (mobileDashBtn) {
                mobileDashBtn.disabled = !dashReady;
                mobileDashBtn.className = dashReady ? 'mobile-btn' : 'mobile-btn cooldown';
                mobileDashBtn.textContent = dashReady ? 'DASH' : Math.ceil((this.dashCooldown - (currentTime - this.lastDashTime)) / 1000);
            }
            
            if (mobileShieldBtn) {
                mobileShieldBtn.disabled = !shieldReady;
                mobileShieldBtn.className = shieldReady ? 'mobile-btn' : 'mobile-btn cooldown';
                mobileShieldBtn.textContent = shieldReady ? 'SHIELD' : Math.ceil((this.shieldCooldown - (currentTime - this.lastShieldTime)) / 1000);
            }
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
    
    useDash() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastDashTime > this.dashCooldown && this.player.energy >= 15) {
            this.lastDashTime = currentTime;
            this.isDashing = true;
            this.dashStartTime = currentTime;
            this.player.energy -= 15;
            
            // Determine dash direction based on current input
            let dx = 0, dy = 0;
            
            if (this.keys['w'] || this.keys['arrowup']) dy -= 1;
            if (this.keys['s'] || this.keys['arrowdown']) dy += 1;
            if (this.keys['a'] || this.keys['arrowleft']) dx -= 1;
            if (this.keys['d'] || this.keys['arrowright']) dx += 1;
            
            if (this.touchInput.active) {
                dx = this.touchInput.x;
                dy = this.touchInput.y;
            }
            
            // Default forward if no input
            if (dx === 0 && dy === 0) {
                dy = -1; // dash upward by default
            }
            
            // Normalize
            const magnitude = Math.sqrt(dx * dx + dy * dy);
            if (magnitude > 0) {
                this.dashDirection.x = dx / magnitude;
                this.dashDirection.y = dy / magnitude;
            }
        }
    }
    
    useShield() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastShieldTime > this.shieldCooldown && this.player.energy >= 25) {
            this.lastShieldTime = currentTime;
            this.hasShield = true;
            this.shieldStartTime = currentTime;
            this.player.energy -= 25;
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
        
        // Draw power-ups
        for (const powerUp of this.powerUps) {
            this.drawPowerUp(powerUp);
        }
        
        // Draw enemies
        for (const enemy of this.enemies) {
            this.drawEnemy(enemy);
        }
        
        // Draw projectiles
        for (const projectile of this.projectiles) {
            this.drawProjectile(projectile);
        }
        
        // Draw particles
        for (const particle of this.particles) {
            this.drawParticle(particle);
        }
        
        // Draw player
        this.drawPlayer();
        
        // Draw effects
        if (this.isStunActive) {
            this.drawStunEffect();
        }
        
        if (this.hasShield) {
            this.drawShieldEffect();
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
        
        // Draw different shapes for different enemy types
        if (enemy.type === 'shooter') {
            // Draw square for shooter enemies
            this.ctx.fillRect(
                enemy.x - enemy.size / 2,
                enemy.y - enemy.size / 2,
                enemy.size,
                enemy.size
            );
        } else {
            // Draw circle for other enemies
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw stun indicator
        if (enemy.stunned) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 3, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // Draw speed indicator for fast enemies
        if (enemy.type === 'fast' && !enemy.stunned) {
            this.ctx.strokeStyle = '#44ff44';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.size / 2 + 2, 0, Math.PI * 2);
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
    
    drawProjectile(projectile) {
        this.ctx.fillStyle = projectile.color;
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, projectile.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add glow effect
        this.ctx.shadowColor = projectile.color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, projectile.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawPowerUp(powerUp) {
        // Draw lightning bolt shape
        this.ctx.fillStyle = powerUp.color;
        this.ctx.shadowColor = powerUp.color;
        this.ctx.shadowBlur = 15 * powerUp.glowIntensity;
        
        // Simple lightning bolt shape
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
    }
    
    drawParticle(particle) {
        const alpha = particle.life / particle.maxLife;
        this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawShieldEffect() {
        const currentTime = Date.now();
        const pulseIntensity = Math.sin((currentTime - this.shieldStartTime) / 200) * 0.3 + 0.7;
        
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${pulseIntensity})`;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size + 8, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = `rgba(0, 255, 255, ${pulseIntensity * 0.5})`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size + 12, 0, Math.PI * 2);
        this.ctx.stroke();
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
        this.projectiles = [];
        this.powerUps = [];
        this.particles = [];
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
        this.lastDashTime = 0;
        this.lastShieldTime = 0;
        this.isStunActive = false;
        this.isDashing = false;
        this.hasShield = false;
        
        // Reset spawn timers
        this.lastPowerUpSpawn = 0;
        
        // Reset effects
        this.stopScreenShake();
        this.canvas.className = '';
        
        // Hide game over screen
        document.getElementById('game-over').style.display = 'none';
        
        // Restart game
        this.start();
    }
    
    createProjectile(x, y, dirX, dirY) {
        this.projectiles.push({
            x: x,
            y: y,
            dirX: dirX,
            dirY: dirY,
            speed: this.projectileSpeed,
            size: 4,
            color: '#00aaff'
        });
    }
    
    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            
            projectile.x += projectile.dirX * projectile.speed;
            projectile.y += projectile.dirY * projectile.speed;
            
            // Remove projectiles that are off screen
            if (projectile.x < -10 || projectile.x > this.width + 10 ||
                projectile.y < -10 || projectile.y > this.height + 10) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    spawnPowerUps() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastPowerUpSpawn > this.powerUpSpawnRate) {
            this.spawnPowerUp();
            this.lastPowerUpSpawn = currentTime;
        }
    }
    
    spawnPowerUp() {
        // Spawn power-up in a safe area (not too close to player)
        let x, y;
        let attempts = 0;
        
        do {
            x = Math.random() * (this.width - 40) + 20;
            y = Math.random() * (this.height - 40) + 20;
            attempts++;
        } while (attempts < 10 && this.getDistance(x, y, this.player.x, this.player.y) < 80);
        
        this.powerUps.push({
            x: x,
            y: y,
            size: 16,
            color: '#ffff00',
            glowIntensity: 0,
            animationTime: 0,
            energyBonus: 30
        });
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            // Animate glow effect
            powerUp.animationTime += 0.1;
            powerUp.glowIntensity = Math.sin(powerUp.animationTime) * 0.5 + 0.5;
            
            // Check if player collects it
            const distance = this.getDistance(powerUp.x, powerUp.y, this.player.x, this.player.y);
            if (distance < powerUp.size) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    collectPowerUp(powerUp) {
        // Restore energy
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + powerUp.energyBonus);
        
        // Create collection particles
        this.createCollectionParticles(powerUp.x, powerUp.y);
    }
    
    createCollectionParticles(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                life: 1,
                maxLife: 1,
                size: 3,
                color: '#ffff00'
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.vx *= 0.98; // friction
            particle.vy *= 0.98;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Initialize and start the game
const game = new Game();
game.start();
