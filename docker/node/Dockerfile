FROM node:24-slim

# Arguments for permission alignment (defaulting to standard 1000)
ARG USER_ID=1000
ARG GROUP_ID=1000

# Adjust 'node' user UID and GID to match host user
RUN groupmod -g ${GROUP_ID} node && \
    usermod -u ${USER_ID} -g node node

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /var/www/html

# Run Node as 'node' user
USER node

EXPOSE 3000

CMD ["pnpm", "run", "dev"]
