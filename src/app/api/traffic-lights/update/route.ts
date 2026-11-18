import { NextResponse } from "next/server";
import { buildTrafficLightUpdates, getTrafficLightsPublic } from "@/lib/db-operations";

export async function POST(request: Request) {
    const token = request.headers
        .get("authorization")
        ?.match(/^Bearer\s+(\S+)$/i)?.[1];

    if (!token) {
        return NextResponse.json(
            { success: false, error: "Authentication required" },
            { status: 401 }
        );
    }

    try {
        const databaseUrl = process.env.FIREBASE_DATABASE_URL;
        if (!databaseUrl) {
            throw new Error("FIREBASE_DATABASE_URL is not configured");
        }

        const lights = await getTrafficLightsPublic();
        if (lights.length === 0) {
            return NextResponse.json(
                { success: false, error: "No traffic lights to update" },
                { status: 409 }
            );
        }

        const updates = buildTrafficLightUpdates(lights);
        const url = new URL("/admin/trafficLights.json", databaseUrl);
        url.searchParams.set("auth", token);

        const result = await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
            redirect: "error",
        });

        if (result.status === 401 || result.status === 403) {
            return NextResponse.json(
                { success: false, error: "Firebase denied the write" },
                { status: 403 }
            );
        }

        if (!result.ok) {
            console.error("Firebase traffic-light update failed:", result.status);
            return NextResponse.json(
                { success: false, error: "Firebase could not update traffic lights" },
                { status: 502 }
            );
        }

        return NextResponse.json({
            success: true,
            trafficLights: Object.values(updates),
            timestamp: new Date().toISOString(),
        });
    } catch {
        // Do not log the outgoing URL: it contains the Firebase ID token.
        console.error("Traffic-light update failed; check database configuration and connectivity");
        return NextResponse.json(
            { success: false, error: "Failed to update traffic lights" },
            { status: 500 }
        );
    }
}

// GET - Health check for the update service
export async function GET() {
    try {
        const trafficLights = await getTrafficLightsPublic();
        return NextResponse.json({
            status: "healthy",
            trafficLightCount: trafficLights.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json(
            { 
                status: "unhealthy",
                error: "Service unavailable",
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
