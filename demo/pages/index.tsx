import { filterPingPongMessages, PingWS } from "@cs124/pingpongws-client"
import { useEffect, useRef, useState } from "react"
import ReconnectingWebSocket from "reconnecting-websocket"

const safeClose = (ws: ReconnectingWebSocket | undefined) => {
  if (!ws) {
    return
  }
  try {
    if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING) {
      return
    }
    if (ws.readyState === ws.OPEN) {
      ws.close()
    } else {
      ws.addEventListener("open", () => {
        if (ws.readyState !== ws.CLOSED && ws.readyState !== ws.CLOSING) {
          ws.close()
        }
      })
    }
  } catch (err) {
    console.log(err)
  }
}
const PingPongWSDemo: React.FC = () => {
  const [connected, setConnected] = useState(false)
  const connection = useRef<ReconnectingWebSocket | undefined>()

  useEffect(() => {
    safeClose(connection.current)
    connection.current = PingWS(new ReconnectingWebSocket(process.env.NEXT_PUBLIC_DEMO_SERVER as string), {
      verbose: true,
    })

    connection.current.addEventListener("open", () => {
      setConnected(true)
    })
    connection.current.addEventListener("close", () => {
      setConnected(false)
    })
    connection.current.addEventListener(
      "message",
      filterPingPongMessages(({ data }) => {
        console.log(data)
      })
    )
    return () => {
      safeClose(connection.current)
    }
  }, [])

  return <span>{connected ? "Connected" : "Not Connected"}</span>
}

export default function Home() {
  return (
    <>
      <h2>PingPongWS Demo</h2>
      <PingPongWSDemo />
    </>
  )
}
