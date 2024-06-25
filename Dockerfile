# Use the official Node.js image.
FROM node:20

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy the package.json and yarn.lock files.
COPY package*.json ./
COPY yarn.lock ./

# Install the dependencies.
RUN yarn install

# Copy the rest of the application files.
COPY . .


# Build the application.
RUN yarn build
RUN yarn deploy

# Use the dist directory for the application
WORKDIR /usr/src/app

# Command to run the application.
CMD [ "yarn", "start" ]
