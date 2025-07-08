// Gestión de iconos SVG para las habilidades
export class IconManager {
    constructor() {
        this.iconCache = new Map();
        this.icons = {
            stun: {
                url: 'https://game-icons.net/1x1/delapouite/stun-grenade.html',
                svgUrl: 'https://game-icons.net/icons/delapouite/stun-grenade.svg',
                color: '#ffff00'
            },
            dash: {
                url: 'https://game-icons.net/1x1/lorc/fire-dash.html',
                svgUrl: 'https://game-icons.net/icons/lorc/fire-dash.svg',
                color: '#ff6600'
            },
            shield: {
                url: 'https://game-icons.net/1x1/sbed/shield.html',
                svgUrl: 'https://game-icons.net/icons/sbed/shield.svg',
                color: '#00ccff'
            },
            reload: {
                url: 'https://game-icons.net/1x1/delapouite/reload-gun-barrel.html',
                svgUrl: 'https://game-icons.net/icons/delapouite/reload-gun-barrel.svg',
                color: '#666666'
            },
            heal: {
                url: 'https://game-icons.net/1x1/delapouite/healing.html',
                svgUrl: 'https://game-icons.net/icons/delapouite/healing.svg',
                color: '#00ff66',
                displayName: 'SuperRecarga'
            },
            speed: {
                url: 'https://game-icons.net/1x1/lorc/sprint.html',
                svgUrl: 'https://game-icons.net/icons/lorc/sprint.svg',
                color: '#44ff44'
            },
            energyBoost: {
                url: 'https://game-icons.net/1x1/lorc/energise.html',
                svgUrl: 'https://game-icons.net/icons/lorc/energise.svg',
                color: '#ffcc00'
            },
            multiStun: {
                url: 'https://game-icons.net/1x1/delapouite/multiple-targets.html',
                svgUrl: 'https://game-icons.net/icons/delapouite/multiple-targets.svg',
                color: '#ff9900'
            },
            reflect: {
                url: 'https://game-icons.net/1x1/lorc/shield-reflect.html',
                svgUrl: 'https://game-icons.net/icons/lorc/shield-reflect.svg',
                color: '#cc66ff'
            }
        };
    }

    /**
     * Obtiene el SVG de un icono, ya sea desde cache o generando uno personalizado
     * @param {string} abilityName - Nombre de la habilidad
     * @returns {Promise<string>} - SVG como string
     */
    async getIcon(abilityName) {
        if (this.iconCache.has(abilityName)) {
            return this.iconCache.get(abilityName);
        }

        const iconData = this.icons[abilityName];
        if (!iconData) {
            return this.getDefaultIcon(abilityName);
        }

        // Por ahora usar iconos personalizados directamente
        // En el futuro se puede implementar la carga desde game-icons.net
        const customIcon = this.getDefaultIcon(abilityName);
        this.iconCache.set(abilityName, customIcon);
        return customIcon;
    }

    /**
     * Personaliza un SVG con color y tamaño específicos
     * @param {string} svgText - SVG original
     * @param {string} color - Color a aplicar
     * @returns {string} - SVG personalizado
     */
    customizeSVG(svgText, color) {
        // Asegurar que el SVG tenga las dimensiones correctas
        svgText = svgText.replace(/<svg[^>]*>/, (match) => {
            return match.replace(/width="[^"]*"/, 'width="48"')
                .replace(/height="[^"]*"/, 'height="48"')
                .replace(/viewBox="[^"]*"/, 'viewBox="0 0 512 512"');
        });

        // Aplicar color personalizado
        svgText = svgText.replace(/fill="[^"]*"/g, `fill="${color}"`);
        svgText = svgText.replace(/stroke="[^"]*"/g, `stroke="${color}"`);

        // Si no tiene atributos de color, añadirlos
        if (!svgText.includes('fill=') && !svgText.includes('stroke=')) {
            svgText = svgText.replace(/<path/g, `<path fill="${color}"`);
        }

        return svgText;
    }

    /**
     * Genera un icono por defecto si no se puede cargar el SVG
     * @param {string} abilityName - Nombre de la habilidad
     * @returns {string} - SVG por defecto
     */
    getDefaultIcon(abilityName) {
        const iconData = this.icons[abilityName];
        const color = iconData ? iconData.color : '#ffffff';

        // Iconos SVG personalizados para cada habilidad
        const customIcons = {
            stun: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="${color}" stroke-width="2"/>
                    <path d="M16 16 L32 32 M32 16 L16 32" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="24" cy="24" r="4" fill="${color}"/>
                </svg>
            `,
            dash: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 24 L40 24" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
                    <path d="M32 16 L40 24 L32 32" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="20" r="2" fill="${color}" opacity="0.6"/>
                    <circle cx="16" cy="28" r="2" fill="${color}" opacity="0.4"/>
                    <circle cx="20" cy="18" r="1.5" fill="${color}" opacity="0.3"/>
                </svg>
            `,
            shield: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 6 L12 12 L12 24 C12 32 18 38 24 42 C30 38 36 32 36 24 L36 12 Z" 
                          fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
                    <path d="M24 6 L16 10 L16 22 C16 28 20 32 24 36 C28 32 32 28 32 22 L32 10 Z" 
                          fill="${color}" opacity="0.3"/>
                </svg>
            `,
            reload: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 24 C12 16 18 10 26 10 C32 10 36 14 38 18" 
                          fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
                    <path d="M36 24 C36 32 30 38 22 38 C16 38 12 34 10 30" 
                          fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
                    <path d="M34 14 L38 18 L34 22" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 34 L10 30 L14 26" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `,
            heal: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="18" fill="none" stroke="${color}" stroke-width="2"/>
                    <path d="M24 12 L24 36 M12 24 L36 24" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
                    <circle cx="24" cy="24" r="6" fill="${color}" opacity="0.3"/>
                </svg>
            `,
            speed: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 24 L18 16 L12 24 L18 32 Z" fill="${color}"/>
                    <path d="M16 24 L28 16 L22 24 L28 32 Z" fill="${color}" opacity="0.7"/>
                    <path d="M26 24 L38 16 L32 24 L38 32 Z" fill="${color}" opacity="0.4"/>
                </svg>
            `,
            energyBoost: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 6 L28 18 L40 18 L30 26 L34 38 L24 30 L14 38 L18 26 L8 18 L20 18 Z" 
                          fill="${color}" stroke="${color}" stroke-width="1"/>
                    <circle cx="24" cy="24" r="8" fill="none" stroke="${color}" stroke-width="2"/>
                </svg>
            `,
            multiStun: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="12" fill="none" stroke="${color}" stroke-width="2"/>
                    <circle cx="30" cy="30" r="12" fill="none" stroke="${color}" stroke-width="2"/>
                    <path d="M12 12 L24 24 M24 12 L12 24" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                    <path d="M24 24 L36 36 M36 24 L24 36" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `,
            reflect: `
                <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 6 L12 12 L12 24 C12 32 18 38 24 42 C30 38 36 32 36 24 L36 12 Z" 
                          fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
                    <path d="M16 20 L24 28 L32 20" stroke="${color}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="20" cy="16" r="2" fill="${color}"/>
                    <circle cx="28" cy="16" r="2" fill="${color}"/>
                </svg>
            `
        };

        return customIcons[abilityName] || `
            <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" fill="none" stroke="${color}" stroke-width="2"/>
                <text x="24" y="28" text-anchor="middle" fill="${color}" font-size="20" font-family="Arial">
                    ?
                </text>
            </svg>
        `;
    }

    /**
     * Obtiene un símbolo por defecto para cada habilidad
     * @param {string} abilityName - Nombre de la habilidad
     * @returns {string} - Símbolo Unicode
     */
    getDefaultSymbol(abilityName) {
        const symbols = {
            stun: '⚡',
            dash: '💨',
            shield: '🛡️',
            reload: '🔄',
            heal: '💚',
            speed: '⚡',
            energyBoost: '⚡',
            multiStun: '💥',
            reflect: '🔄'
        };
        return symbols[abilityName] || '?';
    }

    /**
     * Crea un elemento imagen con el icono SVG
     * @param {string} abilityName - Nombre de la habilidad
     * @returns {Promise<HTMLElement>} - Elemento div con el SVG
     */
    async createIconElement(abilityName) {
        const svgText = await this.getIcon(abilityName);
        const iconDiv = document.createElement('div');
        iconDiv.className = 'ability-icon';
        iconDiv.innerHTML = svgText;
        return iconDiv;
    }

    /**
     * Preload todos los iconos para mejor rendimiento
     * @returns {Promise<void>}
     */
    async preloadAllIcons() {
        try {
            // Generar todos los iconos de forma síncrona ya que son personalizados
            Object.keys(this.icons).forEach(abilityName => {
                const icon = this.getDefaultIcon(abilityName);
                this.iconCache.set(abilityName, icon);
            });

            console.log('All ability icons preloaded successfully');
        } catch (error) {
            console.warn('Some icons failed to preload:', error);
        }
    }
}

// Instancia global del gestor de iconos
export const iconManager = new IconManager();
