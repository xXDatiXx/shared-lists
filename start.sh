#!/bin/sh

# Start backend in background
cd /app/server && node index.js &

# Wait a moment for backend to start
sleep 2

# Start frontend
serve -s /app/dist -l 3000 --no-clipboard
