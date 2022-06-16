import {
  filterPingPongMessages,
  PingMessage,
  pingPongDefaultOptions,
  PingPongOptions,
  PongMessage,
} from "@cs124/pingpongws-types"
import type ReconnectingWebsocket from "reconnecting-websocket"

export function PingWS(ws: ReconnectingWebsocket, o: PingPongOptions = {}): ReconnectingWebsocket {
  const { interval, timeout, verbose, useOtherMessages } = { ...pingPongDefaultOptions, ...o }

  let pingTimer: ReturnType<typeof setInterval>
  let nonce: number | undefined
  let pingTimeout: ReturnType<typeof setTimeout>

  function startPingTimer(): void {
    pingTimer = setInterval(() => {
      if (pingTimeout) {
        clearTimeout(pingTimeout)
      }
      nonce = Math.floor(Math.random() * 1024 * 1024)
      if (verbose) {
        console.debug(`-> ping ${nonce}`)
      }
      ws.send(JSON.stringify(PingMessage.check({ type: "ping", nonce })))
      pingTimeout = setTimeout(() => {
        if (verbose) {
          console.warn("ping timeout: reconnecting")
        }
        ws.reconnect()
      }, timeout)
    }, interval)
  }

  if (ws.readyState === ws.OPEN) {
    startPingTimer()
  } else {
    ws.addEventListener("open", startPingTimer)
  }
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data)
    if (PingMessage.guard(message) && message.nonce === nonce && pingTimeout) {
      if (verbose) {
        console.debug(`<- ping ${nonce}`)
      }
      clearTimeout(pingTimeout)
    } else if (PongMessage.guard(message)) {
      ws.send(data)
    } else if (pingTimeout && useOtherMessages) {
      if (verbose) {
        console.debug(`<- another message`)
      }
      clearTimeout(pingTimeout)
    }
  })
  ws.addEventListener("close", () => {
    if (pingTimer) {
      clearInterval(pingTimer)
    }
    if (pingTimeout) {
      clearTimeout(pingTimeout)
    }
  })

  return ws
}

export { filterPingPongMessages }
