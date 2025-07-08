// Game constants and configuration
export const GAME_CONFIG = {
    CANVAS: {
        WIDTH: 400,
        HEIGHT: 400,
        MOBILE_MAX_SIZE: 0.9
    },

    PLAYER: {
        SIZE: 15,
        SPEED: 3,
        MAX_ENERGY: 100,
        ENERGY_DRAIN_RATE: 0.05,
        COLOR: '#00ff00'
    },

    ENEMIES: {
        INITIAL_SPAWN_RATE: 1000,
        INITIAL_SPEED: 1,
        SIZE: 12,
        MIN_SPAWN_RATE: 300,
        MAX_SPEED: 3,
        SPEED_INCREMENT: 0.2,
        SPAWN_RATE_DECREMENT: 50
    },

    WAVE: {
        INITIAL_ENEMY_COUNT: 5,
        ENEMY_COUNT_INCREMENT: 2,
        MAX_ENEMIES: 20,
        DURATION: 30000
    },

    ABILITIES: {
        STUN: {
            COOLDOWN: 3000,
            DURATION: 2000,
            ENERGY_COST: 20
        },
        RELOAD: {
            COOLDOWN: 5000,
            ENERGY_RESTORE: 40
        },
        DASH: {
            COOLDOWN: 4000,
            DURATION: 200,
            ENERGY_COST: 15,
            SPEED_MULTIPLIER: 3
        },
        SHIELD: {
            COOLDOWN: 8000,
            DURATION: 3000,
            ENERGY_COST: 25
        }
    },

    POWERUPS: {
        SPAWN_RATE: 8000,
        SIZE: 16,
        COLOR: '#ffff00',
        ENERGY_BONUS: 30,
        COLLECTION_RADIUS_MULTIPLIER: 1.2
    },

    PROJECTILES: {
        SPEED: 2,
        SIZE: 4,
        COLOR: '#00aaff'
    },

    GRID_SIZE: 20,

    ENEMY_TYPES: {
        BASIC: {
            COLOR: '#ff4444',
            SPEED_MULTIPLIER: 1,
            SIZE_MULTIPLIER: 1
        },
        FAST: {
            COLOR: '#44ff44',
            SPEED_MULTIPLIER: 1.8,
            SIZE_MULTIPLIER: 0.8
        },
        SHOOTER: {
            COLOR: '#4444ff',
            SPEED_MULTIPLIER: 0.6,
            SIZE_MULTIPLIER: 1.2,
            SHOOT_RATE: 2000,
            SHOOT_RANGE: 150
        }
    }
};

export const KEYS = {
    MOVE_UP: ['w', 'arrowup'],
    MOVE_DOWN: ['s', 'arrowdown'],
    MOVE_LEFT: ['a', 'arrowleft'],
    MOVE_RIGHT: ['d', 'arrowright'],
    STUN: ['q'],
    RELOAD: ['r'], // Recarga ahora en R
    DASH: ['shift', 'f'], // Shift o F para dash
    SHIELD: ['e'], // Escudo en E
    HEAL: ['h'],
    SPEED: ['v'],
    MULTI_STUN: ['z'],
    REFLECT: ['x'],
    PAUSE: ['p', 'escape'], // Pausa en P o Escape
    RESTART: ['enter'] // Reinicio en Enter
};
