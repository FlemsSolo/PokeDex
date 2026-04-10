# Use an official node image as the base image
FROM node:24.14.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Start the application using Vite's development server
CMD ["npm", "run", "dev", "--", "--host"]