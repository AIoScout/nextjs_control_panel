import { NextResponse } from "next/server";
import { buildTrafficLightUpdates, getTrafficLightsPublic } from "@/lib/db-operations";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import type { TrafficLight } from "@/lib/data-types";

// POST - Update traffic light system automatically (for timer/cron)
// This endpoint is designed to be called every second by a timer or cron job
export async function POST(request: Request) {
    try {
        const token = request.headers
            .get("authorization")
            ?.match(/^Bearer\s+(\S+)$/i)?.[1];

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const caller = await adminAuth.verifyIdToken(token).catch(() => null);
        if (!caller) {
            return NextResponse.json(
                { success: false, error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const adminUid = process.env.TRAFFIC_LIGHTS_ADMIN_UID;
        if (!adminUid) {
            throw new Error("TRAFFIC_LIGHTS_ADMIN_UID is not configured");
        }

        if (caller.uid !== adminUid) {
            return NextResponse.json(
                { success: false, error: "Admin privileges required" },
                { status: 403 }
            );
        }

        const lightsRef = adminDb.ref("admin/trafficLights");
        const snapshot = await lightsRef.get();
        const lights = Object.values(snapshot.val() ?? {}) as TrafficLight[];
        const updates = buildTrafficLightUpdates(lights);
        
        if (Object.keys(updates).length > 0) {
            await lightsRef.update(updates);
        }

        return NextResponse.json({
            success: true,
            trafficLights: Object.values(updates),
            timestamp: new Date().toISOString(),
        });

    } catch (error) {
        console.error("Error in traffic light update cycle:", error);
        return NextResponse.json(
            { 
                success: false,
                error: "Failed to update traffic lights",
                timestamp: new Date().toISOString()
            },
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
