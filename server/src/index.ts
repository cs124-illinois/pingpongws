import {
  filterPingPongMessages,
  PingMessage,
  pingPongDefaultOptions,
  PingPongOptions,
  PongMessage,
} from "@cs124/pingpongws-types"
import type WebSocket from "ws"

export function PongWS(ws: WebSocket, o: PingPongOptions = {}): WebSocket {
  const { interval, timeout, verbose, useOtherMessages, usePingMessages, logDisconnects, logIdentifier } = {
    ...pingPongDefaultOptions,
    ...o,
  }

  let pongTimer: ReturnType<typeof setInterval>
  let nonce: number | undefined
  let pongTimeout: ReturnType<typeof setTimeout>
  let seenInterval = false

  function startPongTimer(): void {
    pongTimer = setInterval(() => {
      if (pongTimeout) {
        clearTimeout(pongTimeout)
      }
      if (seenInterval) {
        seenInterval = false
        return
      }
      nonce = Math.floor(Math.random() * 1024 * 1024)
      const identifier = (logIdentifier && ` (${logIdentifier()})`) || ""
      if (verbose) {
        console.debug(`${new Date().toISOString()}: -> pong ${nonce}${identifier}`)
      }
      ws.send(JSON.stringify(PongMessage.check({ type: "pong", nonce })))
      pongTimeout = setTimeout(() => {
        if (logDisconnects) {
          console.warn(`${new Date().toISOString()}: pong timeout: reconnecting${identifier}`)
        }
        ws.close()
      }, timeout)
    }, interval)
  }

  if (ws.readyState === ws.OPEN) {
    startPongTimer()
  } else {
    ws.addEventListener("open", startPongTimer)
  }
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data.toString())
    const identifier = (logIdentifier && ` (${logIdentifier()})`) || ""
    if (PongMessage.guard(message) && message.nonce === nonce && pongTimeout) {
      if (verbose) {
        console.debug(`${new Date().toISOString()}: <- pong ${nonce}${identifier}`)
      }
      clearTimeout(pongTimeout)
      if (usePingMessages) {
        seenInterval = true
        pongTimeout && clearTimeout(pongTimeout)
      }
    } else if (PingMessage.guard(message)) {
      ws.send(data)
    } else if (useOtherMessages) {
      if (verbose) {
        console.debug(`${new Date().toISOString()}: <- another message${identifier}`)
      }
      seenInterval = true
      pongTimeout && clearTimeout(pongTimeout)
    }
  })
  ws.addEventListener("close", () => {
    if (pongTimer) {
      clearInterval(pongTimer)
    }
    if (pongTimeout) {
      clearTimeout(pongTimeout)
    }
  })

  return ws
}

export { filterPingPongMessages }
