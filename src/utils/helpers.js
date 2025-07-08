// Utility functions
export function getDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

export function normalizeVector(x, y) {
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude === 0) return { x: 0, y: 0 };
    return { x: x / magnitude, y: y / magnitude };
}

export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

export function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

export function isKeyPressed(key, pressedKeys) {
    return Array.isArray(key) ? key.some(k => pressedKeys[k.toLowerCase()]) : pressedKeys[key.toLowerCase()];
}
