const EVENT_NAME = "gallery-ready";

declare global {
  interface Window {
    __galleryReady?: boolean;
  }
}

export function markGalleryReady() {
  window.__galleryReady = true;
  window.dispatchEvent(new Event(EVENT_NAME));
}

export function onGalleryReady(callback: () => void): () => void {
  if (window.__galleryReady) {
    callback();
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler, { once: true });
  return () => window.removeEventListener(EVENT_NAME, handler);
}