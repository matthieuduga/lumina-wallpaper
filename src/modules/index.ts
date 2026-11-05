import { WallpaperModule } from './types';
import { glassPillsModule } from './glass-pills';

const moduleRegistry: Map<string, WallpaperModule<Record<string, unknown>>> = new Map();

// Register built-in modules
moduleRegistry.set(
  glassPillsModule.id,
  glassPillsModule as unknown as WallpaperModule<Record<string, unknown>>
);

/**
 * Retrieves a wallpaper module by its unique identifier.
 */
export function getModule(id: string): WallpaperModule<Record<string, unknown>> | undefined {
  return moduleRegistry.get(id);
}

/**
 * Returns all currently registered wallpaper modules.
 */
export function getAllModules(): WallpaperModule<Record<string, unknown>>[] {
  return Array.from(moduleRegistry.values());
}

/**
 * Registers a new wallpaper module into the central studio registry.
 */
export function registerModule<TParams>(module: WallpaperModule<TParams>): void {
  moduleRegistry.set(
    module.id,
    module as unknown as WallpaperModule<Record<string, unknown>>
  );
}

export * from './types';
export * from './glass-pills';
