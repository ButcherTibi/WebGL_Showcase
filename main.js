'use strict';

// Shader Code
const stub_vs_code = `#version 300 es

	vec2 positions[3] = vec2[3](
		vec2(-1, +3),
		vec2(+3, -1),
		vec2(-1, -1)
	);

	void main() {
		gl_Position = vec4(positions[gl_VertexID], 0, 1);
	}
`;


// Globals
/**@type {WebGL2RenderingContext} */
let ctx = null;

/**@type {HTMLCanvasElement} */
let canvas = null;

/**@type {WebGLShader} */
let vertex_shader = null;

/**@type {WebGLShader} */
let fragment_shader = null;

/**@type {WebGLProgram} */
let program = null;

class Uniforms {
	constructor() {
		/**@type {WebGLUniformLocation} */
		this.mouse_pos_ul = null;
		/**@type {WebGLUniformLocation} */
		this.surface_size_ul = null;
		/**@type {WebGLUniformLocation} */
		this.time_ms_ul = null;

		this.mouse_pos = [ 0.0, 0.0 ];
		this.surface_size = [ 0.0, 0.0 ];
		this.time_ms = 0;
	}
};
let uniforms = new Uniforms();


class FragmentShaderCode {
	constructor() {
		this.name = "";
		this.code = "";
	}
}
/**@type {FragmentShaderCode[]} */
let fragment_shader_codes = [];

let active_shader_idx = 0;


/**
 * @param {GLenum} type
 * @param {string} code */
function createShader(type, code)
{
	let shader = ctx.createShader(type);
	ctx.shaderSource(shader, code);
	ctx.compileShader(shader);
	
	if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {

		let err = new Error();
		err.message = ctx.getShaderInfoLog(shader);

		ctx.deleteShader(shader);
		throw err;
	}
	return shader;
}


/**
 * @param {WebGLShader} vertex_shader
 * @param {WebGLShader} fragment_shader
 */
function createProgram(vertex_shader, fragment_shader)
{
	let program = ctx.createProgram();
	ctx.attachShader(program, vertex_shader);
	ctx.attachShader(program, fragment_shader);
	ctx.linkProgram(program);

	if (!ctx.getProgramParameter(program, ctx.LINK_STATUS)) {

		let err = new Error();
		err.message = ctx.getProgramInfoLog(program);

		ctx.deleteProgram(program);
		throw err;
	}

	return program;
}


function resizeBackbuffer()
{
	// Resize Backbuffer
	let display_width  = Math.round(canvas.clientWidth);
	let display_height = Math.round(canvas.clientHeight);

	canvas.width  = display_width;
	canvas.height = display_height;
}


/**
 * @param {WebGLProgram} program
 */
function draw()
{
	// Clear
	ctx.clearColor(0, 0, 0, 1);
	ctx.clear(ctx.COLOR_BUFFER_BIT);

	ctx.useProgram(program);

	// Uniforms
	{
		ctx.uniform2f(uniforms.mouse_pos_ul, uniforms.mouse_pos[0], uniforms.mouse_pos[1]);
		
		let dom_rect = canvas.getBoundingClientRect();
		ctx.uniform2f(uniforms.surface_size_ul, dom_rect.width, dom_rect.height);

		ctx.uniform1f(uniforms.time_ms_ul, performance.now());
	}

	// Viewport
	ctx.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

	// Draw
	ctx.drawArrays(ctx.TRIANGLES, 0, 3);
}

/**
 * @param {number} idx
 */
function switchShader(shader_idx)
{
	// Destroy
	if (program != null) {
		ctx.deleteProgram(program);
	}
	
	if (fragment_shader != null) {
		ctx.deleteShader(fragment_shader);
	}

	// Create
	fragment_shader = createShader(ctx.FRAGMENT_SHADER, fragment_shader_codes[shader_idx].code);
	program = createProgram(vertex_shader, fragment_shader);
	
	uniforms.mouse_pos_ul = ctx.getUniformLocation(program, "mouse_pos");
	uniforms.surface_size_ul = ctx.getUniformLocation(program, "surface_size");
	uniforms.time_ms_ul = ctx.getUniformLocation(program, "time_ms");

	active_shader_idx = shader_idx;

	// Label
	/**@type {HTMLParagraphElement} */
	let p_elem = document.getElementById("shader_name");
	p_elem.textContent = fragment_shader_codes[shader_idx].name;
}


window.onload = () => {
	/**@type {HTMLCanvasElement} */
	canvas = document.querySelector("#webgl_rendering_canvas");

	/**@type {WebGL2RenderingContext} */
	ctx = canvas.getContext('webgl2', {
		alpha: true,
		depth: false,
		stencil: false,
		antialias: false,
		premultipliedAlpha: true,
		preserveDrawingBuffer: false,
		powerPreference: "default",
		failIfMajorPerformanceCaveat: false,
		desynchronized: false,
	});

	if (ctx == null) {
		alert("WebGL 2.0 nu este suportat de către browser");
		return;
	}

	resizeBackbuffer();

	// Shaders
	vertex_shader = createShader(ctx.VERTEX_SHADER, stub_vs_code);

	fragment_shader_codes = [
		{name: "Strands", code: strands_ps_code},
		{name: "", code: new_ps_code}
	];

	switchShader(0);

	// Get mouse position
	canvas.onmousemove = (mouse_ev) => {
		uniforms.mouse_pos = [ mouse_ev.offsetX, mouse_ev.offsetY ];
	};

	window.onresize = () => {
		resizeBackbuffer();
		draw();
	}

	window.setInterval(function() {
		draw();
	}, 16.6);

	/**@type {HTMLButtonElement} */
	let next_btn = document.getElementById("next");

	next_btn.onclick = () => {
		if (active_shader_idx == fragment_shader_codes.length - 1) {
			switchShader(0);
		}
		else {
			switchShader(active_shader_idx + 1);
		}
	};

	/**@type {HTMLButtonElement} */
	let prev_btn = document.getElementById("prev");

	prev_btn.onclick = () => {
		if (active_shader_idx == 0) {
			switchShader(fragment_shader_codes.length - 1);
		}
		else {
			switchShader(active_shader_idx - 1);
		}
	};
};


// window.onunload = () => {
// 	// not sure
// };