################################################################ BUILDING PHASE ################################################################

# Building layer
FROM node:23-alpine AS builder

# Install git and any other dependencies
RUN apk add --no-cache git

WORKDIR /app

# Copy configuration files
COPY tsconfig*.json ./
COPY package.json ./

RUN yarn install

# Copy application sources (.ts, .tsx, js)
COPY . .

# Build application (produces dist/ folder)
RUN yarn build

################################################################ DEPLOY PHASE ################################################################

# Runtime production layer
FROM node:23-alpine AS production


WORKDIR /app

# Copy dependencies files
COPY package.json ./

RUN yarn install

# Copy production build
COPY --from=builder /app/dist/ dist
COPY --from=builder /app/node_modules/ node_modules


# Expose application port
EXPOSE 3000

# Start application
CMD [ "node", "dist/main.js" ]