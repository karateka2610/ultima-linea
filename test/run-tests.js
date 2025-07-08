import { GAME_CONFIG } from '../src/utils/constants.js';
import { Player } from '../src/entities/Player.js';
import { Enemy } from '../src/entities/Enemy.js';
import { getDistance } from '../src/utils/helpers.js';

class GameTester {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    assert(condition, message) {
        if (condition) {
            this.passed++;
            console.log(`✅ ${message}`);
        } else {
            this.failed++;
            console.log(`❌ ${message}`);
        }
    }

    runTests() {
        console.log('\n🧪 INICIANDO TESTS DE ÚLTIMA LÍNEA');
        console.log('==================================\n');

        this.testConstants();
        this.testPlayer();
        this.testEnemy();
        this.testHelpers();

        console.log('\n📊 RESULTADOS:');
        console.log(`✅ Pasados: ${this.passed}`);
        console.log(`❌ Fallidos: ${this.failed}`);
        console.log(`📈 Total: ${this.passed + this.failed}`);
        
        if (this.failed === 0) {
            console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
        } else {
            console.log('\n⚠️  Algunos tests fallaron');
        }

        return this.failed === 0;
    }

    testConstants() {
        console.log('🔧 Testing Constants...');
        
        this.assert(
            GAME_CONFIG !== undefined, 
            'GAME_CONFIG está definido'
        );
        
        this.assert(
            GAME_CONFIG.PLAYER.SIZE > 0, 
            'Player size es válido'
        );
        
        this.assert(
            GAME_CONFIG.ENEMIES.SIZE > 0, 
            'Enemy size es válido'
        );
        
        this.assert(
            Object.keys(GAME_CONFIG.ENEMY_TYPES).length === 3, 
            'Hay 3 tipos de enemigos definidos'
        );

        this.assert(
            GAME_CONFIG.ABILITIES.STUN.COOLDOWN > 0,
            'Cooldown de Stun es válido'
        );
    }

    testPlayer() {
        console.log('\n🎮 Testing Player...');
        
        const player = new Player(100, 100);
        
        this.assert(
            player.x === 100 && player.y === 100, 
            'Player se inicializa en la posición correcta'
        );
        
        this.assert(
            player.energy === GAME_CONFIG.PLAYER.MAX_ENERGY, 
            'Player inicia con energía máxima'
        );
        
        this.assert(
            typeof player.getHitboxRadius === 'function', 
            'Player tiene método getHitboxRadius'
        );

        this.assert(
            player.getHitboxRadius() > 0,
            'Hitbox radius es válido'
        );

        // Test energy drain
        const initialEnergy = player.energy;
        player.drainEnergy();
        this.assert(
            player.energy < initialEnergy,
            'La energía se drena correctamente'
        );
    }

    testEnemy() {
        console.log('\n👾 Testing Enemy...');
        
        const enemy = new Enemy(50, 50, 'basic');
        
        this.assert(
            enemy.type === 'basic', 
            'Enemy type se asigna correctamente'
        );
        
        this.assert(
            enemy.color === GAME_CONFIG.ENEMY_TYPES.BASIC.COLOR, 
            'Enemy color es correcto para tipo basic'
        );
        
        this.assert(
            typeof enemy.getHitboxRadius === 'function', 
            'Enemy tiene método getHitboxRadius'
        );

        this.assert(
            enemy.getHitboxRadius() > 0,
            'Enemy hitbox radius es válido'
        );

        // Test stun
        enemy.stun(Date.now());
        this.assert(
            enemy.stunned === true,
            'Enemy se aturde correctamente'
        );

        // Test enemy creation
        const shooterEnemy = new Enemy(0, 0, 'shooter');
        this.assert(
            shooterEnemy.shootRate > 0,
            'Shooter enemy tiene shootRate válido'
        );
    }

    testHelpers() {
        console.log('\n🛠️  Testing Helpers...');
        
        const distance = getDistance(0, 0, 3, 4);
        this.assert(
            distance === 5, 
            'getDistance calcula correctamente (3-4-5 triangle)'
        );
        
        const distance2 = getDistance(10, 10, 10, 10);
        this.assert(
            distance2 === 0, 
            'getDistance retorna 0 para puntos iguales'
        );

        this.assert(
            getDistance(0, 0, 1, 1) > 0,
            'getDistance retorna valor positivo'
        );
    }
}

// Ejecutar tests
const tester = new GameTester();
const success = tester.runTests();

// Exit code para CI/CD
process.exit(success ? 0 : 1);
