import { Boolean, Literal, Number, Partial, Record, Static, Union } from "runtypes"

export const PingMessage = Record({
  type: Literal("ping"),
  nonce: Number,
})
export type PingMessage = Static<typeof PingMessage>

export const PongMessage = Record({
  type: Literal("pong"),
  nonce: Number,
})
export type PongMessage = Static<typeof PongMessage>

export const PingPongMessages = Union(PingMessage, PongMessage)
export type PingPongMessages = PingMessage | PongMessage

export const PingPongOptions = Partial({
  interval: Number,
  timeout: Number,
  verbose: Boolean,
})
export type PingPongOptions = Static<typeof PingPongOptions>
export const pingPongDefaultOptions = {
  interval: 8000,
  timeout: 1000,
  verbose: false,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type messageHandler = (event: any) => void

export function filterPingPongMessages(listener: messageHandler): messageHandler {
  return (event): void => {
    try {
      const message = JSON.parse(event.data as string)
      if (PingPongMessages.guard(message)) {
        return
      }
      // eslint-disable-next-line no-empty
    } catch (err) {}
    return listener(event)
  }
}
