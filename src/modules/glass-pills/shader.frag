#version 300 es
precision highp float;
precision highp int;

in vec2 v_uv;
out vec4 fragColor;

uniform vec2 u_resolution;
uniform int u_pillCount;       // Default 6 (range 3..12)
uniform float u_pillScale;     // Default 1.0 (range 0.5..2.0)
uniform float u_pillStagger;   // Default 0.0 (range -1.0..1.0)
uniform bool u_isMobile;       // true = horizontal pills stacked, false = vertical pills side-by-side
uniform bool u_isLight;        // true = light, false = dark
uniform vec3 u_bgDark;
uniform vec3 u_bgLight;
uniform vec3 u_leftRamp[5];
uniform vec3 u_rightRamp[5];
uniform float u_seed;

const int MAX_PILLS = 16;
const vec3 WHITE = vec3(1.0);

float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-clamp(x, -30.0, 30.0)));
}

// Pseudo-random noise for dithering
float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

// Evaluates the light-mode ramp transformation
vec3 getLightRampStop(vec3 r[5], int idx) {
    if (idx == 0) return mix(r[1], r[2], 0.35);
    if (idx == 1) return mix(r[1], r[2], 0.80);
    if (idx == 2) return mix(r[2], r[3], 0.35);
    if (idx == 3) return mix(r[3], r[4], 0.45);
    return mix(r[4], WHITE, 0.50);
}

// Evaluates the colormap at lightness L across stops [0.0, 0.22, 0.5, 0.75, 1.0]
vec3 sampleCmap(float L, vec3 r[5]) {
    float cL = clamp(L, 0.0, 1.0);
    if (cL <= 0.0) return r[0];
    if (cL < 0.22) {
        float t = cL / 0.22;
        return mix(r[0], r[1], t);
    }
    if (cL < 0.50) {
        float t = (cL - 0.22) / (0.50 - 0.22);
        return mix(r[1], r[2], t);
    }
    if (cL < 0.75) {
        float t = (cL - 0.50) / (0.75 - 0.50);
        return mix(r[2], r[3], t);
    }
    if (cL < 1.0) {
        float t = (cL - 0.75) / (1.0 - 0.75);
        return mix(r[3], r[4], t);
    }
    return r[4];
}

void main() {
    float W = u_resolution.x;
    float H = u_resolution.y;

    // Convert WebGL bottom-left coords to top-left coords (matching Python image coordinates)
    float x = gl_FragCoord.x;
    float y = H - gl_FragCoord.y;

    // Background radial gradient
    vec3 tint = (u_leftRamp[2] + u_rightRamp[2]) * 0.5;
    float radNormX = (x - W * 0.5) / (W * 0.5);
    float radNormY = (y - H * 0.5) / (H * 0.5);
    float rad = sqrt(radNormX * radNormX + radNormY * radNormY);

    vec3 imgColor;
    if (u_isLight) {
        vec3 base = u_bgLight;
        vec3 edge = base * 0.92;
        vec3 center = mix(base, WHITE, 0.55);
        float c = pow(clamp(1.0 - rad * 0.75, 0.0, 1.0), 1.5);
        imgColor = edge + (center - edge) * c;
    } else {
        float c = pow(clamp(1.0 - rad * 0.80, 0.0, 1.0), 2.0);
        imgColor = u_bgDark + 0.10 * tint * c;
    }

    int N = clamp(u_pillCount, 1, MAX_PILLS);
    float SCALE = u_pillScale;
    float STAGGER = u_pillStagger;

    // Geometry scaling
    float refDim = u_isMobile ? W : H;
    float pw = 0.1803 * refDim * SCALE;
    float ph = 0.4177 * refDim * SCALE;
    float pitch = 0.137 * refDim * SCALE;
    float s = pw / 600.0;

    for (int i = 0; i < MAX_PILLS; i++) {
        if (i >= N) break;

        float k = float(i) - float(N - 1) * 0.5;
        float kk = (N > 1) ? k / (float(N - 1) * 0.5) : 0.0;
        float t = (N > 1) ? float(i) / float(N - 1) : 0.0;

        // Interpolate left & right palettes
        vec3 r[5];
        for (int stopIdx = 0; stopIdx < 5; stopIdx++) {
            vec3 rd = mix(u_leftRamp[stopIdx], u_rightRamp[stopIdx], t);
            r[stopIdx] = u_isLight ? getLightRampStop(u_leftRamp, stopIdx) : rd;
        }

        // Pill positioning & dimensions
        float cx, cy, w, h;
        if (u_isMobile) {
            // Mobile: horizontal capsules stacked vertically
            cx = W * 0.5 + k * 14.0 * s * STAGGER;
            cy = H * 0.5 + k * pitch;
            w = ph;
            h = pw + float(i) * 8.0 * s * STAGGER;
        } else {
            // Desktop: vertical capsules placed horizontally side-by-side
            cx = W * 0.5 + k * pitch;
            cy = H * 0.5 + k * 14.0 * s * STAGGER;
            w = pw;
            h = ph + float(i) * 8.0 * s * STAGGER;
        }

        float px = x - cx;
        float py = y - cy;

        // Signed Distance Field (SDF) of capsule
        float d, nx, ny, vn, un, rr;
        if (u_isMobile) {
            // Horizontal capsule: half length along X, radius along Y
            rr = h * 0.5;
            float halfLen = w * 0.5 - rr;
            float dx = px - clamp(px, -halfLen, halfLen);
            float dist = sqrt(dx * dx + py * py) + 1e-6;
            nx = dx / dist;
            ny = py / dist;
            vn = px / (w * 0.5);
            un = py / rr;
            d = dist - rr;
        } else {
            // Vertical capsule: half length along Y, radius along X
            rr = w * 0.5;
            float halfLen = h * 0.5 - rr;
            float dy = py - clamp(py, -halfLen, halfLen);
            float dist = sqrt(px * px + dy * dy) + 1e-6;
            nx = px / dist;
            ny = dy / dist;
            vn = py / (h * 0.5);
            un = px / rr;
            d = dist - rr;
        }

        float aa = clamp(0.5 - d, 0.0, 1.0);
        float inside = d < 0.0 ? 1.0 : 0.0;
        float depth = inside * (-d);

        // Gradient & specular illumination curve
        float arg = (-vn * 1.5 - 0.05 - un * 0.55 + 0.35 * kk * (-un) + 0.5 * kk + 0.10 * sin(float(i) * 1.7)) * 3.0;
        float sigVal = sigmoid(arg);
        float L = 0.06 + 0.65 * pow(sigVal, 1.1);
        L += 0.14 * exp(-depth / (0.16 * rr));
        L += 0.12 * (0.5 + 0.5 * sin(un * 3.5 + float(i) * 0.8)) * exp(-depth / (0.25 * rr));

        float bottom = clamp((vn + 0.1) / 0.85, 0.0, 1.0);
        float streak = 0.5 + 0.5 * sin((-d * 0.025 / s) - un * 1.6 + float(i) * 1.3);
        L += bottom * 0.25 * streak * exp(-depth / (0.4 * rr)) * (un * 0.3 + 0.7);

        vec3 col = sampleCmap(L, r);
        float a = aa * 0.90;
        float facing = clamp(nx * -0.55 + ny * -0.85, 0.0, 1.0);

        // Outside shadow (light theme) or diffuse glow (dark theme)
        if (d > 0.0) {
            if (u_isLight) {
                float sh = exp(-d / (70.0 * s)) * 0.20;
                imgColor = imgColor * (1.0 - sh) + (r[0] * 0.7 + 0.1) * sh;
            } else {
                float gl = exp(-d / (60.0 * s)) * (0.03 + 0.10 * facing);
                imgColor += gl * mix(r[2], r[3], 0.30);
            }
        }

        // Blend capsule body
        imgColor = imgColor * (1.0 - a) + col * a;

        // Rim lighting and internal reflections
        vec3 rimc = mix(r[3], r[4], 0.65);
        float rim = exp(-abs(d) / (4.5 * s)) * (0.22 + 0.90 * facing * facing);
        rim += exp(-abs(d + 10.0 * s) / (7.0 * s)) * 0.10 * (0.40 + facing);
        rim += exp(-abs(d + 58.0 * s) / (5.0 * s)) * 0.45 * bottom * (0.30 + clamp(ny, 0.0, 1.0)) * inside * (un * 0.40 + 0.60);

        imgColor += rim * rimc;
        imgColor = clamp(imgColor, 0.0, 1.5);
    }

    // High-frequency subtle dithering to remove 8-bit banding
    float noise = (hash12(gl_FragCoord.xy + u_seed) - 0.5) / 255.0 * 1.2;
    imgColor = clamp(imgColor, 0.0, 1.0) + vec3(noise);

    fragColor = vec4(clamp(imgColor, 0.0, 1.0), 1.0);
}
