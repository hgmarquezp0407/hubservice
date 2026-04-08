export interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    lastnames: string;
    role: string;
}

export interface Session {
    user: User;
}

export interface LoginResponse {
    success: boolean;
    error?: string;
}

export interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    ready: boolean;
    login: (username: string, password: string) => Promise<LoginResponse>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export interface UseTenantReturn {
    subdomain: string;
    urlbase: string;
    isAdmin: boolean;
    loading: boolean;
}

export interface FastAPIUserResponse {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

export interface FastAPIErrorResponse {
    detail: string;
}

export interface FastAPITokenResponse {
    message: string;
}

export interface FastAPILoginSuccessResponse {
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
    };
    message: string;
}
