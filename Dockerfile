# Base image with official Node LTS on Alpine Linux
FROM node:20-alpine AS base
WORKDIR /app

# 🆕 THE ALPINE PRISMA FIX: Install strictly required C-libraries & OpenSSL for Prisma binaries
RUN apk add --no-cache openssl libc6-compat

# Step 1: Copy dependency descriptors and Prisma schema first
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Step 2: Clean install dependencies with legacy flag for beta auth
RUN npm ci --legacy-peer-deps
RUN npx prisma generate

# Step 3: Copy all remaining application source code
COPY . .

# Expose Next.js standard port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]