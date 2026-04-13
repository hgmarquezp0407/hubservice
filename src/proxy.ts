// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest): Promise<NextResponse> {
    const url = req.nextUrl;
    const pathname = url.pathname;

    const publicPaths: string[] = [
        '/_next',
        '/api/auth/login',
        '/api/auth/me',
        '/api/auth/logout',
        '/favicon',
        '/assets',
        '/images',
        '/fonts',
        '/static',
    ];

    const isPublicPath = publicPaths.some((path: string) =>
        pathname.startsWith(path)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    const accessToken = req.cookies.get('access_token')?.value;

    if (pathname === '/') {
        if (accessToken) {
            return NextResponse.redirect(new URL('/admin/home', req.url));
        }

        return NextResponse.next();
    }

    if (pathname === '/register') {
        if (accessToken) {
            const referer = req.headers.get('referer') ?? '';
            const isComingFromRegister = referer.includes('/register');
            if (!isComingFromRegister) {
                return NextResponse.redirect(new URL('/admin/home', req.url));
            }
        }

        return NextResponse.next();
    }

    if (pathname.startsWith('/admin')) {
        if (!accessToken) {
            return NextResponse.redirect(new URL('/', req.url));
        }

        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|assets|images|fonts).*)',
    ],
};