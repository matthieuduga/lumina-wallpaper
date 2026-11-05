# 🌟 Lumina — Generative Wallpaper Studio

> **Lumina** is an elegant, 100% client-side web application for generating high-fidelity, customizable wallpapers for any device. Built with Vite, React 19, TypeScript, Tailwind CSS v4, and native WebGL 2.0 shaders.

[![Deploy to GitHub Pages](https://github.com/matthieuduga/lumina-wallpaper/actions/workflows/deploy.yml/badge.svg)](https://github.com/matthieuduga/lumina-wallpaper/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Telemetry](https://img.shields.io/badge/Telemetry-0%25-brightgreen.svg)](#privacy--security)
[![Client-Side](https://img.shields.io/badge/Render-100%25%20Client--Side-purple.svg)](#architecture)

**🚀 Live Website:** [https://matthieuduga.github.io/lumina-wallpaper/](https://matthieuduga.github.io/lumina-wallpaper/)

---

## ✨ Features

- **⚡ 60 FPS Real-time WebGL Engine**: Live GPU-computed preview powered by GLSL ES 3.0 fragment shaders. Instant updates when adjusting sliders, colors, or device presets.
- **📱 Officially Sourced Device Catalog**: Curated resolutions for:
  - **Apple Mac**: MacBook Air (13" & 15" M2/M3, 13" M1), MacBook Pro (14" & 16" M1–M4), iMac 24" 4.5K, Studio Display 5K, Pro Display XDR 6K.
  - **Apple iPhone**: iPhone 18 Pro Max, 17 Pro Max, 16 Pro Max, 18 Pro, 17 Pro, 16 Pro, iPhone Air, iPhone 16 Plus, 16, 16e, 15 series, 14, 13 mini, SE.
  - **Apple iPad**: iPad Pro 13" & 11" (M4 Tandem OLED), iPad Air 13" & 11" (M2), iPad 10th Gen, iPad 9th Gen, iPad mini (A17 Pro).
  - **PC & Displays**: Full HD (1080p), QHD (1440p), 4K UHD, 5K UHD, Ultrawide (3440×1440), Super Ultrawide (5120×1440), Dual 4K 32:9 (7680×2160).
  - **Android**: Samsung Galaxy S25 Ultra, S25+, S25, Galaxy Z Fold 6, Galaxy Z Flip 6, Google Pixel 9 Pro XL, Pixel 9 Pro, Pixel 9, Pixel 8a.
  - **Custom Screen**: Automatic one-click detection of your active screen's physical pixel resolution (`window.screen.width * devicePixelRatio`).
- **💊 Flagship Module: Glass Pills**: Translucent glass capsules with caustic specular lighting, rim highlights, ambient glows, and high-frequency dithering grain.
- **🎨 3 Color Modes**:
  1. **16 Curated Palettes**: Ported from original aesthetic formulations (`bleu_cyan`, `aurore`, `violet_blanc`, `vert_lime`, `graphite`, etc.).
  2. **Harmonious Randomizer**: Seedable generator utilizing the perceptual **OkLCH** color space (analogous, complementary, split-complementary, triadic) with lockable ramps and roll history.
  3. **Custom Color Lab**: Full hex color pickers for background and 2 × 5 ramp stops, JSON import/export, and 1-click shareable URLs.
- **🌓 Light, Dark & Auto macOS Dynamic**:
  - Direct hardware-accelerated **Apple Dynamic .HEIC** generation on compatible browsers (Chrome, Safari macOS).
  - **Auto Dual Pack** mode: Exports paired Light & Dark PNGs in a convenient ZIP archive.
  - Live interactive preview alternator: 1-click switch between Light and Dark rendering for dynamic wallpapers directly in the preview header.
- **🔗 Ultra-Short URLs**: Bit-packed Base62 engine producing ~4-to-7-character share links (e.g. `#c/zcg8`), 100% client-side without third-party URL shorteners.
- **🖼️ Creations History**: LocalStorage caching with instant WebGL thumbnail snapshots and Command Palette modal to search, reload, share, or manage created wallpapers.
- **📖 Contextual Setup Guides**: Built-in step-by-step installation guides tailored for macOS, iOS, iPadOS, Windows 10/11, Android, and Linux (GNOME/KDE). 100% manual, secure, and script-free.
- **🌍 Internationalization (i18n)**: English and French out of the box with automatic browser language detection and a Command Palette style selector. Ready for community translations.
- **🤖 AI Agents Friendly**: Includes a dedicated [AGENTS.md](AGENTS.md) guide explaining codebase mental models, test scripts, and recipes for adding new wallpaper modules.

---

## 🚀 Quickstart & Development

### Prerequisites
- Node.js 20+
- npm 10+

### Setup

```bash
# Clone the repository
git clone https://github.com/matthieuduga/lumina-wallpaper.git
cd lumina-wallpaper

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts local development server on port 3000 |
| `npm run build` | Compiles TypeScript and builds production bundle to `dist/` |
| `npm run preview` | Locally serves the production `dist/` build |
| `npm run test` | Runs the Vitest test suite |
| `npm run lint` | Lints TypeScript and React source files with ESLint |
| `npm run format` | Auto-formats code with Prettier |

---

## 🌐 Deploying to GitHub Pages

This repository is configured for automated deployment to **GitHub Pages** via GitHub Actions:

1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings > Pages**.
3. Under **Build and deployment > Source**, select **GitHub Actions**.
4. Every push to the `main` branch will automatically test, build, and deploy your live site!

---

## 🧩 Adding New Wallpaper Modules

Lumina is designed from the ground up to be modular. To add a new generative wallpaper style:
1. Review the architecture guide: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
2. Follow the tutorial: [docs/ADDING_MODULES.md](docs/ADDING_MODULES.md).
3. Implement your module under `src/modules/<your-style>/` and register it in `src/modules/index.ts`.

---

## 🔒 Privacy & Security

- **Zero Network Traffic**: Lumina executes 100% within your client browser. No images, palettes, or screen resolutions are ever uploaded to any server.
- **No Cookies or Tracking**: Zero tracking pixels, zero analytics libraries, zero advertising scripts.

---

## 🤝 Contributing

Contributions, bug reports, and new palette/module ideas are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md) before submitting a pull request.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
