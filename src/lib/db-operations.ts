import { database } from "./firebase";
import { ref, get, update } from "firebase/database";
import { ExamState, TrafficLight } from "./data-types";

/* Exam State Operations */
export const getExamState = async (): Promise<ExamState | null> => {
    const snapshot = await get(ref(database, "examState"));
    return snapshot.exists() ? (snapshot.val() as ExamState) : null;
};

export const updateExamState = async (updates: Partial<ExamState>) => {
    await update(ref(database, "examState"), updates);
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
    await update(ref(database, "examState"), { time_remain: time });
};

export const getExamTime = async (): Promise<number> => {
    const snapshot = await get(ref(database, "examState"));
    const val = snapshot.val();
    if (val && val.time_remain !== undefined) {
        return val.time_remain;
    }
    throw new Error("Exam time not found in exam state");
};

/* Route Operations */
export const getRoute = async (): Promise<{ start: number; end: number }> => {
    const snapshot = await get(ref(database, "examState"));
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
    await update(ref(database, "examState"), {
        start_point: start,
        end_point: end,
    });
};

/* Task Operations */
export const getTask = async (): Promise<number | null> => {
    const snapshot = await get(ref(database, "examState"));
    const val = snapshot.val();
    if (val && val.task_id !== undefined) {
        return val.task_id as number;
    }
    return null;
};

export const updateTask = async (taskId: number | null) => {
    await update(ref(database, "examState"), { task_id: taskId });
};

/* Traffic Light Operations */
// TODO

export const initTrafficLights = async () => {
    const trafficLights: TrafficLight[] = [
        { id: 1, current_state: "green", time_remain: 30 },
        { id: 2, current_state: "yellow", time_remain: 10 },
        { id: 3, current_state: "red", time_remain: 20 },
    ];

    const updates = trafficLights.reduce((acc, light) => {
        acc[`trafficLights/${light.id}`] = light;
        return acc;
    }, {} as Record<string, TrafficLight>);

    await update(ref(database), updates);
};

export const getTrafficLights = async (): Promise<TrafficLight[]> => {
    const snapshot = await get(ref(database, "trafficLights"));
    if (snapshot.exists()) {
        return Object.values(snapshot.val()) as TrafficLight[];
    }
    return [];
};

/* Live Grid Operations */
// TODO
