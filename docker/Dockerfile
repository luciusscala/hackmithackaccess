FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --production

# Copy the application code
COPY . .

# Create photos directory
RUN mkdir -p photos

# Expose port (Railway will override this)
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
