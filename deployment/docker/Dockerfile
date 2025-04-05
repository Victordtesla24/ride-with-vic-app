FROM node:16-alpine

# Create app directory
WORKDIR /app

# Install Puppeteer dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Tell Puppeteer to skip downloading Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    NODE_ENV=production \
    HUSKY=0

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies without running scripts (to skip husky)
RUN npm install --legacy-peer-deps --ignore-scripts

# Copy app source
COPY . .

# Create icon directory if it doesn't exist
RUN mkdir -p public/icons

# Generate icons
RUN node public/icons/generate-icons.js

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"] 