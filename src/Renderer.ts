import { TestShader } from "./shaders/test.shader"

export class Renderer {
    // Basic props
    private canvas!: HTMLCanvasElement
    private device!: GPUDevice
    private presentationFormat!: GPUTextureFormat
    private context!: GPUCanvasContext

    // pipeline setup
    private pipeline!: GPURenderPipeline
    private renderPassDescriptor!: GPURenderPassDescriptor

    // buffers
    private propsBuffer!: GPUBuffer

    // bind groups
    private bindGroup!: GPUBindGroup
    private bindGroupLayout!: GPUBindGroupLayout

    public async init() {
        await this.setupDevice()
        this.initPipeline()
        this.initBuffers()
        this.initRenderPassDescriptor()
        this.startAnimation(60)
    }

    private async setupDevice() {
        const canvas = document.getElementById("webgpu") as HTMLCanvasElement
        this.canvas = canvas

        const adapter = await navigator.gpu.requestAdapter()
        const device = await adapter?.requestDevice()
        if (!device) {
            throw new Error("No device")
        }
        this.device = device

        this.presentationFormat = navigator.gpu.getPreferredCanvasFormat()
        const context = canvas.getContext("webgpu")
        if (!context) {
            throw new Error("No context")
        }
        this.context = context

        this.context.configure({
            device: this.device,
            format: this.presentationFormat
        })
    }

    private initPipeline() {
        const module = this.device.createShaderModule({
            label: "Shader",
            code: TestShader
        })

        this.bindGroupLayout = this.device.createBindGroupLayout({
            label: "Bind Group Layout",
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
                    buffer: { type: "uniform" }
                }
            ]
        })
        const pipeLineLayout = this.device.createPipelineLayout({
            label: "Pipeline Layout",
            bindGroupLayouts: [this.bindGroupLayout]
        })

        this.pipeline = this.device.createRenderPipeline({
            label: "Render pipeline",
            layout: pipeLineLayout,
            vertex: {
                module
            },
            fragment: {
                module,
                targets: [{ format: this.presentationFormat }]
            }
        })
    }

    private initBuffers() {
        this.propsBuffer = this.device.createBuffer({
            label: "Props Buffer",
            size: 3 * 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.bindGroup = this.device.createBindGroup({
            label: "Bind group",
            layout: this.bindGroupLayout,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this.propsBuffer }
                }
            ]
        })
    }

    private initRenderPassDescriptor() {
        this.renderPassDescriptor = {
            label: "Render Pass Descriptor",
            // @ts-ignore
            colorAttachments: [{
                loadOp: "clear",
                storeOp: "store",
                clearValue: [0, 0, 0, 0]
            }]
        }
    }

    private startAnimation(fps: number) {
        const targetMs = 1000 / fps
        let prev = new Date()
        let time = 0

        const renderer = this
        animate()

        function animate() {
            const cur = new Date()
            const diff = cur.getTime() - prev.getTime()

            if (diff > targetMs) {
                time += targetMs / 1000
                renderer.render(time)
                prev = cur
            }

            requestAnimationFrame(animate)
        }

    }

    private render(time: number) {
        const view = this.context.getCurrentTexture().createView()
        for (const colorAttachment of this.renderPassDescriptor.colorAttachments) {
            if (colorAttachment) {
                colorAttachment.view = view
            }
        }

        const encoder = this.device.createCommandEncoder()
        const pass = encoder.beginRenderPass(this.renderPassDescriptor)

        pass.setPipeline(this.pipeline)

        const propsData = new Float32Array([
            this.canvas.width,
            this.canvas.height,
            time
        ])
        this.device.queue.writeBuffer(this.propsBuffer, 0, propsData)
        pass.setBindGroup(0, this.bindGroup)

        pass.draw(3)
        pass.end()

        this.device.queue.submit([encoder.finish()])

    }
}