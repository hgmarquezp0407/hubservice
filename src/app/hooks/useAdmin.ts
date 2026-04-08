'use client';
import { useMemo } from "react";

export const useAdmin = () => {
    const protocol = process.env.NEXT_PUBLIC_PROTOCOL || 
                    (process.env.NODE_ENV === "production" ? "https" : "http");

    const urlbase = useMemo(() => {
        const apiPath = process.env.NEXT_PUBLIC_TENANT_API;
        if (!apiPath) {
            console.error("❌ NEXT_PUBLIC_TENANT_API no está definido en .env");
            return "";
        }
        return `${protocol}://${apiPath}`;
    }, [protocol]);

    const isReady = useMemo(() => {
        return urlbase && urlbase.includes('://');
    }, [urlbase]);

    return { protocol, urlbase, isReady };
};