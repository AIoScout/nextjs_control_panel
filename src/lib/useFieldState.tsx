"use client";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { getExamState, updateExamState } from "./db-operations";

interface FieldStateContextType {
    finalDemoDay: boolean | null;
    setFinalDemoDay: (value: boolean) => void;
}

const FieldStateContext = createContext<FieldStateContextType | undefined>(
    undefined
);

interface FieldStateProviderProps {
    children: ReactNode;
}

export function FieldStateProvider({ children }: FieldStateProviderProps) {
    // true = 'final demo arena', false = 'testing field'
    const [finalDemoDay, setFinalDemoDay] = useState<boolean | null>(null);

    // Load initial value from db
    useEffect(() => {
        async function fetchField() {
            try {
                const examState = await getExamState();
                if (examState && examState.field === "final demo arena") {
                    setFinalDemoDay(true);
                } else {
                    setFinalDemoDay(false);
                }
            } catch {
                setFinalDemoDay(false); // fallback
            }
        }
        fetchField();
    }, []);

    // Update db when finalDemoDay changes (but not on initial load)
    useEffect(() => {
        if (finalDemoDay === null) return;
        async function updateField() {
            try {
                await updateExamState({
                    field: finalDemoDay ? "final demo arena" : "testing field",
                });
            } catch {
                // Optionally handle error
            }
        }
        updateField();
    }, [finalDemoDay]);

    return (
        <FieldStateContext.Provider value={{ finalDemoDay, setFinalDemoDay }}>
            {children}
        </FieldStateContext.Provider>
    );
}

export function useFieldState() {
    const context = useContext(FieldStateContext);
    if (context === undefined) {
        throw new Error(
            "useFieldState must be used within a FieldStateProvider"
        );
    }
    return context;
}
