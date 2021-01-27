const strands_ps_code = `#version 300 es

	precision highp float;


	uniform vec2 mouse_pos;
	uniform vec2 surface_size;
	uniform float time_ms;

	out vec4 outColor;

	float rand(float seed)
	{
		return fract( sin(dot(seed, 78.233)) * 43758.5453123);
	}

	float makeWave(vec2 uv,
		float freq_0, float speed_0, float amplitude_0, float phase_shift_0,
		float freq_1, float speed_1, float amplitude_1, float phase_shift_1)
	{
		float wave =
			sin(uv.x * freq_0 + time_ms / speed_0 + phase_shift_0) * amplitude_0 +
			sin(uv.x * freq_1 + time_ms / speed_1 + phase_shift_1) * amplitude_1;
		return (wave + 1.) / 2.;
	}

	vec3 mix3(vec3 color_0, vec3 color_1, vec3 color_2, float a)
	{
		if (a < 0.5) {
			return mix(color_0, color_1, a / 0.5);
		}
		else {
			return mix(color_1, color_2, (a - 0.5) / 0.5);
		}
	}

	void main() {
		vec2 uv = gl_FragCoord.xy / surface_size.xy;

		vec3 pix_color = vec3(0.0);
		float line_count = 20.;
		float overlap_count = 0.0;

		vec2 freq_0 = vec2(2., 4.);
		vec2 freq_1 = vec2(2., 4.);
		vec2 speed_0 = vec2(1500.0, 2500.0);
		vec2 speed_1 = vec2(2000.0, 3000.0);
		vec2 amplitude_0 = vec2(0.5, 0.5);
		vec2 amplitude_1 = vec2(0.5, 0.5);
		vec2 phase_shift_0 = vec2(0.0, 6.28);
		vec2 phase_shift_1 = vec2(0.0, 6.28);
		vec2 thickness = vec2(0.01, 0.03);
		vec3 color_0 = vec3(0.0, 1.0, 0.0);
		vec3 color_1 = vec3(0.0, 1.0, 1.0);
		vec3 color_2 = vec3(0.0, 0.0, 1.0);

		for (float i = 0.; i < line_count; i += 1.) {

			float r = rand(i);
			float r1 = rand(i + 1756.2345432);

			float f0 = mix(freq_0.x, freq_0.y, r);
			float f1 = mix(freq_1.x, freq_1.y, r1);
			float s0 = mix(speed_0.x, speed_0.y, r);
			float s1 = mix(speed_1.x, speed_1.y, r1);
			float a0 = mix(amplitude_0.x, amplitude_0.y, r);
			float a1 = mix(amplitude_1.x, amplitude_1.y, r1);
			float p0 = mix(phase_shift_0.x, phase_shift_0.x, r);
			float p1 = mix(phase_shift_1.x, phase_shift_1.x, r1);

			float wave_0 = makeWave(uv,
				f0, s0, a0, p0,
				f1, s1, a1, p1);

			float wave_1 = makeWave(uv,
				f1, s0 * 0.5, a0, p1,
				f0, s1 * 0.5, a1, p0);
	
			float t = mix(thickness.x, thickness.y, r);
			float lower = wave_0 - t;
			float upper = wave_0 + t;
	
			if (lower < uv.y && uv.y < upper) {
				
				float thickness_fade = 1. - (distance((lower + upper) / 2.0, uv.y) / (upper - lower));
				thickness_fade = smoothstep(0.0, 0.8, thickness_fade);
				
				vec3 color = mix3(color_0, color_1, color_2, r);
				pix_color += color * wave_1 * thickness_fade;
				overlap_count += 1.;
			}
		}

		pix_color /= overlap_count;

		outColor = vec4(pix_color, 1.0);
	}
`;