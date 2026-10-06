import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';
import { markGalleryReady } from '../lib/GalleryReady';

gsap.registerPlugin(ScrollTrigger, CustomEase, useGSAP);

const HEIGHT_HEADROOM = 10;
const HOVER_GROWTH = 50;
const CARD_FOLLOW_STRENGTH = 0.75;
const CARD_X_RANGE = 100;
const CARD_Y_JITTER = 50;
const CARD_ROTATION_JITTER = 20;

type LabelAnimVars = { opacity: number; scaleX: number; scaleY: number; blur: number };

const Gallery = () => {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      // Fixed: these queries now run inside useGSAP, which fires after
      // the DOM below has actually been committed/mounted. Querying them
      // in the component body (outside useGSAP) ran during React's
      // render phase, before the JSX existed in the real document — so
      // every one of these came back empty, and every listener attached
      // below was attaching to nothing. That alone was why hover did
      // nothing, independent of the other bugs.
      const root = container.current;
      if (!root) return;

      CustomEase.create("hop", "0.35, 0.75, 0.1, 1");

      const spotLightItems = Array.from(root.querySelectorAll<HTMLElement>(".spotlight-item"));
      const spotLightList = root.querySelector<HTMLElement>(".spotlight-list");
      const previewCards = Array.from(root.querySelectorAll<HTMLImageElement>(".card"));

      let baseItemHeight = 0;

      const calculateBaseHeight = () => {
        spotLightItems.forEach((item) => (item.style.height = ""));
        baseItemHeight = Math.round(
          Math.max(...spotLightItems.map((item) => item.offsetHeight)) + HEIGHT_HEADROOM,
        );
        gsap.set(spotLightItems, { height: baseItemHeight });
      };

      // Call it directly instead of waiting on window's "load" event —
      // by the time this component mounts, "load" (which fires once for
      // the whole page) may have already happened, in which case this
      // listener would never fire at all and baseItemHeight would stay 0
      // forever. Layout is already available once useGSAP runs, so there
      // is no need to wait for a separate load signal here.
      calculateBaseHeight();
      window.addEventListener("resize", calculateBaseHeight);

      const animateLabelText = (label: Element | null, { opacity, scaleX, scaleY, blur }: LabelAnimVars) => {
        if (!label) return;
        gsap.to(label, { opacity, duration: 0.1, delay: 0.025, ease: "hop", overwrite: "auto" });
        gsap.to(label, { scaleX, scaleY, duration: 0.25, ease: "back.out(1.75)", overwrite: "auto" });
        gsap.to(label, { filter: `blur(${blur}px)`, duration: 0.25, ease: "hop", overwrite: "auto" });
      };

      previewCards.forEach((card, index) => {
        const rotation = parseFloat(card.dataset.rotation ?? "0");
        card.dataset.baseRotation = String(rotation);
        card.src = `/new/gallery/label1/photo${index + 1}.webp`;
        gsap.set(card, { rotation, scale: 0 });
      });

      const PHOTOS_IN_LABEL = 36;

      // All 36 images live in one folder (label1) — preload + pre-decode
      // every one up front so every label's fixed slice is always a
      // cache hit on hover, never a live fetch/decode.
      const preloadedPhotos = new Set<number>();
      const preloadPhoto = (photoNumber: number) => {
        if (preloadedPhotos.has(photoNumber)) return;
        preloadedPhotos.add(photoNumber);

        const img = new Image();
        img.src = `/new/gallery/label1/photo${photoNumber}.webp`;
        if ("decode" in img) {
          img.decode().catch(() => {});
        }
      };

      for (let p = 1; p <= PHOTOS_IN_LABEL; p++) {
        preloadPhoto(p);
      }

      const CARDS_PER_LABEL = 4;

      // Each label owns a fixed, non-overlapping slice of the 36-image
      // pool: label 0 -> photos 1-4, label 1 -> photos 5-8, ... label 8
      // -> photos 33-36. All still live in the single label1 folder and
      // were all pre-decoded above, so every hover is a cache hit.
      const photosForLabel = (itemIndex: number) =>
        Array.from({ length: CARDS_PER_LABEL }, (_, i) => itemIndex * CARDS_PER_LABEL + i + 1);

      const positionPreviewCards = (hoveredItem: HTMLElement, itemIndex: number) => {
        if (!spotLightList) return;
        const listRect = spotLightList.getBoundingClientRect();
        const itemRect = hoveredItem.getBoundingClientRect();
        const followY =
          (itemRect.top + itemRect.height / 2 - listRect.top - listRect.height / 2) * CARD_FOLLOW_STRENGTH;

        const photoNumbers = photosForLabel(itemIndex);

        previewCards.forEach((card, cardIndex) => {
          card.src = `/new/gallery/label1/photo${photoNumbers[cardIndex]}.webp`;

          const baseRotation = parseFloat(card.dataset.baseRotation ?? "0");
          gsap.to(card, {
            x: gsap.utils.random(-CARD_X_RANGE, CARD_X_RANGE),
            y: followY + gsap.utils.random(-CARD_Y_JITTER, CARD_Y_JITTER),
            rotation: baseRotation + gsap.utils.random(-CARD_ROTATION_JITTER, CARD_ROTATION_JITTER),
            duration: 1,
            ease: "elastic.out(1, 0.75)",
            overwrite: "auto",
          });
        });
      };

      const onListEnter = () => {
        gsap.to(previewCards, { scale: 1, duration: 0.75, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
      };
      const onListLeave = () => {
        gsap.to(previewCards, { scale: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        gsap.to(spotLightItems, { height: baseItemHeight, duration: 0.35, ease: "power3.out", overwrite: "auto" });
      };
      spotLightList?.addEventListener("mouseenter", onListEnter);
      spotLightList?.addEventListener("mouseleave", onListLeave);

      // Track each item's own enter/leave handlers so they can be removed
      // in cleanup — plain DOM listeners aren't GSAP objects, so useGSAP's
      // context won't revert them automatically (the same gotcha as
      // Lenis/ScrollTrigger created outside a tracked async phase
      // elsewhere in this app).
      const itemHandlers: Array<{ item: HTMLElement; enter: () => void; leave: () => void }> = [];

      spotLightItems.forEach((item, itemIndex) => {
        const defaultLabel = item.querySelector(".label-default");
        const altLabel = item.querySelector(".label-alt");

        const onEnter = () => {
          animateLabelText(defaultLabel, { opacity: 0, scaleX: 0.75, scaleY: 1.25, blur: 1 });
          animateLabelText(altLabel, { opacity: 1, scaleX: 1, scaleY: 1, blur: 0 });
          positionPreviewCards(item, itemIndex);

          const proximityWeights = spotLightItems.map((_, i) => (i === itemIndex ? 0 : 1 / Math.abs(i - itemIndex)));
          const totalWeight = proximityWeights.reduce((sum, w) => sum + w, 0);

          spotLightItems.forEach((otherItem, i) => {
            const targetHeight =
              i === itemIndex
                ? baseItemHeight + HOVER_GROWTH
                : Math.round(baseItemHeight - (HOVER_GROWTH * proximityWeights[i]) / totalWeight);

            gsap.to(otherItem, { height: targetHeight, duration: 0.5, ease: "power2.out", overwrite: "auto" });
          });
        };

        const onLeave = () => {
          animateLabelText(defaultLabel, { opacity: 1, scaleX: 1, scaleY: 1, blur: 0 });
          animateLabelText(altLabel, { opacity: 0, scaleX: 0.75, scaleY: 1.25, blur: 1 });
        };

        // Fixed: was "mousenter", which isn't a real DOM event, so this
        // listener never fired regardless of the query-timing bug above.
        item.addEventListener("mouseenter", onEnter);
        item.addEventListener("mouseleave", onLeave);
        itemHandlers.push({ item, enter: onEnter, leave: onLeave });
      });

      // This component's own functionality (hover listeners) is fully
      // synchronous, so readiness is signaled immediately here — it does
      // NOT wait on the background image preloading above, since hover
      // works correctly regardless of whether those 36 images have
      // finished downloading/decoding yet. Without this call, nothing in
      // this file ever dispatches "gallery-ready", so PriceCard and
      // Projects — which both wait on it via onGalleryReady — never
      // initialize their own ScrollTriggers at all.
      markGalleryReady();

      return () => {
        window.removeEventListener("resize", calculateBaseHeight);
        spotLightList?.removeEventListener("mouseenter", onListEnter);
        spotLightList?.removeEventListener("mouseleave", onListLeave);
        itemHandlers.forEach(({ item, enter, leave }) => {
          item.removeEventListener("mouseenter", enter);
          item.removeEventListener("mouseleave", leave);
        });
      };
    },
    { scope: container },
  );

  const labels = [
    "Started with a borrowed camera",
    "Chasing light through empty streets",
    "Ten years behind the lens",
    "Every frame holds a memory",
    "Traveled far to find stillness",
    "Self-taught, one roll at a time",
  ];

  return (
    <section className="spotlight" ref={container}>
      <div className="spotlight-container">
        <p>About us</p>

        <div className="spotlight-stage">
          <div className="cards">
            {/* Fixed: each card now gets its own CARD-1..CARD-4 class
                (matching the CSS position rules) instead of all four
                sharing the mistyped "CARDO-1". */}
            <img className="card CARD CARD-1" data-rotation="-10" alt="" decoding="async" loading="eager" />
            <img className="card CARD CARD-2" data-rotation="10" alt="" decoding="async" loading="eager" />
            <img className="card CARD CARD-3" data-rotation="8" alt="" decoding="async" loading="eager" />
            <img className="card CARD CARD-4" data-rotation="-8" alt="" decoding="async" loading="eager" />
          </div>

          <div className="spotlight-list">
            {labels.map((label) => (
              <div className="spotlight-item" key={label}>
                <span className="label">
                  <h3 className="label-default">{label}</h3>
                  <h3 className="label-alt">{label}</h3>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery;