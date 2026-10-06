const EVENT_NAME = "gallery-ready";

declare global {
  interface Window {
    __galleryReady?: boolean;
  }
}

export function markGalleryReady() {
  console.log("[GalleryReady] markGalleryReady() called"); // TEMP — remove once confirmed working
  window.__galleryReady = true;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function onGalleryReady(callback: () => void): () => void {
  if (window.__galleryReady) {
    console.log("[GalleryReady] already ready, calling back immediately"); // TEMP
    callback();
    return () => {};
  }

  console.log("[GalleryReady] not ready yet, registering listener"); // TEMP
  const handler = () => {
    console.log("[GalleryReady] event received, calling back"); // TEMP
    callback();
  };
  window.addEventListener(EVENT_NAME, handler, { once: true });
  return () => window.removeEventListener(EVENT_NAME, handler);
}