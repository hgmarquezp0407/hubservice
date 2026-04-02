// app/api/auth/logout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

interface LogoutResponse {
    message: string;
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<LogoutResponse>> {
    try {
        const cookieStore = await cookies();
        const apiUrl = process.env.INTERNAL_API || process.env.NEXT_PUBLIC_API;
        const logoutUrl   = `${apiUrl}/admin/auth/logout`;
        const token       = cookieStore.get("access_token")?.value;

        const response = NextResponse.json<LogoutResponse>({
            message: "Sesión cerrada exitosamente",
        });

        if (token) {
            try {
                // 1. Notificar al backend — revoca la sesión en PostgreSQL
                const backendRes = await fetch(logoutUrl, {
                    method:  "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Cookie":       `access_token=${token}`,
                    },
                });

                const setCookieHeader = backendRes.headers.get("set-cookie");
                if (setCookieHeader) {
                    response.headers.set("set-cookie", setCookieHeader);
                }

            } catch (err) {
                response.cookies.set({
                    name:     "access_token",
                    value:    "",
                    httpOnly: true,
                    secure:   process.env.NODE_ENV === "production",
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                    path:     "/",
                    maxAge:   0,
                });
            }
        }

        return response;

    } catch (error) {
        console.error("❌ Logout error:", error);
        return NextResponse.json<LogoutResponse>(
            { message: "Error al cerrar sesión" },
            { status: 500 }
        );
    }
}
























// // app/api/auth/logout/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// interface LogoutResponse {
//     message: string;
// }

// export async function POST(
//     request: NextRequest
// ): Promise<NextResponse<LogoutResponse>> {
//     try {
//         const cookieStore = await cookies();
//         const apiUrl = process.env.NEXT_PUBLIC_API;
//         const logoutUrl = `${apiUrl}/admin/auth/logout`;

//         const token = cookieStore.get("access_token")?.value;

//         if (token) {
//             try {
//                 await fetch(logoutUrl, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                         "Cookie": `access_token=${token}`,
//                     },
//                 });
//             } catch (err) {
//                 console.warn("⚠️ Backend logout failed:", err);
//             }
//         }

//         const isProduction = process.env.NODE_ENV === "production";

//         // Limpio el dominio de la cookie
//         const rawDomain = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "denguesanmartin.online";
//         const cleanDomain = rawDomain
//             .replace(/^https?:\/\//, "")
//             .replace(/:\d+$/, "");

//         // Elimino cookie del navegador con los MISMOS parámetros que en login
//         const response = NextResponse.json<LogoutResponse>({ 
//             message: "Sesión cerrada exitosamente" 
//         });
        
//         response.cookies.set({
//             name: "access_token",
//             value: "",
//             httpOnly: true,
//             secure: isProduction,
//             sameSite: isProduction ? "none" : "lax",
//             domain: `.${cleanDomain}`,
//             path: "/",
//             maxAge: 0,
//         });

//         return response;
//     } catch (error) {
//         console.error("❌ Logout error:", error);
//         return NextResponse.json<LogoutResponse>(
//             { message: "Error al cerrar sesión" }, 
//             { status: 500 }
//         );
//     }
// }