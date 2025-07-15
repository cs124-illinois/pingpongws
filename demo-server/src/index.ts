import { filterPingPongMessages, PongWS } from "@cs124/pingpongws-server"
import Router from "@koa/router"
import Koa from "koa"
import websocket from "koa-easy-ws"
import type WebSocket from "ws"

const router = new Router<Record<string, unknown>, { ws: () => Promise<WebSocket> }>()

const PORT = process.env.PORT || 8888

router.get("/", async (ctx) => {
  const ws = PongWS(await ctx.ws(), { verbose: true })
  ws.addEventListener(
    "message",
    filterPingPongMessages(async ({ data }) => {
      console.log(data)
    }),
  )
})

const app = new Koa().use(websocket()).use(router.routes()).use(router.allowedMethods())

Promise.resolve().then(async () => {
  const server = app.listen(PORT)
  server.requestTimeout = 0
  server.headersTimeout = 0
  setInterval(() => {
    server.getConnections((_, count) => {
      console.log(`${new Date()} ${count}`)
    })
  }, 60 * 1024)
})
