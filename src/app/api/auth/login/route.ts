// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginSuccessResponse {
    user: {
        id:        number;
        first_name: string;
        last_name: string;
        username:  string;
        email:     string;
        role: string;
    };
    expires_in: number;
    message:    string;
}

interface LoginErrorResponse {
    detail: string;
}

interface UserData {
    id:        number;
    first_name: string;
    last_name: string;
    username:  string;
    email:     string;
    role: string;
}

export async function POST(
    request: NextRequest
): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
    try {
        const { username, password }: LoginRequest = await request.json();

        const apiUrl = process.env.INTERNAL_API || process.env.NEXT_PUBLIC_API;
        const loginUrl = `${apiUrl}/admin/auth/token`;

        // 1. Autenticar contra el backend
        const response = await fetch(loginUrl, {
            method:  "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body:    new URLSearchParams({ username, password }),
        });

        if (!response.ok) {
            const errorData: { detail?: string } = await response.json();
            return NextResponse.json<LoginErrorResponse>(
                { detail: errorData.detail || "Credenciales inválidas" },
                { status: response.status }
            );
        }

        // 2. Leer el body del backend — contiene message y expires_in
        const backendData: { message: string; expires_in: number } = await response.json();

        // 3. Capturar el set-cookie del backend (contiene la cookie httpOnly)
        const setCookieHeader = response.headers.get("set-cookie");

        if (!setCookieHeader) {
            return NextResponse.json<LoginErrorResponse>(
                { detail: "Token no recibido del servidor" },
                { status: 500 }
            );
        }

        // 4. Extraer el token para usarlo en el fetch a /auth/me (server-side)
        const accessToken = setCookieHeader.match(/access_token=([^;]+)/)?.[1];

        if (!accessToken) {
            return NextResponse.json<LoginErrorResponse>(
                { detail: "Token no válido en respuesta del servidor" },
                { status: 500 }
            );
        }

        // 5. Obtener datos del usuario pasando la cookie en server-side
        const userRes = await fetch(`${apiUrl}/admin/auth/me`, {
            headers: { Cookie: `access_token=${accessToken}` },
        });

        if (!userRes.ok) {
            return NextResponse.json<LoginErrorResponse>(
                { detail: "Error obteniendo datos del usuario" },
                { status: 500 }
            );
        }

        const userData: UserData = await userRes.json();

        // 6. Construir respuesta y propagar la cookie httpOnly del backend tal cual
        const finalResponse = NextResponse.json<LoginSuccessResponse>({
            user: {
                id:        userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                username:  userData.username,
                email:     userData.email,
                role: userData.role
            },
            expires_in: backendData.expires_in,
            message:    "Login exitoso",
        });

        finalResponse.headers.set("set-cookie", setCookieHeader);

        return finalResponse;

    } catch (error) {
        return NextResponse.json<LoginErrorResponse>(
            { detail: error instanceof Error ? error.message : "Error desconocido" },
            { status: 500 }
        );
    }
}


























// import { NextRequest, NextResponse } from "next/server";

// interface LoginRequest {
//     username: string;
//     password: string;
// }

// interface LoginSuccessResponse {
//     user: {
//         id: number;
//         username: string;
//         email: string;
//         names: string;
//         lastnames: string;
//     };
//     message: string;
// }

// interface LoginErrorResponse {
//     detail: string;
// }

// interface UserData {
//     id: number;
//     username: string;
//     email: string;
//     names: string;
//     lastnames: string;
// }

// export async function POST(
//     request: NextRequest
// ): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
//     try {
//         const { username, password }: LoginRequest = await request.json();

//         const apiUrl   = process.env.NEXT_PUBLIC_API;
//         const loginUrl = `${apiUrl}/admin/auth/token`;

//         // 1. Autenticar contra el backend
//         const response = await fetch(loginUrl, {
//             method:      "POST",
//             headers:     { "Content-Type": "application/x-www-form-urlencoded" },
//             body:        new URLSearchParams({ username, password }),
//             credentials: "include",
//         });

//         if (!response.ok) {
//             const errorData: { detail?: string } = await response.json();
//             return NextResponse.json<LoginErrorResponse>(
//                 { detail: errorData.detail || "Credenciales inválidas" },
//                 { status: response.status }
//             );
//         }

//         // 2. Capturar el set-cookie del backend (contiene la cookie httpOnly)
//         const setCookieHeader = response.headers.get("set-cookie");

//         if (!setCookieHeader) {
//             return NextResponse.json<LoginErrorResponse>(
//                 { detail: "Token no recibido del servidor" },
//                 { status: 500 }
//             );
//         }

//         // 3. Extraer el token para usarlo en el fetch a /auth/user (server-side)
//         const accessToken = setCookieHeader.match(/access_token=([^;]+)/)?.[1];

//         if (!accessToken) {
//             return NextResponse.json<LoginErrorResponse>(
//                 { detail: "Token no válido en respuesta del servidor" },
//                 { status: 500 }
//             );
//         }

//         // 4. Obtener datos del usuario pasando la cookie en server-side
//         const userRes = await fetch(`${apiUrl}/admin/auth/user`, {
//             headers: { Cookie: `access_token=${accessToken}` },
//         });

//         if (!userRes.ok) {
//             return NextResponse.json<LoginErrorResponse>(
//                 { detail: "Error obteniendo datos del usuario" },
//                 { status: 500 }
//             );
//         }

//         const userData: UserData = await userRes.json();

//         // 5. Construir respuesta y propagar la cookie httpOnly del backend
//         //    tal cual — sin modificar sus flags (HttpOnly, Secure, SameSite, domain)
//         const finalResponse = NextResponse.json<LoginSuccessResponse>({
//             user: {
//                 id:        userData.id,
//                 username:  userData.username,
//                 email:     userData.email,
//                 names:     userData.names,
//                 lastnames: userData.lastnames,
//             },
//             message: "Login exitoso",
//         });

//         finalResponse.headers.set("set-cookie", setCookieHeader);

//         return finalResponse;

//     } catch (error) {
//         return NextResponse.json<LoginErrorResponse>(
//             { detail: error instanceof Error ? error.message : "Error desconocido" },
//             { status: 500 }
//         );
//     }
// }


























// // app/api/auth/login/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// interface LoginRequest {
//     username: string;
//     password: string;
// }

// interface LoginSuccessResponse {
//     user: {
//         id: number;
//         username: string;
//         email: string;
//         names: string;
//         lastnames: string;
//     };
//     message: string;
// }

// interface LoginErrorResponse {
//     detail: string;
// }

// interface UserData {
//     id: number;
//     username: string;
//     email: string;
//     names: string;
//     lastnames: string;
// }

// // Tiempo de expiración — debe coincidir con ACCESS_TOKEN_EXPIRE_MINUTES del backend
// const TOKEN_EXPIRE_SECONDS = parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || "10", 10) * 60;

// const isProduction = process.env.NODE_ENV === "production";

// // Dominio limpio sin protocolo ni puerto
// const rawDomain  = process.env.NEXT_PUBLIC_MAIN_DOMAIN || "";
// const cookieDomain = rawDomain
//     .replace(/^https?:\/\//, "")
//     .replace(/:\d+$/, "");

// export async function POST(
//     request: NextRequest
// ): Promise<NextResponse<LoginSuccessResponse | LoginErrorResponse>> {
//     try {
//         const { username, password }: LoginRequest = await request.json();

//         const apiUrl   = process.env.NEXT_PUBLIC_API;
//         const loginUrl = `${apiUrl}/admin/auth/token`;

//         // 1. Autenticar contra el backend
//         const response = await fetch(loginUrl, {
//             method:  "POST",
//             headers: { "Content-Type": "application/x-www-form-urlencoded" },
//             body:    new URLSearchParams({ username, password }),
//         });

//         if (!response.ok) {
//             const errorData: { detail?: string } = await response.json();
//             return NextResponse.json<LoginErrorResponse>(
//                 { detail: errorData.detail || "Credenciales inválidas" },
//                 { status: response.status }
//             );
//         }

//         // 2. Extraer token de la cookie del backend
//         const setCookieHeader = response.headers.get("set-cookie");
//         const accessToken     = setCookieHeader?.match(/access_token=([^;]+)/)?.[1];

//         if (!accessToken) {
//             return NextResponse.json<LoginErrorResponse>(
//                 { detail: "Token no recibido del servidor" },
//                 { status: 500 }
//             );
//         }

//         // 3. Setear cookie en el frontend
//         const cookieStore = await cookies();

//         cookieStore.set("access_token", accessToken, {
//             httpOnly: true,
//             secure:   isProduction,
//             sameSite: isProduction ? "none" : "lax",
//             domain:   cookieDomain ? `.${cookieDomain}` : undefined,  // undefined en localhost
//             path:     "/",
//             maxAge:   TOKEN_EXPIRE_SECONDS,   // ← consistente con el backend
//         });

//         // 4. Obtener datos del usuario
//         const userRes = await fetch(`${apiUrl}/admin/auth/user`, {
//             headers: { Cookie: `access_token=${accessToken}` },
//         });

//         if (!userRes.ok) {
//             return NextResponse.json<LoginErrorResponse>(
//                 { detail: "Error obteniendo datos del usuario" },
//                 { status: 500 }
//             );
//         }

//         const userData: UserData = await userRes.json();

//         return NextResponse.json<LoginSuccessResponse>({
//             user: {
//                 id:        userData.id,
//                 username:  userData.username,
//                 email:     userData.email,
//                 names:     userData.names,
//                 lastnames: userData.lastnames,
//             },
//             message: "Login exitoso",
//         });

//     } catch (error) {
//         return NextResponse.json<LoginErrorResponse>(
//             { detail: error instanceof Error ? error.message : "Error desconocido" },
//             { status: 500 }
//         );
//     }
// }