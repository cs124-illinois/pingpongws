# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript monorepo for PingPongWS - a WebSocket ping-pong library for maintaining WebSocket connections. The project uses npm workspaces and consists of multiple packages:

- `types/` - Shared type definitions and message validation using Runtypes
- `client/` - Client-side WebSocket wrapper that sends ping messages and expects pong responses
- `server/` - Server-side WebSocket wrapper that sends pong messages and expects ping responses
- `demo/` - Next.js demo application showcasing the client library
- `demo-server/` - Koa.js demo server showcasing the server library

## Architecture

The core architecture follows a ping-pong pattern for WebSocket connection health monitoring:

1. **Types Package (`types/src/index.ts:3-16`)**: Defines `PingMessage` and `PongMessage` using Runtypes for runtime validation
2. **Client Package (`client/src/index.ts:10`)**: `PingWS` function wraps ReconnectingWebSocket, sends pings, expects pongs
3. **Server Package (`server/src/index.ts:10`)**: `PongWS` function wraps Node.js WebSocket, sends pongs, expects pings
4. **Message Filtering (`types/src/index.ts:41`)**: `filterPingPongMessages` helper removes ping/pong messages from regular message handlers

The packages use a shared options system defined in `types/src/index.ts:18-36` with configurable intervals, timeouts, and logging.

## Development Commands

### Root Commands
- `npm install` - Install all dependencies across workspaces
- `npm run <command> --workspace=<package-name>` - Run commands in specific packages

### Common Package Commands (client, server, types)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Watch mode compilation (`tsc -w`)
- `npm run check` - Run full validation (depcheck, prettier, eslint, tsc)
- `npm run eslint` - Run ESLint on source files
- `npm run prettier` - Format code and organize imports
- `npm run clean` - Remove dist directory
- `npm run tsc` - Type check without emitting files
- `npm run ncu` - Check for dependency updates

### Demo Application (Next.js)
- `npm run start --workspace=demo` - Start development server
- `npm run build --workspace=demo` - Build for production
- `npm run serve --workspace=demo` - Serve built application

### Demo Server (Koa.js)
- `npm run start --workspace=demo-server` - Start development server with nodemon

## Build System

- **TypeScript**: All packages use TypeScript with individual tsconfig.json files
- **ESLint**: Configured with flat config format (eslint.config.mjs)
- **Prettier**: Code formatting with import organization
- **Date-based versioning**: Uses YYYY.M.PATCH format (e.g., 2024.8.2)
- **npm workspaces**: Manages dependencies across packages
- **No test framework**: Project currently has no testing setup

## Key Files

- `package.json` - Root workspace configuration
- `package-lock.json` - Dependency lock file
- `types/src/index.ts` - Core type definitions and message validation
- `client/src/index.ts` - Client-side ping implementation
- `server/src/index.ts` - Server-side pong implementation
- `demo/pages/index.tsx` - Demo React component
- `demo-server/src/index.ts` - Demo Koa server