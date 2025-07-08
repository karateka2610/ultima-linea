import { KEYS } from '../utils/constants.js';
import { isKeyPressed, normalizeVector, detectMobile } from '../utils/helpers.js';

export class InputSystem {
    constructor() {
        this.keys = {};
        this.touchInput = { x: 0, y: 0, active: false, firing: false };
        this.isDragging = false;
        this.isMobile = detectMobile();

        this.movement = { x: 0, y: 0 };
        this.abilities = {
            stun: false,
            reload: false,
            dash: false,
            shield: false,
            heal: false,
            speed: false,
            multiStun: false,
            reflect: false,
            pause: false,
            restart: false
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Solo agregar event listeners de teclado si no es móvil
        if (!this.isMobile) {
            document.addEventListener('keydown', (e) => this.handleKeyDown(e));
            document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        }

        if (this.isMobile) {
            this.initializeMobileControls();
            // Mostrar controles móviles
            document.getElementById('mobile-controls').style.display = 'block';
        }

        document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    handleKeyDown(e) {
        this.keys[e.key.toLowerCase()] = true;

        // Check for ability triggers
        this.abilities.stun = isKeyPressed(KEYS.STUN, this.keys);
        this.abilities.reload = isKeyPressed(KEYS.RELOAD, this.keys);
        this.abilities.dash = isKeyPressed(KEYS.DASH, this.keys);
        this.abilities.shield = isKeyPressed(KEYS.SHIELD, this.keys);
        this.abilities.heal = isKeyPressed(KEYS.HEAL, this.keys);
        this.abilities.speed = isKeyPressed(KEYS.SPEED, this.keys);
        this.abilities.multiStun = isKeyPressed(KEYS.MULTI_STUN, this.keys);
        this.abilities.reflect = isKeyPressed(KEYS.REFLECT, this.keys);
        if (isKeyPressed(KEYS.PAUSE, this.keys)) {
            e.preventDefault();
            this.abilities.pause = true;
        }
        this.abilities.restart = isKeyPressed(KEYS.RESTART, this.keys);
    }

    handleKeyUp(e) {
        this.keys[e.key.toLowerCase()] = false;
    }

    initializeMobileControls() {
        const joystickBase = document.getElementById('joystick-base');
        const joystickKnob = document.getElementById('joystick-knob');
        const fireButton = document.getElementById('fire-button');

        if (joystickBase && joystickKnob) {
            joystickBase.addEventListener('touchstart', (e) => this.handleJoystickStart(e, joystickBase, joystickKnob));
            joystickBase.addEventListener('touchmove', (e) => this.handleJoystickMove(e, joystickBase, joystickKnob));
            joystickBase.addEventListener('touchend', (e) => this.handleJoystickEnd(e, joystickKnob));
        }

        // Fire button
        if (fireButton) {
            fireButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.touchInput.firing = true;
            });
            fireButton.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.touchInput.firing = false;
            });
        }

        // Mobile ability buttons
        this.bindMobileButton('mobile-stun', () => this.abilities.stun = true);
        this.bindMobileButton('mobile-reload', () => this.abilities.reload = true);
        this.bindMobileButton('mobile-dash', () => this.abilities.dash = true);
        this.bindMobileButton('mobile-shield', () => this.abilities.shield = true);
        this.bindMobileButton('mobile-heal', () => this.abilities.heal = true);
        this.bindMobileButton('mobile-speed', () => this.abilities.speed = true);
        this.bindMobileButton('mobile-multiStun', () => this.abilities.multiStun = true);
        this.bindMobileButton('mobile-reflect', () => this.abilities.reflect = true);
    }

    bindMobileButton(id, callback) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                callback();
            });
        }
    }

    handleJoystickStart(e, joystickBase, joystickKnob) {
        e.preventDefault();
        this.isDragging = true;
        this.updateJoystickPosition(e.touches[0], joystickBase, joystickKnob);
    }

    handleJoystickMove(e, joystickBase, joystickKnob) {
        e.preventDefault();
        if (this.isDragging) {
            this.updateJoystickPosition(e.touches[0], joystickBase, joystickKnob);
        }
    }

    handleJoystickEnd(e, joystickKnob) {
        e.preventDefault();
        this.isDragging = false;
        this.touchInput = { x: 0, y: 0, active: false };
        joystickKnob.style.left = '50%';
        joystickKnob.style.top = '50%';
    }

    updateJoystickPosition(touch, joystickBase, joystickKnob) {
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

    update() {
        this.updateMovement();
        this.resetAbilities();
    }

    updateMovement() {
        let dx = 0, dy = 0;

        // Keyboard input
        if (isKeyPressed(KEYS.MOVE_UP, this.keys)) dy -= 1;
        if (isKeyPressed(KEYS.MOVE_DOWN, this.keys)) dy += 1;
        if (isKeyPressed(KEYS.MOVE_LEFT, this.keys)) dx -= 1;
        if (isKeyPressed(KEYS.MOVE_RIGHT, this.keys)) dx += 1;

        // Touch input
        if (this.touchInput.active) {
            dx = this.touchInput.x;
            dy = this.touchInput.y;
        }

        // Normalize diagonal movement
        const normalized = normalizeVector(dx, dy);
        this.movement = normalized;
    }

    resetAbilities() {
        // Reset one-shot abilities
        this.abilities.stun = false;
        this.abilities.reload = false;
        this.abilities.dash = false;
        this.abilities.shield = false;
        this.abilities.heal = false;
        this.abilities.speed = false;
        this.abilities.multiStun = false;
        this.abilities.reflect = false;
        this.abilities.pause = false;
        this.abilities.restart = false;
    }

    getDashDirection() {
        const dx = this.movement.x;
        let dy = this.movement.y;

        // Default to upward if no input
        if (dx === 0 && dy === 0) {
            dy = -1;
        }

        return normalizeVector(dx, dy);
    }
}
