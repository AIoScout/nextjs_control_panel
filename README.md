# Next.js Control Panel

## Dev Updates

[2025-08-25]
- Created two separate branch aside of main
    - `main` - basic duplicate of the old site control panel with limited basic firebase operation
    - `feat/live-map` - added Fiona’s part of backend integrating with the control panel
    - `feat/firebase-data-isolation` - working on isolating user’s data and add admin control and route for user to get read only data for final demo

## Preparation
### Frontend
Install packages for Next.js control panel
```bash
npm install
```

### Backend

1. Create virtual environment under `/backend` where the tile server programs are stored

    ``` bash
    python -m venv backend/.venv
    ```
    Or using `uv`
    ```bash
    uv venv backend/.venv
    ```
2. Activate virtual environment (same command for using `uv`)
    ```bash
    source backend/.venv/bin/activate
    ```
3. Install required Python packages
    ```bash
    pip install -r backend/requirements.txt
    ```
    Or using `uv`
    ```bash
    uv pip install -r backend/requirements.txt
    ```


## Run

### Terminal 1 - Web Socket
```bash
source backend/.venv/bin/activate
python backend/websocket_server.py
```
Or using `uv`
```bash
source backend/.venv/bin/activate
uv run backend/websocket_server.py
```

### Terminal 2 - Tile Server
```bash
source backend/.venv/bin/activate
python backend/main.py
```
Or using `uv`
```bash
source backend/.venv/bin/activate
uv run backend/main.py
```

### Terminal 3 - Next.js Control Panel
```bash
npm run dev
```
