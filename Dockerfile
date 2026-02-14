FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g serve

WORKDIR /app

COPY --from=builder /app/dist ./dist

ENV PORT=3000

EXPOSE ${PORT}

CMD ["sh", "-c", "serve -s dist -l ${PORT}"]
