import TinyEmitter from "tiny-emitter"

const emitter = new TinyEmitter()
const ROUTE_CHANGE = "ROUTE_CHANGE"
const handlers = new Set()

let latestRoute = null

export function setRouteEmitter(to) {
  emitter.emit(ROUTE_CHANGE, to)
  latestRoute = to
}

export function listenerRouteChange(handler, immediate = true) {
  emitter.on(ROUTE_CHANGE, handler)
  handlers.add(handler)
  if (immediate && latestRoute) {
    handler(latestRoute)
  }

  return () => {
    emitter.off(ROUTE_CHANGE, handler)
    handlers.delete(handler)
  }
}

export function removeRouteListener(handler) {
  if (handler) {
    emitter.off(ROUTE_CHANGE, handler)
    handlers.delete(handler)
    return
  }
  handlers.forEach((item) => {
    emitter.off(ROUTE_CHANGE, item)
  })
  handlers.clear()
}
