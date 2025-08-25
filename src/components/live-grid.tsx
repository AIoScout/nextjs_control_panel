// src/app/components/live-grid.tsx
"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

interface Tile {
    ID: number | null;
    Populated: boolean;
    PortToSky: number;
    UpOPEN: boolean;
    RightOPEN: boolean;
    DownOPEN: boolean;
    LeftOPEN: boolean;
}

export default function LiveGrid() {
    const [grid, setGrid] = useState<Tile[][]>(initializeGrid());
    const [images, setImages] = useState<{ [key: string]: string }>({});
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        const socket = io("http://localhost:5000", {
            transports: ["websocket"],
            reconnection: true,
        });

        socket.on("connect", () => {
            console.log("Connected to Socket.IO");
            setConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Disconnected from Socket.IO");
            setConnected(false);
        });

        socket.on("initial_grid", (data) => {
            console.log("Received initial grid:", data);
            if (data.grid) {
                setGrid(data.grid);
            }
            if (data.images) {
                setImages(data.images);
            }
        });

        // socket.on('tile_update', (data) => {
        //     console.log('Received tile update:', data);
        //     if (data.changes) {
        //         setGrid(prev => updateGrid(prev, data.changes));
        //     }
        // });

        socket.on("grid_update", (data) => {
            console.log("Received grid update:", data);
            if (data.grid) {
                setGrid(data.grid);
            }
            if (data.images) {
                setImages(data.images);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white">
            <h1 className="text-3xl font-medium text-center">Live Grid Map</h1>

            {/* Grid container */}
            <div className="w-140 h-100 border border-gray-300 rounded-lg shadow-md flex items-center justify-center">
                {grid.length === 0 ? (
                    <span>Placeholder for live grid map</span>
                ) : (
                    <div className="flex flex-col gap-1">
                        {grid.map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1">
                                {row.map((tile, colIndex) => (
                                    <div
                                        key={colIndex}
                                        className="relative w-12 h-12 border border-gray-300 flex items-center justify-center"
                                    >
                                        {tile.Populated && tile.ID !== null && (
                                            <>
                                                <img
                                                    src={`http://localhost:5000${
                                                        images[tile.ID]
                                                    }`}
                                                    alt={`Tile ${tile.ID}`}
                                                    className="w-full h-full"
                                                    style={{
                                                        transform: `rotate(${
                                                            (tile.PortToSky -
                                                                1) *
                                                            90
                                                        }deg)`,
                                                    }}
                                                />
                                                <span className="absolute top-1 left-1 text-xs font-bold">
                                                    {tile.ID}
                                                </span>
                                                {/* {tile.UpOPEN && (
                                                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2" />
                                                )}
                                                {tile.RightOPEN && (
                                                    <div className="absolute top-1/2 right-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2" />
                                                )}
                                                {tile.DownOPEN && (
                                                    <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2" />
                                                )}
                                                {tile.LeftOPEN && (
                                                    <div className="absolute top-1/2 left-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2" />
                                                )} */}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function initializeGrid(): Tile[][] {
    const gridSize = 5;
    return Array.from({ length: gridSize }, () =>
        Array.from({ length: gridSize }, () => ({
            ID: null,
            Populated: false,
            PortToSky: 0,
            UpOPEN: false,
            RightOPEN: false,
            DownOPEN: false,
            LeftOPEN: false,
        }))
    );
}

function updateGrid(prev: Tile[][], changes: any): Tile[][] {
    const newGrid = [...prev];
    changes.forEach(({ row, col, updatedTile }: any) => {
        newGrid[row][col] = { ...newGrid[row][col], ...updatedTile };
    });
    return newGrid;
}
