"use client";
import React, { useState, useEffect } from "react";

import {
    getExamTime,
    updateExamTime,
    activateExam,
    deactivateExam,
} from "@/lib/db-operations";

interface TimerProps {
    timerLimit: number;
    canWrite: boolean;
}

export default function Timer({ timerLimit, canWrite }: TimerProps) {
    const [seconds, setSeconds] = useState(timerLimit || 120); // Default to 2 mins
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        getExamTime()
            .then((time) => {
                setSeconds(time);
            })
            .catch((error) => {
                console.error("Error fetching exam time:", error);
            });
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prevSeconds) => prevSeconds - 1);
            }, 1000);
        } else if (seconds === 0) {
            // Countdown finished
            setIsActive(false);
            deactivateExam(); // Update exam state to deactivated
            updateExamTime(0); // Update the remaining time to 0
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, seconds]);

    const startTimer = () => {
        setIsActive(true);
        activateExam();
    };

    const pauseTimer = () => {
        setIsActive(false);
        updateExamTime(seconds);
        // update firebase with the current time remaining only if the timer is paused
    };

    const resetTimer = () => {
        setIsActive(false);
        setSeconds(timerLimit || 120);
        updateExamTime(timerLimit || 120);
        deactivateExam();
    };

    // Display in MM:SS format
    const formatTime = () => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${
            remainingSeconds < 10 ? "0" : ""
        }${remainingSeconds}`;
    };

    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white h-full">
            <h1 className="text-3xl font-medium">Timer</h1>

            <p className="text-4xl font-mono">{formatTime()}</p>
            <div className="flex flex-col gap-2 w-full">
                {!isActive ? (
                    <button
                        onClick={startTimer}
                        className="btn btn-primary"
                        disabled={!canWrite}
                    >
                        {seconds === 120 ? "Start" : "Resume"}
                    </button>
                ) : (
                    <button
                        onClick={pauseTimer}
                        className="btn btn-secondary"
                        disabled={!canWrite}
                    >
                        Pause
                    </button>
                )}
                <button
                    onClick={resetTimer}
                    className="btn btn-primary"
                    disabled={!canWrite}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
