#!/bin/sh
set -e
set -u

# Start backend on port 3001 explicitly
cd /app/server && PORT=3001 node index.js &

# Wait for backend
sleep 2

# Start frontend on port 3000
serve -s /app/dist -l 3000 --no-clipboard
