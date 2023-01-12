import { filterPingPongMessages, PingWS } from "@cs124/pingpongws-client"
import { useEffect, useRef, useState } from "react"
import ReconnectingWebSocket from "reconnecting-websocket"

const PingPongWSDemo: React.FC = () => {
  const [connected, setConnected] = useState(false)
  const connection = useRef<ReconnectingWebSocket | undefined>()

  useEffect(() => {
    connection.current?.close()
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
      connection.current?.close()
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
