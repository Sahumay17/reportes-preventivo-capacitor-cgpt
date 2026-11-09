FROM node:22-alpine

WORKDIR /app

# Copy package definitions
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev || npm install

# Copy application code
COPY . .

# Cloud Run defaults to PORT 8080
ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
