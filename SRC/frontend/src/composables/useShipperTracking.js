import { ref, onUnmounted } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const WS_URL = `${API_BASE_URL.replace(/\/$/, '')}/ws`

export function useShipperTracking() {
  const shipperPos = ref(null) // { lat, lng }
  let client = null
  let subscription = null

  function connect(orderId, onPosition) {
    if (client) disconnect()
    client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        subscription = client.subscribe(`/topic/order/${orderId}`, (msg) => {
          try {
            const data = JSON.parse(msg.body)
            if (data.latitude != null && data.longitude != null) {
              const pos = { lat: Number(data.latitude), lng: Number(data.longitude) }
              shipperPos.value = pos
              onPosition && onPosition(pos)
            }
          } catch (_) {}
        })
      },
      onStompError: (frame) => {
        console.warn('[WS] STOMP error', frame)
      },
    })
    client.activate()
  }

  function disconnect() {
    if (subscription) {
      try { subscription.unsubscribe() } catch (_) {}
      subscription = null
    }
    if (client) {
      try { client.deactivate() } catch (_) {}
      client = null
    }
    shipperPos.value = null
  }

  function sendLocation(orderId, shipperId, lat, lng) {
    if (!client?.connected) return
    client.publish({
      destination: '/app/shipper/location',
      body: JSON.stringify({ orderId, shipperId, latitude: lat, longitude: lng }),
    })
  }

  onUnmounted(disconnect)

  return { shipperPos, connect, disconnect, sendLocation }
}
