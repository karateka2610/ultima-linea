#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = dirname(__dirname);

class DevServer {
    constructor() {
        this.processes = [];
        this.isShuttingDown = false;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            info: '🔵',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[type] || '🔵';
        
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    async checkDependencies() {
        this.log('Verificando dependencias...');
        
        if (!fs.existsSync(join(projectRoot, 'node_modules'))) {
            this.log('node_modules no encontrado. Instalando dependencias...', 'warning');
            await this.runCommand('npm', ['install']);
        }
        
        this.log('Dependencias verificadas', 'success');
    }

    runCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            const process = spawn(command, args, {
                stdio: 'inherit',
                shell: true,
                cwd: projectRoot,
                ...options
            });

            this.processes.push(process);

            process.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Command failed with code ${code}`));
                }
            });

            process.on('error', reject);
        });
    }

    async runTests() {
        this.log('Ejecutando tests...');
        try {
            await this.runCommand('npm', ['test']);
            this.log('Tests completados exitosamente', 'success');
            return true;
        } catch (error) {
            this.log('Tests fallaron', 'error');
            return false;
        }
    }

    async runLinter() {
        this.log('Ejecutando linter...');
        try {
            await this.runCommand('npm', ['run', 'lint']);
            this.log('Linting completado', 'success');
            return true;
        } catch (error) {
            this.log('Errores de linting encontrados', 'warning');
            return false;
        }
    }

    async startDevServer() {
        this.log('Iniciando servidor de desarrollo...');
        
        const serverProcess = spawn('npm', ['run', 'dev'], {
            stdio: 'inherit',
            shell: true,
            cwd: projectRoot
        });

        this.processes.push(serverProcess);

        serverProcess.on('error', (error) => {
            this.log(`Error en servidor: ${error.message}`, 'error');
        });

        // Dar tiempo al servidor para iniciar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        this.log('Servidor de desarrollo iniciado en http://localhost:9000', 'success');
        this.log('Panel de estadísticas: http://localhost:9000/api/stats', 'info');
        this.log('Configuración: http://localhost:9000/api/config', 'info');
    }

    setupGracefulShutdown() {
        const shutdown = () => {
            if (this.isShuttingDown) return;
            this.isShuttingDown = true;
            
            this.log('Cerrando procesos...');
            this.processes.forEach(process => {
                if (!process.killed) {
                    process.kill('SIGTERM');
                }
            });
            
            setTimeout(() => {
                this.log('Desarrollo terminado', 'success');
                process.exit(0);
            }, 1000);
        };

        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }

    async start() {
        console.log('\n🎮 ÚLTIMA LÍNEA - SERVIDOR DE DESARROLLO');
        console.log('==========================================\n');

        this.setupGracefulShutdown();

        try {
            await this.checkDependencies();
            
            // Ejecutar tests primero
            const testsPass = await this.runTests();
            if (!testsPass) {
                this.log('Los tests fallaron. ¿Continuar? (Ctrl+C para cancelar)', 'warning');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }

            // Ejecutar linter
            await this.runLinter();

            // Iniciar servidor
            await this.startDevServer();

            // Mantener el proceso vivo
            this.log('Presiona Ctrl+C para detener el servidor', 'info');
            
        } catch (error) {
            this.log(`Error durante el inicio: ${error.message}`, 'error');
            process.exit(1);
        }
    }
}

// Ejecutar servidor de desarrollo
const devServer = new DevServer();
devServer.start().catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
});
