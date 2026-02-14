FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production=false

COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

ENV PORT=3000

EXPOSE ${PORT}

CMD ["sh", "-c", "serve -s dist -p ${PORT} -n"]
