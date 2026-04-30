/**
 * useWebSocket - Generic reconnecting WebSocket hook (TDR §9.4).
 *
 * Features:
 *  - JWT authentication via Sec-WebSocket-Protocol header trick
 *    (browsers don't allow custom headers on WS connections, so the token
 *     is passed as the second protocol value and the backend echoes it back)
 *  - Exponential back-off reconnect (1 s → 2 s → 4 s … cap 30 s)
 *  - Heartbeat / ping-pong to detect silent drops (every 25 s)
 *  - Clean teardown on unmount or when `enabled` becomes false
 *  - Connection status exposed for UI banners
 *
 * Usage:
 *   const { status, lastMessage, sendMessage } = useWebSocket({
 *     url: 'wss://api.example.com/ws/live',
 *     token: 'eyJ...',
 *     onMessage: (event) => { ... },
 *     enabled: isAuthenticated,
 *   })
 *
 * TDR §9.4 spec:
 *   - Dashboard subscribes to /ws/live with JWT in Sec-WebSocket-Protocol
 *   - Two event types: sensor.update and decision.new
 *   - No polling needed — backend pushes updates
 */

import { useEffect, useRef, useCallback, useState } from 'react'

/** WebSocket connection states exposed to consumers. */
export const WS_STATUS = {
  CONNECTING:   'CONNECTING',
  CONNECTED:    'CONNECTED',
  RECONNECTING: 'RECONNECTING',
  DISCONNECTED: 'DISCONNECTED',
}

const HEARTBEAT_INTERVAL_MS = 25_000   // send ping every 25 s
const MAX_BACKOFF_MS        = 30_000   // cap reconnect delay at 30 s
const BASE_BACKOFF_MS       = 1_000    // initial reconnect delay

/**
 * @param {object}   opts
 * @param {string}   opts.url          - WebSocket URL (wss://…)
 * @param {string}   [opts.token]      - JWT access token; re-connects when changed
 * @param {Function} [opts.onMessage]  - Called with each MessageEvent
 * @param {Function} [opts.onStatusChange] - Called with WS_STATUS value on every change
 * @param {boolean}  [opts.enabled]    - Set false to skip connecting (e.g. not logged in)
 * @returns {{ status: string, sendMessage: Function }}
 */
export function useWebSocket({ url, token, onMessage, onStatusChange, enabled = true }) {
  const [status, setStatus] = useState(WS_STATUS.DISCONNECTED)

  // Refs so callbacks can read the latest values without re-triggering effects
  const wsRef           = useRef(null)   // the live WebSocket instance
  const retryCountRef   = useRef(0)
  const retryTimerRef   = useRef(null)
  const heartbeatRef    = useRef(null)
  const onMessageRef    = useRef(onMessage)
  const onStatusRef     = useRef(onStatusChange)
  const unmountedRef    = useRef(false)
  const connectRef      = useRef(null)

  // Keep callback refs up to date without re-running the connection effect
  useEffect(() => { onMessageRef.current = onMessage }, [onMessage])
  useEffect(() => { onStatusRef.current = onStatusChange }, [onStatusChange])

  /** Update status both locally and via callback. */
  const updateStatus = useCallback((next) => {
    setStatus(next)
    onStatusRef.current?.(next)
  }, [])

  function stopHeartbeat() {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = null
    }
  }

  /** Close the current socket cleanly without triggering a reconnect. */
  const closeSocket = useCallback(() => {
    stopHeartbeat()
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    if (wsRef.current) {
      // Remove handlers before calling close() so onclose doesn't fire
      wsRef.current.onopen    = null
      wsRef.current.onmessage = null
      wsRef.current.onerror   = null
      wsRef.current.onclose   = null
      wsRef.current.close()
      wsRef.current = null
    }
  }, []) // stopHeartbeat is stable inside

  /** Start periodic ping to detect silent connection drops. */
  const startHeartbeat = useCallback(() => {
    stopHeartbeat()
    heartbeatRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }))
      }
    }, HEARTBEAT_INTERVAL_MS)
  }, [])

  /** Open a new WebSocket and wire up event handlers. */
  const connect = useCallback(() => {
    if (unmountedRef.current || !enabled) return

    updateStatus(retryCountRef.current > 0 ? WS_STATUS.RECONNECTING : WS_STATUS.CONNECTING)

    // TDR §9.4 — JWT is passed as the second subprotocol value because
    // the WebSocket API does not support custom headers in browsers.
    // The backend must echo the chosen protocol in the handshake response.
    const protocols = token
      ? ['irrigation-v1', token]
      : ['irrigation-v1']

    let ws
    try {
      ws = new WebSocket(url, protocols)
    } catch (err) {
      // URL may be invalid in development (no backend) — schedule retry
      console.warn('[WS] Failed to create socket:', err.message)
      const delay = Math.min(
        BASE_BACKOFF_MS * 2 ** retryCountRef.current,
        MAX_BACKOFF_MS
      )
      retryCountRef.current += 1
      updateStatus(WS_STATUS.RECONNECTING)
      retryTimerRef.current = setTimeout(() => connectRef.current?.(), delay)
      return
    }

    wsRef.current = ws

    ws.onopen = () => {
      if (unmountedRef.current) { ws.close(); return }
      retryCountRef.current = 0
      updateStatus(WS_STATUS.CONNECTED)
      startHeartbeat()
    }

    ws.onmessage = (event) => {
      // Ignore pong frames
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'pong') return
      } catch { /* non-JSON frame — pass through */ }
      onMessageRef.current?.(event)
    }

    ws.onerror = () => {
      // onerror is always followed by onclose — let onclose handle reconnect
    }

    ws.onclose = () => {
      stopHeartbeat()
      wsRef.current = null
      if (unmountedRef.current || !enabled) {
        updateStatus(WS_STATUS.DISCONNECTED)
        return
      }
      // 1000 = Normal closure (e.g. server restart for maintenance)
      // 1001 = Going away — both are expected and we should reconnect
      
      const delay = Math.min(
        BASE_BACKOFF_MS * 2 ** retryCountRef.current,
        MAX_BACKOFF_MS
      )
      retryCountRef.current += 1
      updateStatus(WS_STATUS.RECONNECTING)
      retryTimerRef.current = setTimeout(() => connectRef.current?.(), delay)
    }
  }, [url, token, enabled, updateStatus, startHeartbeat, closeSocket]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keep connectRef up to date
  useEffect(() => { connectRef.current = connect }, [connect])

  // Main effect — open socket when url/token/enabled changes, close on cleanup
  useEffect(() => {
    unmountedRef.current = false

    if (!enabled || !url) {
      closeSocket()
      // Use setTimeout to avoid synchronous setState during render if called during unmount/cleanup
      setTimeout(() => updateStatus(WS_STATUS.DISCONNECTED), 0)
      return
    }

    retryCountRef.current = 0
    // Wrap connect in setTimeout to avoid sync setState in effect if updateStatus is called immediately
    setTimeout(() => connectRef.current?.(), 0)

    return () => {
      unmountedRef.current = true
      closeSocket()
    }
  }, [url, token, enabled, closeSocket, updateStatus])

  /** Send a JSON message to the server (no-op if not connected). */
  const sendMessage = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
    }
  }, [])

  return { status, sendMessage }
}
