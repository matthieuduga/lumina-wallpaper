# Adding a New Wallpaper Module to Lumina

This step-by-step tutorial explains how to create, test, and register a new generative wallpaper style in Lumina.

---

## 1. Module File Architecture

Every wallpaper generator is isolated in its own folder under `src/modules/<module-id>/`:

```
src/modules/my-style/
├── index.ts          # Module registration & definition
├── shader.frag       # WebGL 2.0 Fragment Shader
└── controls.tsx      # Optional custom React controls
```

---

## 2. Define Parameters & Module Definition

In `src/modules/my-style/index.ts`:

```typescript
import { WallpaperModule, RenderOptions } from '../types';
import { createProgramFromSources } from '../../engine/webgl';
import fragmentShaderSource from './shader.frag?raw';

// 1. Define custom parameter interface
export interface MyStyleParams {
  frequency: number;
  intensity: number;
}

// 2. Define default parameters
export const defaultParams: MyStyleParams = {
  frequency: 1.5,
  intensity: 0.8,
};

// 3. Implement WallpaperModule interface
export const myStyleModule: WallpaperModule<MyStyleParams> = {
  id: 'my-style',
  name: 'My Style Name',
  description: 'A smooth flowing generative wallpaper.',
  defaultParams,

  renderWebGL: (gl: WebGL2RenderingContext, options: RenderOptions<MyStyleParams>) => {
    // Compile and set uniforms
    // Draw quad
  },
};
```

---

## 3. Register the Module

Open `src/modules/index.ts` and add your module:

```typescript
import { myStyleModule } from './my-style';

export const ALL_MODULES = [
  glassPillsModule,
  myStyleModule, // <--- Add here
];
```

That's it! Your module will immediately appear in Step 1 of Lumina's UI with custom controls, device sizing, color palettes, and high-resolution export fully wired up.
