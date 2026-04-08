// import NextAuth, { DefaultSession } from "next-auth";
// import { JWT as DefaultJWT } from "next-auth/jwt";

// declare module "next-auth" {
//     interface User {
//         id: number;
//         name: string;
//         username: string;
//         email: string;
//         idrole?: number;
//     }

//     interface Session {
//         user: User & DefaultSession["user"];
//     }
// }

// declare module "next-auth/jwt" {
//     interface JWT extends DefaultJWT {
//         id: number;
//         name: string;
//         username: string;
//         email: string;
//         idrole?: number;
//     }
// }


// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

export interface IMenuItem {
    path: string;
    title: string;
    icon: string;
    type: "link" | "sub";
    active: boolean;
    selected: boolean;
    children: IMenuItem[];
}

declare module "next-auth" {
    interface User {
        id: number;
        name: string;
        username: string;
        email: string;
        idrole?: number;
        role_name: string;
        // usertype: string;
        // subdomain: string;
        // modules: IMenuItem[];
        // permissions?: string[];
        // company?: { id: number; name: string };
        // configuration?: Record<string, any>;
    }

    interface Session {
        user: User & DefaultSession["user"];
    }

    interface JWT {
        id: number;
        name: string;
        username: string;
        email: string;
        idrole?: number;
        role_name: string;
        // usertype: string;
        // subdomain: string;
        // modules: IMenuItem[];
        // permissions?: string[];
        // company?: { id: number; name: string };
        // configuration?: Record<string, any>;
    }
}
