FROM node:18-slim

WORKDIR /app/backend

# Install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy backend source and generate Prisma client
COPY backend/ .
RUN npx prisma generate

EXPOSE 8080

CMD ["node", "src/index.js"]
