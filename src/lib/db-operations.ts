import {
    database,
    getCurrentUser,
    getUserPath,
    getAdminPath,
    isDemoMode,
    isAdmin,
} from "./firebase";
import { ref, get, update, set } from "firebase/database";
import { ExamState, TrafficLight } from "./data-types";

// Get the appropriate base path for database operations
const getBasePath = async (): Promise<string> => {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const demoMode = await isDemoMode();

    if (demoMode) {
        // In demo mode, everyone reads from admin path
        return getAdminPath();
    } else {
        // Normal mode, use user-specific path
        return getUserPath(user);
    }
};

// Check if user can write (only admins can write in demo mode, anyone can write in normal mode)
const canWrite = async (): Promise<boolean> => {
    const user = getCurrentUser();
    if (!user) return false;

    const demoMode = await isDemoMode();

    if (demoMode) {
        // In demo mode, only admins can write
        return isAdmin(user);
    } else {
        // In normal mode, all authenticated users can write to their own data
        return true;
    }
};

/* Demo Mode Operations */
export const setDemoMode = async (active: boolean) => {
    const user = getCurrentUser();
    if (!user || !isAdmin(user)) {
        throw new Error("Only admins can control demo mode");
    }
    await set(ref(database, "demoMode"), { active });
};

export const getDemoMode = async (): Promise<boolean> => {
    return await isDemoMode();
};

/* Exam State Operations */
export const getExamState = async (): Promise<ExamState | null> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    return snapshot.exists() ? (snapshot.val() as ExamState) : null;
};

export const updateExamState = async (updates: Partial<ExamState>) => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    const basePath = await getBasePath();
    await update(ref(database, `${basePath}/examState`), updates);
};

export const initializeUserData = async () => {
    const user = getCurrentUser();
    if (!user) throw new Error("User not authenticated");

    const userPath = getUserPath(user);

    // Initialize default exam state for new user
    const defaultExamState: ExamState = {
        field: "testing field",
        activated: false,
        start_point: 0,
        end_point: 0,
        task_id: 0,
        time_remain: 0,
    };

    // Check if user data already exists
    const snapshot = await get(ref(database, `${userPath}/examState`));
    if (!snapshot.exists()) {
        await set(ref(database, `${userPath}/examState`), defaultExamState);
        await initTrafficLights(); // Initialize traffic lights for new user
    }
};

/* Timer Operations */
export const activateExam = async () => {
    const examState = await getExamState();
    if (examState) {
        await updateExamState({
            activated: true,
        });
    }
};

export const deactivateExam = async () => {
    const examState = await getExamState();
    if (examState) {
        await updateExamState({
            activated: false,
        });
    }
};

export const updateExamTime = async (time: number) => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    const basePath = await getBasePath();
    await update(ref(database, `${basePath}/examState`), { time_remain: time });
};

export const getExamTime = async (): Promise<number> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    const val = snapshot.val();
    if (val && val.time_remain !== undefined) {
        return val.time_remain;
    }
    throw new Error("Exam time not found in exam state");
};

/* Route Operations */
export const getRoute = async (): Promise<{ start: number; end: number }> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    const val = snapshot.val();
    if (val && val.start_point !== undefined && val.end_point !== undefined) {
        return {
            start: val.start_point,
            end: val.end_point,
        };
    }
    throw new Error("Route not found in exam state");
};

export const updateRoute = async (start: number, end: number) => {
    await updateExamState({
        start_point: start,
        end_point: end,
    });
};

/* Task Operations */
export const getTask = async (): Promise<number | null> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/examState`));
    const val = snapshot.val();
    if (val && val.task_id !== undefined) {
        return val.task_id as number;
    }
    return null;
};

export const updateTask = async (taskId: number) => {
    await updateExamState({ task_id: taskId });
};

/* Traffic Light Operations */
export const initTrafficLights = async () => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    const trafficLights: TrafficLight[] = [
        { id: 1, current_state: "green", time_remain: 30 },
        { id: 2, current_state: "yellow", time_remain: 10 },
        { id: 3, current_state: "red", time_remain: 20 },
    ];

    const basePath = await getBasePath();
    const updates = trafficLights.reduce((acc, light) => {
        acc[`${basePath}/trafficLights/${light.id}`] = light;
        return acc;
    }, {} as Record<string, TrafficLight>);

    await update(ref(database), updates);
};

export const getTrafficLights = async (): Promise<TrafficLight[]> => {
    const basePath = await getBasePath();
    const snapshot = await get(ref(database, `${basePath}/trafficLights`));
    if (snapshot.exists()) {
        return Object.values(snapshot.val()) as TrafficLight[];
    }
    return [];
};

export const updateTrafficLight = async (
    lightId: number,
    updates: Partial<TrafficLight>
) => {
    if (!(await canWrite())) {
        throw new Error(
            "Write access denied. Only admins can modify data in demo mode."
        );
    }

    const basePath = await getBasePath();
    await update(
        ref(database, `${basePath}/trafficLights/${lightId}`),
        updates
    );
};

/* Live Grid Operations */
// TODO - implement similar pattern for live grid data
