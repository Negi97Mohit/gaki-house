/**
 * Canvas Model — Source factories and legacy adapters.
 *
 * → See sourceFactory.ts for creating new sources
 * → See legacySceneAdapter.ts for SceneState ↔ CompositorScene conversion
 */

export {
  createCameraSource,
  createScreenCaptureSource,
  createWindowCaptureSource,
  createImageSource,
  createMediaSource,
  createBrowserSource,
  createTextSource,
  createColorSource,
  createGroupSource,
  createSceneRefSource,
  createGeneratedOverlaySource,
  createCaptionSource,
  createExcalidrawSource,
  createGraphSource,
  createSourceByType,
} from './sourceFactory';

export {
  legacySceneToCompositorScene,
} from './legacySceneAdapter';
