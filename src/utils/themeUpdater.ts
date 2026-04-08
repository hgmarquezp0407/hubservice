export const updateThemeColors = (colorRgb: string) => {
    const root = document.documentElement;
    
    // Aplicar el color primario a las variables CSS
    if (colorRgb) {
        root.style.setProperty('--primary-rgb', colorRgb);
        root.style.setProperty('--primary', `rgb(${colorRgb})`);
        
        // Generar variaciones del color
        const [r, g, b] = colorRgb.split(',').map(num => parseInt(num.trim()));
        
        // Colores más claros
        root.style.setProperty('--primary-05', `rgba(${colorRgb}, 0.05)`);
        root.style.setProperty('--primary-1', `rgba(${colorRgb}, 0.1)`);
        root.style.setProperty('--primary-2', `rgba(${colorRgb}, 0.2)`);
        root.style.setProperty('--primary-3', `rgba(${colorRgb}, 0.3)`);
        
        // Colores hover/active
        const darkerR = Math.max(0, r - 20);
        const darkerG = Math.max(0, g - 20);
        const darkerB = Math.max(0, b - 20);
        root.style.setProperty('--primary-hover', `rgb(${darkerR}, ${darkerG}, ${darkerB})`);
    }
};

export const updateBackgroundColors = (bodyBg: string, bodyBg2: string) => {
    const root = document.documentElement;
    
    if (bodyBg) {
        root.style.setProperty('--body-bg', `rgb(${bodyBg})`);
        root.style.setProperty('--body-bg-rgb', bodyBg);
    }
    
    if (bodyBg2) {
        root.style.setProperty('--body-bg2', `rgb(${bodyBg2})`);
        root.style.setProperty('--body-bg2-rgb', bodyBg2);
    }
};