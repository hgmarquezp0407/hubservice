"use client";
import React, { createContext, useContext } from "react";

export interface User {
    id: number;
    name: string;
    email: string;
}

const UserAdminContext = createContext<User | null>(null);

export function UserAdminProvider({
    user,
    children,
}: {
    user: User;
    children: React.ReactNode;
}) {
    return <UserAdminContext.Provider value={user}>{children}</UserAdminContext.Provider>;
}

export function useUser() {
    const ctx = useContext(UserAdminContext);
    if (ctx === null) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return ctx;
}


