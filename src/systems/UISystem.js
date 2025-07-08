export class UISystem {
    constructor() {
        this.startTime = 0;
        this.gameOverElement = document.getElementById('game-over');
    }

    updateGameUI(currentWave, enemies, startTime) {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

        document.getElementById('wave').textContent = currentWave;
        document.getElementById('timer').textContent = elapsedTime;
        document.getElementById('enemies').textContent = enemies.length;
    }

    updateEnergyUI(energy) {
        document.getElementById('energy').textContent = Math.floor(energy);
    }

    showGameOver(startTime, currentWave) {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

        document.getElementById('final-time').textContent = elapsedTime;
        document.getElementById('final-waves').textContent = currentWave - 1;
        this.gameOverElement.style.display = 'block';
    }

    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }

    adjustCanvasSize(canvas) {
        if (this.detectMobile()) {
            const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.6, 400);
            canvas.width = maxSize;
            canvas.height = maxSize;
            canvas.style.width = maxSize + 'px';
            canvas.style.height = maxSize + 'px';
        }
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    bindButtons(callbacks) {
        const bindButton = (id, callback) => {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener('click', callback);
            }
        };

        bindButton('stun-btn', callbacks.stun);
        bindButton('reload-btn', callbacks.reload);
        bindButton('dash-btn', callbacks.dash);
        bindButton('shield-btn', callbacks.shield);
        bindButton('heal-btn', callbacks.heal);
        bindButton('speed-btn', callbacks.speed);
        bindButton('restart-btn', callbacks.restart);
        document.getElementById('restart-btn').addEventListener('click', callbacks.restart);
    }
}
