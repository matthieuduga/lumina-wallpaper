# Contributing to Lumina

Thank you for your interest in contributing to **Lumina Wallpaper Studio**! We welcome contributions from developers, designers, and AI agents alike.

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## How Can You Contribute?

### 1. Adding New Wallpapers (Modules)
Lumina is designed to be extensible. If you have an idea for a generative or mathematical wallpaper style (e.g. mesh gradients, auroras, geometric prisms):
- Check [docs/ADDING_MODULES.md](docs/ADDING_MODULES.md) for a complete step-by-step tutorial.
- Each module lives in `src/modules/<module-id>/` and plugs into the central registry.

### 2. Adding Devices & Screen Resolutions
We aim to keep our device catalog accurate and up to date:
- Edit `src/data/devices.json`.
- Provide official, sourced specifications (native resolution, orientation preference, display scale).
- Run `npm run test` to validate the JSON schema.

### 3. Adding Palettes
Have a beautiful color combination?
- Edit `src/data/palettes.json`.
- Specify: `id`, `name`, `bgDark`, `leftRamp` (5 hex colors), `rightRamp` (5 hex colors), and optional `bgLight`.
- Palettes are tested automatically by `tests/palettes.test.ts`.

### 4. Adding Translations (i18n)
Lumina supports multiple languages out of the box:
- Add a new locale dictionary in `src/i18n/locales/<lang-code>.json` (e.g., `de.json`, `es.json`, `ja.json`).
- Register the locale in `src/i18n/index.ts`.

---

## Development Workflow

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/lumina-wallpaper.git
   cd lumina-wallpaper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Run tests & linters before submitting**:
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

5. **Submit a Pull Request**:
   - Use conventional commit messages (`feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`).
   - Fill out the PR template.
