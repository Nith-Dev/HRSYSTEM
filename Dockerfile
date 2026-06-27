FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Copy package files + prisma schema before npm install
# (postinstall runs prisma generate which needs schema.prisma)
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm install

# Copy remaining source
COPY backend/src ./src/

EXPOSE 8080

CMD ["node", "src/index.js"]
