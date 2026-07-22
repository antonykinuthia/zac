import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "../lib/Gsap";
import { markGalleryReady } from "../lib/GalleryReady";


type Card = { element: HTMLDivElement; centerX: number; centerY: number };

const config = {
  cardCount: 1,
  cardWidth: 250,
  cardHeight: 300,
  animationDuration: 0.75,
  animationOverlap: 0.5,
  headingFadeDuration: 0.5,
  headings: [
    "Passion lead us here ",
    "Memories shuffle like cards in an endless deck",
    "Each moment scatters as another takes its place",
    "The past is a tapestry of memories",
  ],
};

const preloadedSets = new Set<number>();

function preloadSet(setNumber: number): Promise<void> {
  if (preloadedSets.has(setNumber)) return Promise.resolve();

  const loaders = Array.from({ length: config.cardCount }, (_, i) => {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); 
      img.src = `set${setNumber}/img${i + 1}.webp`;
    });
  });

  return Promise.all(loaders).then(() => {
    preloadedSets.add(setNumber);
  });
}

const Gallery = () => {
  const container = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const gallery = container.current;
      const galleryHeading = headingRef.current;
      if (!gallery || !galleryHeading) return;

      let viewport = {
        centerX: window.innerWidth / 2,
        centerY: window.innerHeight / 2,
        rangemin: Math.min(window.innerWidth, window.innerHeight) * 0.35,
        rangemax: Math.min(window.innerWidth, window.innerHeight) * 0.7,
      };

      const state = {
        activeCards: [] as Card[],
        currentSection: 0,
        isAnimating: false,
      };

      function updateViewport() {
        viewport = {
          centerX: window.innerWidth / 2,
          centerY: window.innerHeight / 2,
          rangemin: Math.min(window.innerWidth, window.innerHeight) * 0.35,
          rangemax: Math.min(window.innerWidth, window.innerHeight) * 0.7,
        };
      }

      function getEdgePosition({ centerX, centerY }: { centerX: number; centerY: number }) {
        const distances = {
          left: centerX,
          right: window.innerWidth - centerX,
          top: centerY,
          bottom: window.innerHeight - centerY,
        };

        const minDistance = Math.min(...Object.values(distances));
        const cardCenterOffsetX = config.cardWidth / 2;
        const cardCenterOffsetY = config.cardHeight / 2;
        const offsetVariation = () => (Math.random() - 0.5) * 400;

        if (minDistance === distances.left) {
          return { x: -300 - Math.random() * 200, y: centerY - cardCenterOffsetY + offsetVariation() };
        }
        if (minDistance === distances.right) {
          return {
            x: window.innerWidth + 50 + Math.random() * 200,
            y: centerY - cardCenterOffsetY + offsetVariation(),
          };
        }
        if (minDistance === distances.top) {
          return { x: centerX - cardCenterOffsetX + offsetVariation(), y: -400 - Math.random() * 200 };
        }
        return {
          x: centerX - cardCenterOffsetX + offsetVariation(),
          y: window.innerHeight + 50 + Math.random() * 200,
        };
      }

        function createCards(setNumber: number): Card[] {
        const cards: Card[] = [];
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < config.cardCount; i++) {
          const card = document.createElement("div");
          card.className = "card";

          const media = document.createElement("div");
          media.className = "card-media";

          const img = document.createElement("img");
          img.decoding = "sync"; 
          img.loading = "eager";
          img.src = `set${setNumber}/img${i + 1}.webp`;
          media.appendChild(img);
          card.appendChild(media);

          const angle = Math.random() * Math.PI * 2;
          const radius = viewport.rangemin + Math.random() * (viewport.rangemax - viewport.rangemin);
          const centerX = viewport.centerX + Math.cos(angle) * radius;
          const centerY = viewport.centerY + Math.sin(angle) * radius;

          gsap.set(card, {
            x: centerX - config.cardWidth / 2,
            y: centerY - config.cardHeight / 2,
            rotation: Math.random() * 50 - 25,
            force3D: true,
          });

          fragment.appendChild(card);
          cards.push({ element: card, centerX, centerY });
        }

        gallery.appendChild(fragment);
        return cards;
      }

      function animateHeading(newText: string) {
        return gsap.timeline().to(galleryHeading, {
          opacity: 0,
          duration: config.headingFadeDuration,
          ease: "power2.inOut",
          onComplete: () => {
            galleryHeading.textContent = newText;
          },
        }).to(galleryHeading, {
          opacity: 1,
          duration: config.headingFadeDuration,
          ease: "power2.inOut",
        });
      }


      function animateCards(existingCards: Card[], enteringCards: Card[]) {
        const tl = gsap.timeline();

        existingCards.forEach(({ element, centerX, centerY }) => {
          const targetEdge = getEdgePosition({ centerX, centerY });
          tl.to(
            element,
            {
              x: targetEdge.x,
              y: targetEdge.y,
              rotation: Math.random() * 180 - 90,
              duration: config.animationDuration,
              ease: "power2.in",
              force3D: true,
              onComplete: () => element.remove(),
            },
            0,
          );
        });

        enteringCards.forEach(({ element, centerX, centerY }) => {
          const targetEdge = getEdgePosition({ centerX, centerY });
          gsap.set(element, {
            x: targetEdge.x,
            y: targetEdge.y,
            rotation: Math.random() * 180 - 90,
          });
          tl.to(
            element,
            {
              x: centerX - config.cardWidth / 2,
              y: centerY - config.cardHeight / 2,
              rotation: Math.random() * 50 - 25,
              duration: config.animationDuration,
              ease: "power2.out",
              force3D: true,
            },
            config.animationOverlap,
          );
        });

        return tl;
      }

      function getSectionIndex(progress: number) {
        if (progress < 0.25) return 0;
        if (progress < 0.5) return 1;
        if (progress < 0.75) return 2;
        return 3;
      }

      let cancelled = false;
      let scrollTriggerInstance: ScrollTrigger | undefined;
      let activeTransitionTl: gsap.core.Timeline | undefined;

      (async () => {
        await preloadSet(1);
        if (cancelled) return;

        state.activeCards = createCards(1);
        galleryHeading.textContent = config.headings[0];
        gsap.set(galleryHeading, { opacity: 1 });

        const idle =
          "requestIdleCallback" in window
            ? window.requestIdleCallback
            : (cb: () => void) => setTimeout(cb, 200);
        idle(() => {
          if (cancelled) return;
          [2, 3, 4].forEach((n) => preloadSet(n));
        });

        scrollTriggerInstance = ScrollTrigger.create({
          trigger: gallery,
          start: "top top",
          end: () => `+=${window.innerHeight * 6}`,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          // markers: true,
          onUpdate: ({ progress }) => {
            if (state.isAnimating) return;
            const targetSection = getSectionIndex(progress);
            if (targetSection === state.currentSection) return;

            state.isAnimating = true;

            requestAnimationFrame(() => {
              (async () => {
                await preloadSet(targetSection + 1);
                if (cancelled) return;

                const newCards = createCards(targetSection + 1);
                const cardsTl = animateCards(state.activeCards, newCards);
                const headingTl = animateHeading(config.headings[targetSection]);
                activeTransitionTl = cardsTl;

                await Promise.all([cardsTl, headingTl]);
                if (cancelled) return;

                state.activeCards = newCards;
                state.currentSection = targetSection;
                state.isAnimating = false;
                activeTransitionTl = undefined;
              })();
            });
          },
        });

        if (cancelled) return;

       
        ScrollTrigger.refresh();

       
        markGalleryReady();
      })();

      const onResize = () => updateViewport();
      window.addEventListener("resize", onResize);

      return () => {
        cancelled = true;
        window.removeEventListener("resize", onResize);
        scrollTriggerInstance?.kill();
        activeTransitionTl?.kill();
        state.activeCards.forEach(({ element }) => element.remove());
      };
    },
    { scope: container },
  );

  return (
    <section ref={container} className="gallery">
      <h1 ref={headingRef} style={{ opacity: 0 }} />
    </section>
  );
};

export default Gallery;