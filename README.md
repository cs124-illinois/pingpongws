# PingPongWS

A TypeScript library for maintaining WebSocket connections through automated ping-pong messaging. PingPongWS provides client and server wrappers that automatically send periodic ping/pong messages to keep WebSocket connections alive and detect disconnections.

## Features

- 🔄 **Automatic Connection Health Monitoring** - Sends periodic ping/pong messages to detect disconnections
- 📦 **Modular Architecture** - Separate client and server packages with shared types
- 🛡️ **Runtime Type Safety** - Uses Runtypes for message validation
- 🎯 **Configurable Options** - Customizable intervals, timeouts, and logging
- 🔌 **Easy Integration** - Drop-in wrappers for existing WebSocket connections
- 📱 **Demo Applications** - Working examples for both client and server usage

## Architecture

The library follows a ping-pong pattern where:

- **Client** (`@cs124/pingpongws-client`) - Sends `ping` messages and expects `pong` responses
- **Server** (`@cs124/pingpongws-server`) - Sends `pong` messages and expects `ping` responses  
- **Types** (`@cs124/pingpongws-types`) - Shared type definitions and message filtering utilities

## Installation

### Client-side (Browser/Node.js)

```bash
npm install @cs124/pingpongws-client @cs124/pingpongws-types
npm install reconnecting-websocket  # peer dependency
```

### Server-side (Node.js)

```bash
npm install @cs124/pingpongws-server @cs124/pingpongws-types
npm install ws  # for WebSocket server
```

## Quick Start

### Client Usage

```typescript
import { PingWS, filterPingPongMessages } from '@cs124/pingpongws-client'
import ReconnectingWebSocket from 'reconnecting-websocket'

// Create WebSocket connection
const ws = new ReconnectingWebSocket('ws://localhost:8080')

// Wrap with PingWS to enable ping-pong
const pingWS = PingWS(ws, {
  interval: 30000,  // Send ping every 30 seconds
  timeout: 5000,    // Wait 5 seconds for pong
  verbose: true     // Enable logging
})

// Add message handler that filters out ping-pong messages
pingWS.addEventListener('message', filterPingPongMessages(({ data }) => {
  console.log('Received application message:', data)
}))
```

### Server Usage

```typescript
import { PongWS, filterPingPongMessages } from '@cs124/pingpongws-server'
import WebSocket from 'ws'

const server = new WebSocket.Server({ port: 8080 })

server.on('connection', (ws) => {
  // Wrap with PongWS to enable ping-pong
  const pongWS = PongWS(ws, {
    interval: 30000,  // Send pong every 30 seconds
    timeout: 5000,    // Wait 5 seconds for ping
    verbose: true     // Enable logging
  })

  // Add message handler that filters out ping-pong messages
  pongWS.on('message', filterPingPongMessages(({ data }) => {
    console.log('Received application message:', data.toString())
  }))
})
```

## Configuration Options

All packages accept a `PingPongOptions` object:

```typescript
interface PingPongOptions {
  interval?: number          // Ping/pong interval in ms (default: 32768)
  timeout?: number           // Response timeout in ms (default: 8192) 
  verbose?: boolean          // Enable debug logging (default: false)
  logDisconnects?: boolean   // Log disconnection events (default: false)
  useOtherMessages?: boolean // Process non-ping-pong messages (default: true)
  usePingMessages?: boolean  // Process ping messages (default: true)
  logIdentifier?: () => string // Custom log identifier function
}
```

## Message Filtering

The `filterPingPongMessages` utility removes ping-pong messages from your application message handlers:

```typescript
import { filterPingPongMessages } from '@cs124/pingpongws-types'

// Raw handler receives ALL messages including ping-pong
ws.addEventListener('message', (event) => {
  console.log('All messages:', event.data)
})

// Filtered handler only receives application messages
ws.addEventListener('message', filterPingPongMessages((event) => {
  console.log('Application messages only:', event.data)
}))
```

## Development

This is a TypeScript monorepo using npm workspaces.

### Setup

```bash
git clone https://github.com/your-org/pingpongws.git
cd pingpongws
npm install
```

### Build All Packages

```bash
npm run build --workspaces
```

### Run Quality Checks

```bash
npm run check --workspaces --if-present
```

### Package Commands

Each package supports these commands:

- `npm run build` - Compile TypeScript
- `npm run check` - Run full validation (depcheck, prettier, eslint, tsc)
- `npm run start` - Watch mode compilation
- `npm run clean` - Remove build artifacts

### Demo Applications

#### Next.js Client Demo

```bash
npm run start --workspace=demo
# Open http://localhost:3000
```

#### Koa.js Server Demo

```bash
npm run start --workspace=demo-server
# Server runs on http://localhost:8080
```

## Package Structure

```
├── types/          # Shared TypeScript types and utilities
├── client/         # Client-side ping functionality  
├── server/         # Server-side pong functionality
├── demo/           # Next.js demo application
├── demo-server/    # Koa.js demo server
└── README.md       # This file
```

## API Reference

### Client API (`@cs124/pingpongws-client`)

#### `PingWS(ws, options?)`

Wraps a ReconnectingWebSocket to add ping functionality.

- **ws**: `ReconnectingWebSocket` - The WebSocket to wrap
- **options**: `PingPongOptions` - Configuration options
- **Returns**: `ReconnectingWebSocket` - The wrapped WebSocket

### Server API (`@cs124/pingpongws-server`)

#### `PongWS(ws, options?)`

Wraps a Node.js WebSocket to add pong functionality.

- **ws**: `WebSocket` - The WebSocket to wrap  
- **options**: `PingPongOptions` - Configuration options
- **Returns**: `WebSocket` - The wrapped WebSocket

### Types API (`@cs124/pingpongws-types`)

#### `filterPingPongMessages(handler)`

Creates a message handler that filters out ping-pong messages.

- **handler**: `(event: any) => void` - Your application message handler
- **Returns**: `(event: any) => void` - Filtered message handler

#### Message Types

```typescript
interface PingMessage {
  type: "ping"
  nonce: number
}

interface PongMessage {
  type: "pong" 
  nonce: number
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run check --workspaces --if-present` to validate
5. Submit a pull request

## License

MIT License - see individual package.json files for details.

## Version History

- **2025.7.1** - Latest release with npm workspace migration and script cleanup
- **2025.7.0** - Dependency updates and standardized scripts
- Uses date-based versioning: `YYYY.M.PATCH`