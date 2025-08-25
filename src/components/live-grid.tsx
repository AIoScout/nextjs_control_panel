export default function LiveGrid() {
    // const gridSize = 5; // grid size of 5x5
    return (
        <div className="flex flex-col gap-2 content-center items-center p-4 border border-gray-300 rounded-lg shadow-md bg-white">
            <h1 className="text-3xl font-medium text-center">Live Grid Map</h1>

            <div className="w-140 h-100 border border-gray-300 rounded-lg shadow-md content-center flex justify-center bg-white"></div>
        </div>
    );
}
