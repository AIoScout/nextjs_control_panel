export type ExamState = {
    field: "testing field" | "final demo arena";
    activated: boolean;
    start_point: number;
    end_point: number;
    task_id: number;
    time_remain: number;
};

export type TrafficLight = {
    id: number;
    current_state: "green" | "yellow" | "red";
    time_remain: number;
};
