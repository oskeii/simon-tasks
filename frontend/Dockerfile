FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

# Start development server
CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0" ]
# - --host 0.0.0.0 = tells Vite to accept connections from outside container
# - Default is localhost/127.0.0.1 which only works inside container
# - Without this, you couldn't access the app from your browser