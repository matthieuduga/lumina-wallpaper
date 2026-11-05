import React from 'react';

export type OrientationMode = 'desktop' | 'mobile';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type QualityMultiplier = 1 | 1.5 | 2;

export interface DeviceSpec {
  id: string;
  name: string;
  category: 'mac' | 'iphone' | 'ipad' | 'pc' | 'android' | 'custom';
  width: number;
  height: number;
  orientation: OrientationMode;
  scale: number;
  description: string;
}

export type ColorRamp = [string, string, string, string, string];

export interface PaletteSpec {
  id: string;
  name: string;
  bgDark: string;
  leftRamp: ColorRamp;
  rightRamp: ColorRamp;
  bgLight?: string | null;
}

export type RGBFloat = [number, number, number];

export interface RenderOptions<TParams = Record<string, unknown>> {
  width: number;
  height: number;
  orientation: OrientationMode;
  theme: 'light' | 'dark';
  bgDark: RGBFloat;
  bgLight: RGBFloat;
  leftRamp: RGBFloat[];
  rightRamp: RGBFloat[];
  params: TParams;
  seed?: number;
}

export interface WallpaperModule<TParams = Record<string, unknown>> {
  id: string;
  name: string;
  description: string;
  defaultParams: TParams;
  palettes?: PaletteSpec[];
  defaultPalette?: PaletteSpec;
  CustomControls?: React.FC<{
    params: TParams;
    onChange: (newParams: TParams) => void;
  }>;
  renderWebGL: (
    gl: WebGL2RenderingContext,
    options: RenderOptions<TParams>
  ) => void;
  renderFallback?: (
    ctx: CanvasRenderingContext2D,
    options: RenderOptions<TParams>
  ) => void;
}
