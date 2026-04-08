
// FUNCIONES DE UTILIDAD GENERAL

export const onlyNumber = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    const input = e.currentTarget;

    // Permitir teclas de control: backspace, delete, flechas, tab, etc.
    if (
        e.ctrlKey || e.metaKey ||
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(char)
    ) {
        return;
    }

    // Solo permitir números
    if (!/^[0-9.]$/.test(char)) {
        e.preventDefault();
        return;
    }

    // Evitar múltiples puntos
    if (char === '.' && input.value.includes('.')) {
        e.preventDefault();
    }
};

// Validar email
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar DNI peruano (básico)
export const isValidDNI = (dni: string): boolean => {
    return /^\d{8}$/.test(dni);
};

// Debounce para búsquedas
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};

// Convertir fecha a formato local
export const formatDateSlash = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

// Convertir fecha y hora a formato local
export const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};


export const formatTo12HourSimple = (timeString?: string | null): string => {
    if (!timeString) return "";

    const parts = timeString.split(':');
    if (parts.length < 2) return "";

    const [hourStr, minuteStr] = parts;
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute)) return ""; // valida que sean números

    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // convierte 0 => 12

    return `${hour}:${String(minute).padStart(2, '0')} ${ampm}`;
};


export const formatTo12Hour = (timeString: string): string => {
    const [hourStr, minuteStr, secondStr] = timeString.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const second = parseInt(secondStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // convierte 0 => 12
    return `${hour}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} ${ampm}`;
};


export const formatDateTime12Hour = (dateString: string): string => {
    const date = new Date(dateString);

    // Día, mes y año
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0-11
    const year = date.getFullYear();

    // Hora en formato 12h
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // si hours es 0, lo ponemos como 12
    const hoursStr = String(hours).padStart(2, '0');

    return `${day}-${month}-${year} ${hoursStr}:${minutes} ${ampm}`;
}
