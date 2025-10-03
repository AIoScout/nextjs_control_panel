"use client";
import Image from "next/image";
import MapImage from "@/public/map-image.png";
import TestingFieldImage from "@/public/testing-field.png";
import { useFieldState } from "@/lib/useFieldState";

export default function LiveGrid() {
    const { finalDemoDay } = useFieldState();
    // const gridSize = 5; // grid size of 5x5
    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white">
            <h1 className="text-3xl font-medium text-center">Map Layout</h1>

            <div className=" border border-gray-300 rounded-lg shadow-md content-center flex justify-center bg-white w-96 h-96">
                {finalDemoDay == true ? (
                    <Image
                        src={MapImage}
                        alt="Grid Map"
                        width={500}
                        height={500}
                        className="object-contain max-w-full max-h-full"
                    />
                ) : (
                    // <div className="p-4 text-center">
                    //     <p className="text-lg font-medium mb-2">
                    //         Placeholder for Displaying the Testing Field Map
                    //     </p>
                    // </div>
                    <Image
                        src={TestingFieldImage}
                        alt="Grid Map"
                        width={500}
                        height={500}
                        className="object-contain max-w-full max-h-full"
                    />
                )}
            </div>
        </div>
    );
}
