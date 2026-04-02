// app/api/auth/refresh/route.ts

import { NextRequest, NextResponse } from "next/server"

const apiUrl = process.env.INTERNAL_API || process.env.NEXT_PUBLIC_API;

export async function POST(req: NextRequest) {
    const token = req.cookies.get("access_token")?.value

    if (!token) {
        return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
    }

    try {
        const response = await fetch(
            `${apiUrl}/admin/auth/check-token`,
            {
                method:  "GET",
                headers: { Cookie: `access_token=${token}` },
            }
        )

        if (!response.ok) {
            const res = NextResponse.json({ detail: "Sesión expirada." }, { status: 401 })
            res.cookies.set("access_token", "", {
                httpOnly: true,
                secure:   process.env.NODE_ENV === "production",
                sameSite: "lax",
                path:     "/",
                maxAge:   0,
            })
            return res
        }

        const data = await response.json()
        const setCookie = response.headers.get("set-cookie")
        const res = NextResponse.json({
            valid:      true,
            expires_in: data.expires_in,
        })

        if (setCookie) res.headers.set("set-cookie", setCookie)

        return res

    } catch {
        return NextResponse.json({ detail: "Error al renovar sesión" }, { status: 500 })
    }
}




















// import { NextRequest, NextResponse } from "next/server"

// export async function POST(req: NextRequest) {
//     const token = req.cookies.get("access_token")?.value

//     if (!token) {
//         return NextResponse.json({ detail: "No autenticado" }, { status: 401 })
//     }

//     try {
//         const response = await fetch(
//             `${process.env.NEXT_PUBLIC_API}/admin/auth/check-token`,
//             {
//                 method:  "GET",
//                 headers: { Cookie: `access_token=${token}` },
//             }
//         )

//         if (!response.ok) {
//             const res = NextResponse.json({ detail: "Sesión expirada." }, { status: 401 })
//             res.cookies.set("access_token", "", {
//                 httpOnly: true,
//                 secure:   process.env.NODE_ENV === "production",
//                 sameSite: "lax",
//                 path:     "/",
//                 maxAge:   0,
//             })
//             return res
//         }

//         const data = await response.json()
//         const setCookie = response.headers.get("set-cookie")
//         const res = NextResponse.json({
//             valid:      true,
//             expires_in: data.expires_in,
//         })

//         if (setCookie) res.headers.set("set-cookie", setCookie)

//         return res

//     } catch {
//         return NextResponse.json({ detail: "Error al renovar sesión" }, { status: 500 })
//     }
// }