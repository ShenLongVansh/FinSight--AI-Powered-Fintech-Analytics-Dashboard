# Use Node.js Alpine image
FROM node:20-alpine

# Install qpdf for PDF decryption
RUN apk add --no-cache qpdf

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
