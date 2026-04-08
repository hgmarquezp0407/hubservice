"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "react-toastify";
import type { User, AuthContextType, LoginResponse } from "@/app/interfaces/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getHomeByRole(role: string): string {
    if (role === "empresa")      return "/company/home";
    if (role === "especialista") return "/specialist/marketplace";
    return "/admin/home";
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser]         = useState<User | null>(null);
    const [loading, setLoading]   = useState<boolean>(false);
    const [ready, setReady]       = useState<boolean>(false);
    const refreshTimer            = useRef<ReturnType<typeof setInterval> | null>(null);
    const expireMs                = useRef<number>(0);

    const clearRefreshTimer = () => {
        if (refreshTimer.current) {
            clearInterval(refreshTimer.current);
            refreshTimer.current = null;
        }
    };

    const redirectToLogin = async () => {
        clearRefreshTimer();
        setUser(null);
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch {}
        window.location.href = "/";
    };

    const refreshToken = async (): Promise<boolean> => {
        try {
            const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
            if (!res.ok) { redirectToLogin(); return false; }
            const data = await res.json();
            if (data.expires_in) expireMs.current = data.expires_in * 1000;
            return true;
        } catch {
            clearRefreshTimer();
            toast.warn("Sin conexión con el servidor. Verifica tu red.", { autoClose: false, toastId: "network" });
            return false;
        }
    };

    const startRefreshTimer = () => {
        if (!expireMs.current || expireMs.current <= 0) return;
        clearRefreshTimer();
        const interval = expireMs.current * 0.8;
        refreshTimer.current = setInterval(async () => {
            const ok = await refreshToken();
            if (!ok) clearRefreshTimer();
        }, interval);
    };

    const fetchUser = async (): Promise<void> => {
        setLoading(true);
        try {
            const response = await fetch("/api/auth/me", {
                method: "GET", credentials: "include", headers: { "Cache-Control": "no-cache" },
            });

            if (response.status === 503) {
                setUser(null); clearRefreshTimer();
                toast.warn("Sin conexión con el servidor. Verifica tu red.", { autoClose: false, toastId: "network" });
                return;
            }

            if (response.ok) {
                const data = await response.json();
                if (data.expires_in) expireMs.current = data.expires_in * 1000;
                setUser(data);
                startRefreshTimer();
            } else {
                setUser(null); clearRefreshTimer();
            }
        } catch {
            setUser(null); clearRefreshTimer();
            toast.warn("Sin conexión con el servidor. Verifica tu red.", { autoClose: false, toastId: "network" });
        } finally {
            setLoading(false);
            setReady(true);
        }
    };

    useEffect(() => {
        fetchUser();
        return () => clearRefreshTimer();
    }, []);

    const login = async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.expires_in) expireMs.current = data.expires_in * 1000;
                setUser(data.user);
                startRefreshTimer();
                window.location.href = getHomeByRole(data.user.role);
                return { success: true };
            }

            return { success: false, error: data.detail || data.message || "Login fallido" };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : "Error de red" };
        }
    };

    const logout = async (): Promise<void> => {
        clearRefreshTimer();
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch {}
        finally {
            setUser(null);
            if (typeof window !== "undefined") {
                localStorage.removeItem("user");
                window.location.href = "/";
            }
        }
    };

    const refreshUser = async (): Promise<void> => { await fetchUser(); };

    const contextValue: AuthContextType = {
        user,
        session: user ? { user } : null,
        loading,
        ready,
        login,
        logout,
        refreshUser,
    };

    return React.createElement(AuthContext.Provider, { value: contextValue }, children);
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}












































// "use client";

// import React, { createContext, useContext, useEffect, useRef, useState } from "react";
// import type { ReactNode } from "react";
// import { toast } from "react-toastify";
// import type { User, AuthContextType, LoginResponse } from "@/app/interfaces/auth";

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser]         = useState<User | null>(null);
//     const [loading, setLoading]   = useState<boolean>(false);
//     const [ready, setReady]       = useState<boolean>(false); // true cuando fetchUser terminó al menos una vez
//     const refreshTimer            = useRef<ReturnType<typeof setInterval> | null>(null);
//     const expireMs                = useRef<number>(0);

//     const clearRefreshTimer = () => {
//         if (refreshTimer.current) {
//             clearInterval(refreshTimer.current);
//             refreshTimer.current = null;
//         }
//     };

//     const redirectToLogin = async () => {
//         clearRefreshTimer();
//         setUser(null);
//         try {
//             await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
//         } catch {}
//         window.location.href = "/";
//     };

//     const refreshToken = async (): Promise<boolean> => {
//         try {
//             const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
//             if (!res.ok) { redirectToLogin(); return false; }
//             const data = await res.json();
//             if (data.expires_in) expireMs.current = data.expires_in * 1000;
//             return true;
//         } catch {
//             clearRefreshTimer();
//             toast.warn("Sin conexión con el servidor. Verifica tu red.", { autoClose: false, toastId: "network" });
//             return false;
//         }
//     };

//     const startRefreshTimer = () => {
//         if (!expireMs.current || expireMs.current <= 0) return;
//         clearRefreshTimer();
//         const interval = expireMs.current * 0.8;
//         refreshTimer.current = setInterval(async () => {
//             const ok = await refreshToken();
//             if (!ok) clearRefreshTimer();
//         }, interval);
//     };

//     const fetchUser = async (): Promise<void> => {
//         setLoading(true);
//         try {
//             const response = await fetch("/api/auth/me", {
//                 method: "GET", credentials: "include", headers: { "Cache-Control": "no-cache" },
//             });

//             if (response.status === 503) {
//                 setUser(null); clearRefreshTimer();
//                 toast.warn("Sin conexión con el servidor. Verifica tu red.", { autoClose: false, toastId: "network" });
//                 return;
//             }

//             if (response.ok) {
//                 const data = await response.json();
//                 if (data.expires_in) expireMs.current = data.expires_in * 1000;
//                 setUser(data);
//                 startRefreshTimer();
//             } else {
//                 setUser(null); clearRefreshTimer();
//             }
//         } catch {
//             setUser(null); clearRefreshTimer();
//             toast.warn("Sin conexión con el servidor. Verifica tu red.", { autoClose: false, toastId: "network" });
//         } finally {
//             setLoading(false);
//             setReady(true);
//         }
//     };

//     useEffect(() => {
//         fetchUser();
//         return () => clearRefreshTimer();
//     }, []);

//     const login = async (username: string, password: string): Promise<LoginResponse> => {
//         try {
//             const response = await fetch("/api/auth/login", {
//                 method: "POST", credentials: "include",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ username, password }),
//             });

//             const data = await response.json();

//             if (response.ok) {
//                 if (data.expires_in) expireMs.current = data.expires_in * 1000;
//                 setUser(data.user);
//                 startRefreshTimer();
//                 return { success: true };
//             }

//             return { success: false, error: data.detail || data.message || "Login fallido" };
//         } catch (error) {
//             return { success: false, error: error instanceof Error ? error.message : "Error de red" };
//         }
//     };

//     const logout = async (): Promise<void> => {
//         clearRefreshTimer();
//         try {
//             await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
//         } catch {}
//         finally {
//             setUser(null);
//             if (typeof window !== "undefined") {
//                 localStorage.removeItem("user");
//                 window.location.href = "/";
//             }
//         }
//     };

//     const refreshUser = async (): Promise<void> => { await fetchUser(); };

//     const contextValue: AuthContextType = {
//         user,
//         session: user ? { user } : null,
//         loading,
//         ready,
//         login,
//         logout,
//         refreshUser,
//     };

//     return React.createElement(AuthContext.Provider, { value: contextValue }, children);
// }

// export function useAuth(): AuthContextType {
//     const context = useContext(AuthContext);
//     if (!context) throw new Error("useAuth must be used within AuthProvider");
//     return context;
// }