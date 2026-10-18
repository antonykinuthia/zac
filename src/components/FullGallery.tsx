import { useRef } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const config = {
  imageCount: 32,
  visibleSlidesRight: 12,
  visibleSlidesLeft: 2,
  offsetStep: 12,
  rotationStep: -7,
  scaleStep: 0.05,
  blurStep: 0.25,
  brightnessStep: 0.1,
  minBrightness: 0.25,
  wheelSensitivity: 0.005,
  touchSensitivity: 0.0075,
  maxWheelDelta: 200,
  smoothing: 0.075,
  snapDelay: 250,
  swapThreshold: 0.5,
};

const FullGallery = () => {
  const container = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  const goBack = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const idx = window.history.state?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  useGSAP(
    () => {
      const root = container.current;
      const slidesContainer = root?.querySelector<HTMLElement>(".slides");
      if (!root || !slidesContainer) return;

      for (let i = 1; i <= config.imageCount; i++) {
        const img = new Image();
        img.src = `/new/gallery/label1/photo${i}.webp`;
        img.decode().catch(() => {});
      }

      const slideCount = config.visibleSlidesLeft + config.visibleSlidesRight + 2;

      for (let i = 0; i < slideCount; i++) {
        const slide = document.createElement("div");
        slide.className = "slide";
        
        slide.innerHTML = `<div class="slide-img"><img alt="" /></div>`;
        slidesContainer.appendChild(slide);
      }

      const slides = Array.from(slidesContainer.querySelectorAll<HTMLElement>(".slide"));

      let currentPosition = 0;
      let targetPosition = 0;
      let scrollDirection = 1;
      let snapTimeout: ReturnType<typeof setTimeout> | undefined;

      const wrapOffset = gsap.utils.wrap(
        -(config.visibleSlidesLeft + 1),
        slideCount - (config.visibleSlidesLeft + 1),
      );
      const wrapImageIndex = gsap.utils.wrap(0, config.imageCount);

      function updateSlideImage(slide: HTMLElement, position: number) {
        const imageIndex = wrapImageIndex(Math.round(position));
        if (slide.dataset.image === String(imageIndex)) return;

        slide.dataset.image = String(imageIndex);
        const img = slide.querySelector("img");
        if (img) img.src = `/new/gallery/label1/photo${imageIndex + 1}.webp`;
      }

      function getSlideZindex(offset: number) {
        const travelOffset = offset * scrollDirection;

        if (travelOffset >= 0) return Math.round(1000 - travelOffset * 10);
        if (travelOffset > -config.swapThreshold) return 1001;
        return Math.round(500 + travelOffset * 10);
      }

      function getSlideOpacity(offset: number) {
        const opacity =
          offset < 0
            ? config.visibleSlidesLeft + 1 + offset
            : config.visibleSlidesRight + 1 - offset;

        return gsap.utils.clamp(0, 1, opacity);
      }

      function renderSlides() {
        slides.forEach((slide, index) => {
          const offset = wrapOffset(index - currentPosition);
          const distance = Math.abs(offset);

          const blur = distance * config.blurStep;
          const brightness = Math.max(config.minBrightness, 1 - distance * config.brightnessStep);

          updateSlideImage(slide, currentPosition + offset);

          gsap.set(slide, {
            xPercent: offset * config.offsetStep,
            rotation: offset * config.rotationStep,
            scale: 1 - distance * config.scaleStep,
            filter: `blur(${blur}px) brightness(${brightness})`,
            opacity: getSlideOpacity(offset),
            zIndex: getSlideZindex(offset),
          });
        });
      }

      renderSlides();

      function snapToSlide() {
        const outgoingPosition =
          scrollDirection > 0 ? Math.floor(targetPosition) : Math.ceil(targetPosition);
        const distanceMoved = Math.abs(targetPosition - outgoingPosition);

        targetPosition =
          distanceMoved < config.swapThreshold
            ? outgoingPosition
            : outgoingPosition + scrollDirection;
      }

      function moveSlider(amount: number) {
        if (amount === 0) return;

        scrollDirection = Math.sign(amount);
        targetPosition += amount;

        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(snapToSlide, config.snapDelay);
      }

    
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        const delta = gsap.utils.clamp(-config.maxWheelDelta, config.maxWheelDelta, e.deltaY);
        moveSlider(delta * config.wheelSensitivity);
      };

      let lastTouchY = 0;
      const onTouchStart = (e: TouchEvent) => {
        lastTouchY = e.touches[0].clientY;
      };
      const onTouchMove = (e: TouchEvent) => {
        const touchY = e.touches[0].clientY;
        moveSlider((lastTouchY - touchY) * config.touchSensitivity);
        lastTouchY = touchY;
      };

      const onTick = () => {
        if (currentPosition === targetPosition) return;

        currentPosition += (targetPosition - currentPosition) * config.smoothing;

        if (Math.abs(targetPosition - currentPosition) < 0.001) {
          currentPosition = targetPosition;
        }

        renderSlides();
      };

      root.addEventListener("wheel", onWheel, { passive: false });
      root.addEventListener("touchstart", onTouchStart, { passive: true });
      root.addEventListener("touchmove", onTouchMove, { passive: true });
      gsap.ticker.add(onTick);

     
      return () => {
        clearTimeout(snapTimeout);
        gsap.ticker.remove(onTick);
        root.removeEventListener("wheel", onWheel);
        root.removeEventListener("touchstart", onTouchStart);
        root.removeEventListener("touchmove", onTouchMove);
        slides.forEach((slide) => slide.remove());
      };
    },
    { scope: container },
  );

  return (
    <>
      <a href="/" className="gallery-back" onClick={goBack}>
        &larr; Back
      </a>

      <section ref={container} className="slider">
        <div className="slides" />
      </section>
    </>
  );
};

export default FullGallery;