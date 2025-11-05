// NOTE - using my own Firebase config for testing purposes
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, User } from "firebase/auth";
import { ADMIN_WHITELIST } from "@/config/adminWhitelist";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

export const app: FirebaseApp = !getApps().length
    ? initializeApp(firebaseConfig)
    : getApps()[0];
export const database: Database = getDatabase(app);
export const auth = getAuth(app);


export const isAdmin = (user: User | null): boolean => {
    if (!user) return false;
    return ADMIN_WHITELIST.includes(user.uid);
};

// Get the current user
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// Get user-specific database path
export const getUserPath = (user: User | null): string => {
    if (!user) throw new Error("User not authenticated");
    return `users/${user.uid}`;
};

// Get admin path for demo mode
export const getAdminPath = (): string => {
    return "admin";
};

// Check if demo mode is active
export const isDemoMode = async (): Promise<boolean> => {
    const { get, ref } = await import("firebase/database");
    const snapshot = await get(ref(database, "demoMode/active"));
    return snapshot.exists() ? snapshot.val() : false;
};
