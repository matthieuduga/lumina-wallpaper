# Security Policy

## Supported Versions

Lumina is a static client-side web application deployed directly from the `main` branch.

| Version | Supported |
| :--- | :--- |
| Latest `main` | :white_check_mark: |
| Older releases | :x: |

---

## Client-Side Security Guarantees

- **No Remote Processing**: All rendering calculations, pixel manipulation, and file downloads are performed locally within your browser's sandboxed JavaScript/WebGL context.
- **Zero Telemetry**: Lumina does not load tracking scripts, analytics, or external tracking pixels.
- **No Third-Party Asset Leaks**: All font files, styles, and scripts are bundled statically.

---

## Reporting a Vulnerability

If you discover a security concern (e.g. dependency vulnerability, XSS risk in URL hash parsing):
1. Please open a private security advisory on GitHub or email the maintainers directly.
2. We strive to address verified security concerns promptly.
