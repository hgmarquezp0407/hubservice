import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const apiUrl = process.env.INTERNAL_API || process.env.NEXT_PUBLIC_API;

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;

        if (!accessToken) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        let userRes: Response;
        try {
            userRes = await fetch(`${apiUrl}/admin/auth/me`, {
                headers: { Cookie: `access_token=${accessToken}` },
                cache: "no-store",
            });
        } catch {
            return NextResponse.json({ error: "Sin conexión con el servidor", offline: true }, { status: 503 });
        }

        if (!userRes.ok) {
            return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
        }

        const userData = await userRes.json();

        return NextResponse.json({
            id:         userData.id,
            username:   userData.username,
            email:      userData.email,
            first_name: userData.first_name,
            last_name:  userData.last_name,
            role:  userData.role,
            expires_in: userData.expires_in,
        });

    } catch {
        return NextResponse.json({ error: "Error del servidor", offline: true }, { status: 503 });
    }
}




















// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// export async function GET(request: NextRequest) {
//     try {
//         const cookieStore = await cookies();
//         const accessToken = cookieStore.get("access_token")?.value;

//         if (!accessToken) {
//             return NextResponse.json({ error: "No autenticado" }, { status: 401 });
//         }

//         let userRes: Response;
//         try {
//             userRes = await fetch(`${process.env.NEXT_PUBLIC_API}/admin/auth/user`, {
//                 headers: { Cookie: `access_token=${accessToken}` },
//                 cache: "no-store",
//             });
//         } catch {
//             return NextResponse.json({ error: "Sin conexión con el servidor", offline: true }, { status: 503 });
//         }

//         if (!userRes.ok) {
//             return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
//         }

//         const userData = await userRes.json();

//         return NextResponse.json({
//             id:         userData.id,
//             username:   userData.username,
//             email:      userData.email,
//             names:      userData.names,
//             lastnames:  userData.lastnames,
//             role_name:  userData.role_name,
//             expires_in: userData.expires_in,
//         });

//     } catch {
//         return NextResponse.json({ error: "Error del servidor", offline: true }, { status: 503 });
//     }
// }






























// // app/api/auth/me/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { cookies } from "next/headers";

// interface UserResponse {
//     id:        number;
//     username:  string;
//     email:     string;
//     names:     string;
//     lastnames: string;
//     role_name: string;
// }

// interface ErrorResponse {
//     error:   string;
//     offline?: boolean;   // true cuando el backend está caído
// }

// export async function GET(
//     request: NextRequest
// ): Promise<NextResponse<UserResponse | ErrorResponse>> {
//     try {
//         const cookieStore = await cookies();
//         const accessToken = cookieStore.get("access_token")?.value;

//         if (!accessToken) {
//             return NextResponse.json<ErrorResponse>(
//                 { error: "No autenticado" },
//                 { status: 401 }
//             );
//         }

//         const apiUrl  = process.env.NEXT_PUBLIC_API;
//         const userUrl = `${apiUrl}/admin/auth/user`;

//         let userRes: Response;

//         try {
//             userRes = await fetch(userUrl, {
//                 headers: {
//                     Cookie:         `access_token=${accessToken}`,
//                     // "Content-Type": "application/json",
//                 },
//                 cache: "no-store",
//             });
//         } catch {
//             // Backend caído — fetch lanza excepción de red
//             return NextResponse.json<ErrorResponse>(
//                 { error: "Sin conexión con el servidor", offline: true },
//                 { status: 503 }   // 503 Service Unavailable
//             );
//         }

//         if (!userRes.ok) {
//             return NextResponse.json<ErrorResponse>(
//                 { error: "Token inválido o expirado" },
//                 { status: 401 }
//             );
//         }

//         const userData: UserResponse = await userRes.json();

//         return NextResponse.json<UserResponse>({
//             id:        userData.id,
//             username:  userData.username,
//             email:     userData.email,
//             names:     userData.names,
//             lastnames: userData.lastnames,
//             role_name: userData.role_name,
//         });

//     } catch {
//         return NextResponse.json<ErrorResponse>(
//             { error: "Error del servidor", offline: true },
//             { status: 503 }
//         );
//     }
// }