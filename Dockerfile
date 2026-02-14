FROM node:20-alpine AS builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
RUN npm install

# Copy frontend source
COPY . .

# Build frontend
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Copy backend files
COPY server ./server

# Copy frontend build
COPY --from=builder /app/dist ./dist

# Install serve globally for frontend
RUN npm install -g serve

# Create data directory
RUN mkdir -p /app/server/data

# Expose ports
EXPOSE 3000 3001

# Copy and set permissions for start script
COPY start.sh ./
RUN chmod +x start.sh

# Start both services
CMD ["./start.sh"]
