import { useCallback, useRef } from 'react'

const MOVE_TOLERANCE = 10

export default function useLongPress(onLongPress, delay = 600) {
  const timer = useRef(null)
  const origin = useRef(null)

  const stop = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
    origin.current = null
  }, [])

  const onPointerDown = useCallback(
    (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return
      stop()
      origin.current = { x: event.clientX, y: event.clientY }
      timer.current = setTimeout(() => {
        timer.current = null
        origin.current = null
        onLongPress()
      }, delay)
    },
    [onLongPress, delay, stop]
  )

  const onPointerMove = useCallback(
    (event) => {
      const start = origin.current
      if (!start) return
      if (Math.abs(event.clientX - start.x) > MOVE_TOLERANCE || Math.abs(event.clientY - start.y) > MOVE_TOLERANCE) {
        stop()
      }
    },
    [stop]
  )

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    onContextMenu: (event) => event.preventDefault()
  }
}
