import { useCallback, useEffect, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'

export interface WsEvent {
  type: string
  [key: string]: unknown
}

interface UseWsOptions {
  url: string
  onMessage?: (event: WsEvent) => void
}

export function useWs({ url, onMessage }: UseWsOptions) {
  const didUnmount = useRef(false)

  const { sendJsonMessage, lastJsonMessage, readyState, getWebSocket } = useWebSocket(url, {
    share: true, // 共享連線
    shouldReconnect: () => !didUnmount.current, // 自動重連（除非 unmount）
    reconnectAttempts: Infinity, // 無限重試
    reconnectInterval: (attemptNumber) =>
      Math.min(1000 * Math.pow(2, attemptNumber), 30000), // 指數退避，最多 30 秒
    retryOnError: true,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data) as WsEvent
        onMessage?.(data)
      } catch {
        console.error('[WS] Failed to parse message')
      }
    },
    onOpen: () => console.log('[WS] Connected'),
    onClose: () => console.log('[WS] Disconnected'),
    onError: (error) => console.error('[WS] Error:', error),
  })

  // 頁面 visibility 變化時檢查連線
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const ws = getWebSocket()
        if (ws && ws.readyState !== WebSocket.OPEN) {
          console.log('[WS] Page visible, reconnecting...')
          // react-use-websocket 會自動重連，這裡只是 log
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      didUnmount.current = true
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [getWebSocket])

  const isConnected = readyState === ReadyState.OPEN

  const sendChat = useCallback((content: string) => {
    sendJsonMessage({ type: 'chat', content })
  }, [sendJsonMessage])

  // 從 lastJsonMessage 取得 clientId
  const msg = lastJsonMessage as WsEvent | null
  const clientId = msg?.type === 'connected' ? (msg.clientId as string) : null

  return {
    isConnected,
    clientId,
    send: sendJsonMessage,
    sendChat,
    readyState,
  }
}

// Re-export for convenience
export { ReadyState }
