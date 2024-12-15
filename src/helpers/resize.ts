export function resize() {
    const canvas = document.getElementById("webgpu") as HTMLCanvasElement

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}