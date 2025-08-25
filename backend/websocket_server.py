from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
import os
import json
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask import Flask, request, jsonify, send_from_directory
from gevent import monkey
monkey.patch_all()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app,
                    cors_allowed_origins="*",
                    async_mode='gevent',
                    logger=True,
                    engineio_logger=True)

grid = [[{
    "ID": None,
    "Populated": False,
    "PortToSky": 0,
    "UpOPEN": False,
    "RightOPEN": False,
    "DownOPEN": False,
    "LeftOPEN": False
} for _ in range(5)] for _ in range(5)]

grid[2][2] = {
    "ID": 0,
    "Populated": True,
    "PortToSky": 1,
    "UpOPEN": True,
    "RightOPEN": True,
    "DownOPEN": True,
    "LeftOPEN": True
}

# newly added for storing grid images, and forwarding to next.js
grid_images = {}


def update_grid_images():
    """Update grid_images based on current grid state"""
    global grid_images
    grid_images = {}
    for row in grid:
        for cell in row:
            if cell["Populated"] and cell["ID"] is not None:
                grid_images[str(
                    cell["ID"])] = f"/assets/grid_{cell['UpOPEN']}_{cell['RightOPEN']}_{cell['DownOPEN']}_{cell['LeftOPEN']}.png"


@app.route('/assets/<path:filename>')
def serve_asset(filename):
    try:
        return send_from_directory('../backend/assets', filename)
    except Exception as e:
        print(f"Error serving asset {filename}: {e}")
        return jsonify({'error': 'File not found'}), 404


@socketio.on('connect')
def handle_connect():
    print("Client connected")
    try:
        update_grid_images()
        emit('initial_grid', {
            'type': 'initial_grid',
            'grid': grid,
            'images': grid_images
        })
        print(f"Sent initial grid with {len(grid_images)} images")
    except Exception as e:
        print(f"Error in handle_connect: {e}")


@app.route('/update_grid', methods=['POST'])
def update_grid():
    global grid, grid_images
    try:
        data = request.json
        print(f"Received grid update: {json.dumps(data, indent=2)}")
        if 'grid' in data:
            grid = data['grid']
            update_grid_images()
            socketio.emit('grid_update', {
                'grid': grid,
                'images': grid_images
            })
            print(f"Broadcast grid update with {len(grid_images)} images")
            return jsonify({'status': 'success'})
        return jsonify({'status': 'error', 'message': 'Invalid data'}), 400
    except Exception as e:
        print(f"Error in update_grid: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")


@app.route('/')
def home():
    return "WebSocket server is running."


if __name__ == '__main__':
    try:
        print("Starting WebSocket server...")
        print(f"Initial grid size: {len(grid)}x{len(grid[0])}")
        print(f"Center tile: {grid[2][2]}")
        update_grid_images()
        print(f"Initial images: {grid_images}")
        socketio.run(app, debug=True, port=5000)
    except Exception as e:
        print(f"Error starting server: {e}")
