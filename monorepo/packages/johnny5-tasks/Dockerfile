# syntax=docker/dockerfile:1.7-labs
# Use the official Bun image
FROM oven/bun:latest AS base

# Set working directory
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
# Copy package.json files
COPY package.json bun.lock ./
COPY --parents packages/*/package.json .

# Install dependencies
RUN bun install --frozen-lockfile --production

# copy production dependencies and source code into final image
FROM base AS release
COPY . .
COPY --from=install /app/node_modules node_modules

# Set the entrypoint to run johnny5-tasks
CMD ["bun", "run", "packages/johnny5-tasks/src/index.ts"]