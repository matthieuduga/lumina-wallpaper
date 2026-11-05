# AGENTS.md - Developer & AI Agent Guidelines for Lumina

Welcome to **Lumina Wallpaper Studio**. This document serves as the primary technical orientation for AI coding agents and human contributors working on this codebase.

---

## 1. Project Philosophy & Core Invariants

1. **100% Client-Side**: All graphics generation, palette interpolation, dynamic packaging, and downloads happen strictly inside the user's browser.
2. **Zero Backend & Zero Telemetry**: No APIs, no databases, no tracking scripts, no third-party CDNs for assets, and no server uploads.
3. **Pluggable & Modular Architecture**: The studio is designed to support multiple distinct wallpaper generators ("modules"). The initial flagship module is **Glass Pills** (`src/modules/glass-pills/`).
4. **Performance & Delight**: Live preview runs at 60 FPS via GPU (WebGL 2.0 shaders). Full-resolution export uses offscreen framebuffers with tiling fallbacks for ultra-high resolutions (up to 6K).
5. **Universal Accessibility**: Respects system preferences (`prefers-color-scheme`, `prefers-reduced-motion`), keyboard accessible, ARIA labels, and clean responsive design.

---

## 2. Directory Structure & Key Files

```
lumina-wallpaper/
├── .github/
│   ├── ISSUE_TEMPLATE/        # GitHub issue templates (bug, feature)
│   ├── workflows/             # CI and GitHub Pages deployment workflows
│   ├── dependabot.yml         # Automated dependency manager
│   └── pull_request_template.md
├── docs/
│   ├── ARCHITECTURE.md        # Technical architectural design document
│   └── ADDING_MODULES.md      # Recipe for adding new wallpaper generators
├── public/
│   ├── favicon.svg            # Vector logo
│   └── og-image.png           # Social share preview
├── src/
│   ├── data/
│   │   └── devices.json       # Curated device definitions and resolutions
│   ├── engine/
│   │   ├── math.ts            # Color conversion (Hex, RGB, OKLCH), interpolations
│   │   ├── randomizer.ts      # Harmonious palette generator with locking & seeds
│   │   ├── webgl.ts           # WebGL 2.0 compilation, FBO, texture management
│   │   ├── exporter.ts        # High-res rendering, PNG blob & ZIP generation
│   │   ├── heic.ts            # Dynamic ISOBMFF HEIC container assembler with apple_desktop:apr XMP
│   │   ├── share.ts           # Compact Base64URL state encoder & share link engine
│   │   └── storage.ts         # LocalStorage history & creations cache with rendered thumbnails
│   ├── modules/
│   │   ├── types.ts           # WallpaperModule interface & type definitions
│   │   ├── index.ts           # Central module registry
│   │   └── glass-pills/       # Glass Pills module (shader, controls, definition)
│   ├── guides/
│   │   └── guideContent.ts    # Multi-OS wallpaper setting guides (macOS, iOS, Windows, Android, Linux)
│   ├── i18n/
│   │   ├── index.ts           # Language loader & browser language detection
│   │   └── locales/           # Translation dictionaries (en.json, fr.json)
│   ├── ui/
│   │   ├── components/        # Header, Preview, Stepper, Step views (1 to 5)
│   │   └── App.tsx            # Application root state & layout
│   ├── index.css              # Tailwind CSS v4 styling & glassmorphic utility classes
│   └── main.tsx               # React DOM entry point
├── tests/                     # Vitest unit test suite
├── AGENTS.md                  # This file
├── CONTRIBUTING.md            # Community contribution guide
├── CODE_OF_CONDUCT.md         # Contributor Covenant Code of Conduct
├── SECURITY.md                # Security disclosure guidelines
└── README.md                  # Project overview & showcase
```

---

## 3. Essential Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on `http://localhost:3000` |
| `npm run build` | Typechecks with `tsc -b` and builds production bundle to `dist/` |
| `npm run preview` | Previews production build locally |
| `npm run test` | Executes unit test suite with Vitest |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run lint` | Lints TypeScript and React code with ESLint |
| `npm run format` | Formats files with Prettier |

---

## 4. How to Add a New Wallpaper Module (Step-by-Step Recipe)

When adding a new generative style (e.g., `mesh-gradient`, `wave-glass`, `geometric-rings`):

1. **Create the module directory**: `src/modules/<module-id>/`
2. **Implement parameters & controls** (optional):
   - Define a parameter type `interface MyModuleParams { ... }`
   - Provide custom React controls (sliders, select boxes) in `controls.tsx`.
3. **Write the WebGL 2.0 Fragment Shader**:
   - Provide standard uniforms:
     - `vec2 u_resolution` (viewport dimensions)
     - `bool u_isLight` (true for light theme, false for dark)
     - `vec3 u_bgDark`, `vec3 u_bgLight`
     - Palette arrays or colors passed by the rendering engine
     - Module-specific uniforms (e.g. scales, counts, animation offsets)
4. **Export the module definition** in `src/modules/<module-id>/index.ts` implementing `WallpaperModule`:
   ```typescript
   import { WallpaperModule } from '../types';

   export const myModule: WallpaperModule<MyParams> = {
     id: 'my-module',
     name: 'My Module Name',
     description: 'Short description of this wallpaper aesthetic.',
     defaultParams: { ... },
     CustomControls: MyControlsComponent,
     renderWebGL: (gl, options) => { ... }
   };
   ```
5. **Register the module** in `src/modules/index.ts`:
   ```typescript
   import { myModule } from './my-module';
   registerModule(myModule);
   ```
6. **Add Unit Tests**: Write verification tests in `tests/modules.test.ts`.

---

## 5. Coding & Contribution Rules for AI Agents

- **TypeScript Strictness**: No implicit `any`. Always specify clean types or interfaces for parameters, props, and return values.
- **No Heavy Libraries**: Never import heavy rendering frameworks (e.g., Three.js, Babylon) unless explicitly instructed. Keep bundle sizes minimal using lightweight native WebGL 2.0.
- **Pure Color Math**: All mathematical calculations (sigmoid, interpolation, OkLCH, HSL) must be implemented in pure TypeScript functions under `src/engine/math.ts` and covered by automated tests.
- **Self-Contained Translations**: Do not hardcode user-facing strings in UI components. Use keys in `src/i18n/locales/` (`en.json` and `fr.json`).
- **Preserve Documentation**: Maintain this file and all documentation files (`ARCHITECTURE.md`, `CONTRIBUTING.md`) updated whenever introducing structural changes.
