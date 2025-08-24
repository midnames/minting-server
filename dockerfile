FROM node:24

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Copy managed directory to dist (tsc doesn't copy .cjs files)
RUN cp -r src/managed dist/src/

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]