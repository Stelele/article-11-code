export const TestShader = /*wgsl*/ `
    struct Props {
        width: f32,
        height: f32,
        time: f32,
    }

    @group(0) @binding(0) var<uniform> props: Props;

    @vertex
    fn vs(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
        var pos: array<vec2f, 3> = array(
            vec2f(-1, 3),
            vec2f(-1, -1),
            vec2f( 3, -1),
        );

        return vec4f(pos[idx],0,1);
    }

    @fragment
    fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
        let t = props.time;

        var uv = pos.xy / vec2f(props.width, props.height);
        uv = 2 * vec2f(uv.x, -uv.y) + vec2f(-1, 1);
        uv.x *= props.width / props.height;

        var d = distance(uv, vec2f(0));
        d = sin(d * 30 + t * 4);
        d =  smoothstep(0.7, 0.71, d);

        return vec4f(d, d, d, 1);
    }
`