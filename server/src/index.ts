import {
  filterPingPongMessages,
  PingMessage,
  pingPongDefaultOptions,
  PingPongOptions,
  PongMessage,
} from "@cs124/pingpongws-types"
import type WebSocket from "ws"

export function PongWS(ws: WebSocket, o: PingPongOptions = {}): WebSocket {
  const { interval, timeout, verbose, useOtherMessages } = { ...pingPongDefaultOptions, ...o }

  let pongTimer: ReturnType<typeof setInterval>
  let nonce: number | undefined
  let pongTimeout: ReturnType<typeof setTimeout>

  function startPongTimer(): void {
    pongTimer = setInterval(() => {
      if (pongTimeout) {
        clearTimeout(pongTimeout)
      }
      nonce = Math.floor(Math.random() * 1024 * 1024)
      if (verbose) {
        console.debug(`-> pong ${nonce}`)
      }
      ws.send(JSON.stringify(PongMessage.check({ type: "pong", nonce })))
      pongTimeout = setTimeout(() => {
        if (verbose) {
          console.warn(`pong timeout: reconnecting`)
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
    const message = JSON.parse(data)
    if (PongMessage.guard(message) && message.nonce === nonce && pongTimeout) {
      if (verbose) {
        console.debug(`<- pong ${nonce}`)
      }
      clearTimeout(pongTimeout)
    } else if (PingMessage.guard(message)) {
      ws.send(data)
    } else if (pongTimeout && useOtherMessages) {
      if (verbose) {
        console.debug(`<- another message`)
      }
      clearTimeout(pongTimeout)
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
