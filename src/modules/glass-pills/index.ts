import { WallpaperModule, RenderOptions, PaletteSpec } from '../types';
import { GlassPillsParams, GlassPillsControls } from './controls';
import { createProgram, QUAD_VERTEX_SHADER, setupFullScreenQuad } from '../../engine/webgl';
import fragmentShaderSource from './shader.frag?raw';
import palettesData from './palettes.json';

export const glassPillsPalettes = palettesData as PaletteSpec[];

export const defaultGlassPillsParams: GlassPillsParams = {
  pillCount: 6,
  pillScale: 1.0,
  pillStagger: 0.0,
};

// Cache WebGL programs and VAOs per WebGL context to avoid re-compilation on every frame
interface ContextCache {
  program: WebGLProgram;
  vao: WebGLVertexArrayObject;
  locations: Record<string, WebGLUniformLocation>;
}

const contextCacheMap = new WeakMap<WebGL2RenderingContext, ContextCache>();

function getContextCache(gl: WebGL2RenderingContext): ContextCache {
  let cache = contextCacheMap.get(gl);
  if (cache) return cache;

  const program = createProgram(gl, QUAD_VERTEX_SHADER, fragmentShaderSource);
  const { vao } = setupFullScreenQuad(gl);

  const getLoc = (name: string) => {
    const loc = gl.getUniformLocation(program, name);
    if (!loc) console.warn(`Uniform ${name} not found in glass-pills shader`);
    return loc ?? ({} as WebGLUniformLocation);
  };

  const locations: Record<string, WebGLUniformLocation> = {
    u_resolution: getLoc('u_resolution'),
    u_pillCount: getLoc('u_pillCount'),
    u_pillScale: getLoc('u_pillScale'),
    u_pillStagger: getLoc('u_pillStagger'),
    u_isMobile: getLoc('u_isMobile'),
    u_isLight: getLoc('u_isLight'),
    u_bgDark: getLoc('u_bgDark'),
    u_bgLight: getLoc('u_bgLight'),
    u_seed: getLoc('u_seed'),
  };

  for (let i = 0; i < 5; i++) {
    locations[`u_leftRamp_${i}`] = getLoc(`u_leftRamp[${i}]`);
    locations[`u_rightRamp_${i}`] = getLoc(`u_rightRamp[${i}]`);
  }

  cache = { program, vao, locations };
  contextCacheMap.set(gl, cache);
  return cache;
}

export const glassPillsModule: WallpaperModule<GlassPillsParams> = {
  id: 'glass-pills',
  name: 'Glass Pills',
  description: 'Iconic translucent glass capsules with caustic specular lighting, rim highlights, and ambient glow.',
  defaultParams: defaultGlassPillsParams,
  palettes: glassPillsPalettes,
  defaultPalette: glassPillsPalettes[0],
  CustomControls: GlassPillsControls,

  renderWebGL: (gl: WebGL2RenderingContext, options: RenderOptions<GlassPillsParams>) => {
    const { program, vao, locations } = getContextCache(gl);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.viewport(0, 0, options.width, options.height);

    // Set standard uniforms
    gl.uniform2f(locations.u_resolution, options.width, options.height);
    gl.uniform1i(locations.u_pillCount, options.params.pillCount);
    gl.uniform1f(locations.u_pillScale, options.params.pillScale);
    gl.uniform1f(locations.u_pillStagger, options.params.pillStagger);
    gl.uniform1i(locations.u_isMobile, options.orientation === 'mobile' ? 1 : 0);
    gl.uniform1i(locations.u_isLight, options.theme === 'light' ? 1 : 0);
    gl.uniform3fv(locations.u_bgDark, options.bgDark);
    gl.uniform3fv(locations.u_bgLight, options.bgLight);
    gl.uniform1f(locations.u_seed, options.seed ?? 7.0);

    // Set 5 ramp stops
    for (let i = 0; i < 5; i++) {
      const left = options.leftRamp[i] || [0, 0, 0];
      const right = options.rightRamp[i] || [0, 0, 0];
      gl.uniform3fv(locations[`u_leftRamp_${i}`], left);
      gl.uniform3fv(locations[`u_rightRamp_${i}`], right);
    }

    // Draw full-screen quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindVertexArray(null);
  },
};
