const new_ps_code = `#version 300 es

	precision highp float;


	uniform vec2 mouse_pos;
	uniform vec2 surface_size;
	uniform float time_ms;

	out vec4 outColor;

	float rand(float seed)
	{
		return fract( sin(dot(seed, 78.233)) * 43758.5453123);
	}

	void main() {
		vec2 uv = gl_FragCoord.xy / surface_size.xy;

		vec3 pix_color = vec3(1.0, 0.0, 0.0);

		outColor = vec4(pix_color, 1.0);
	}
`;