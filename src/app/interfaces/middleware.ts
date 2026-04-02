export interface ValidationCacheEntry {
    valid: boolean;
    timestamp: number;
    tradeName?: string;
}

export interface ValidationResponse {
    tradeName?: string;
    [key: string]: any;
}

export interface MiddlewareConfig {
    matcher?: string | string[];
}