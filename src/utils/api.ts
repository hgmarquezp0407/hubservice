// utils/api.ts

//  Tipos

export interface ApiError {
    message: string
    detail?: any
}

// Error de red — backend caído o sin conexión
export class NetworkError extends Error {
    constructor(message = "Sin conexión con el servidor. Verifica tu red e intenta nuevamente.") {
        super(message)
        this.name = "NetworkError"
    }
}

// Parser de errores del backend

/**
 * Extrae el mensaje de error de cualquier respuesta del backend.
 * Maneja:
 *   { detail: { title, message, ... } }
 *   { detail: "string" }
 *   { message: "string" }
 */
export function parseApiError(data: any): string {
    if (!data) return "Ocurrió un error inesperado."

    if (data.detail && typeof data.detail === "object") {
        return data.detail.message || data.detail.title || "Acceso denegado."
    }

    if (data.detail && typeof data.detail === "string") {
        return data.detail
    }

    if (data.message && typeof data.message === "string") {
        return data.message
    }

    return "Ocurrió un error inesperado."
}

// Cola de requests durante el refresh

let isRefreshing = false
let failedQueue: Array<{ resolve: () => void; reject: (e: any) => void }> = []

const processQueue = (error: any) => {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve())
    failedQueue = []
}

// apiFetch 

/**
 * Wrapper de fetch con:
 * - Detección de backend caído (NetworkError)
 * - Refresh automático de token en 401
 * - Cola de requests durante el refresh
 * - Parseo unificado de errores del backend
 */
export async function apiFetch(url: string, options?: RequestInit): Promise<any> {

    // 1. Request principal
    let response: Response

    try {
        response = await fetch(url, {
            headers:     { "Content-Type": "application/json" },
            credentials: "include",
            ...options,
        })
    } catch {
        // fetch lanza error solo cuando no hay conexión o el backend no responde
        throw new NetworkError()
    }

    // 2. Token expirado → refresh y reintentar
    if (response.status === 401) {

        if (isRefreshing) {
            // Encolar mientras ya hay un refresh en curso
            await new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
            return apiFetch(url, options)
        }

        isRefreshing = true

        try {
            let refresh: Response

            try {
                refresh = await fetch("/api/auth/refresh", {
                    method:      "POST",
                    credentials: "include",
                })
            } catch {
                // Backend caído durante el refresh — no redirigir, lanzar NetworkError
                const networkErr = new NetworkError()
                processQueue(networkErr)
                throw networkErr
            }

            if (refresh.ok) {
                processQueue(null)
                return apiFetch(url, options)
            }

            // Refresh falló por sesión expirada — redirigir al login
            const sessionErr = new Error("Sesión expirada. Por favor inicia sesión nuevamente.")
            processQueue(sessionErr)
            window.location.href = "/"
            throw sessionErr

        } finally {
            isRefreshing = false
        }
    }

    // 3. Parsear respuesta
    let data: any

    try {
        data = await response.json()
    } catch {
        // Respuesta sin body JSON (ej: 204 No Content)
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        return null
    }

    if (!response.ok) {
        throw new Error(parseApiError(data))
    }

    return data
}


/*
 * Igual que apiFetch pero retorna la Response cruda sin parsear.
 * Necesario para descargas de archivos binarios (Excel, PDF, etc.)
 * Reutiliza la misma lógica de refresh de token.
*/
export async function apiFetchRaw(url: string, options?: RequestInit): Promise<Response> {

    const BASE_URL = process.env.NEXT_PUBLIC_API ?? ""
    const fullUrl  = url.startsWith("http") ? url : `${BASE_URL}/admin${url}`

    // 1. Request principal
    let response: Response

    // Si el body es FormData, NO setear Content-Type (el browser lo pone con boundary)
    const isFormData = options?.body instanceof FormData
    const headers: Record<string, string> = isFormData
        ? {}
        : { "Content-Type": "application/json" }

    try {
        response = await fetch(fullUrl, {
            credentials: "include",
            ...options,
            headers: {
                ...headers,
                ...(options?.headers ?? {}),
            },
        })
    } catch {
        throw new NetworkError()
    }

    // 2. Token expirado → refresh y reintentar
    if (response.status === 401) {

        if (isRefreshing) {
            await new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            })
            return apiFetchRaw(url, options)
        }

        isRefreshing = true

        try {
            let refresh: Response

            try {
                refresh = await fetch("/api/auth/refresh", {
                    method:      "POST",
                    credentials: "include",
                })
            } catch {
                const networkErr = new NetworkError()
                processQueue(networkErr)
                throw networkErr
            }

            if (refresh.ok) {
                processQueue(null)
                return apiFetchRaw(url, options)
            }

            const sessionErr = new Error("Sesión expirada. Por favor inicia sesión nuevamente.")
            processQueue(sessionErr)
            window.location.href = "/"
            throw sessionErr

        } finally {
            isRefreshing = false
        }
    }

    // 3. Error HTTP — leer body para mensaje descriptivo
    if (!response.ok) {
        try {
            const data = await response.json()
            throw new Error(parseApiError(data))
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                throw new Error(`Error ${response.status}: ${response.statusText}`)
            }
            throw e
        }
    }

    // 4. Retornar Response cruda para que el caller haga .blob()
    return response
}