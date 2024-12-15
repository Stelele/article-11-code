import { resize } from "./helpers/resize"
import { Renderer } from "./Renderer"

start()
function start() {
  window.addEventListener('resize', resize)
  resize()

  const renderer = new Renderer()
  renderer.init()
} 