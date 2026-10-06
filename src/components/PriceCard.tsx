import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { onGalleryReady } from "../lib/GalleryReady";


gsap.registerPlugin(ScrollTrigger, useGSAP);

const PriceCard = () => {
  const containerRef = useRef<HTMLElement>(null);
  const cardContainer = useRef<HTMLDivElement>(null);
  const stickyHeaderText = useRef<HTMLHeadingElement>(null); 
  const isGapAnimationCompleted = useRef(false);
  const isFlipAnimationCompleted = useRef(false);

  useGSAP(() => {
    let mm: gsap.MatchMedia | undefined;
    let priceCardTrigger: ScrollTrigger | undefined; // track only this component's own trigger
    let handleResize: (() => void) | undefined;
    let resizeTimer: ReturnType<typeof setTimeout>;

    function initAnimation() {
      priceCardTrigger?.kill(); 
      mm?.revert(); 

      mm = gsap.matchMedia();

      mm.add("(max-width: 999px)", () => {
        document
          .querySelectorAll<HTMLElement>(".carD, .card-container, .sticky-header h1")
          .forEach((el) => {
            el.removeAttribute("style");
          });
        return {};
      });

      mm.add("(min-width: 1000px)", () => {
        priceCardTrigger = ScrollTrigger.create({
          trigger: containerRef.current, 
          start: "top top",
          end: `+=${window.innerHeight * 4}px`,
          pin: true,
          pinSpacing: true,
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;

            
            if (progress >= 0.1 && progress <= 0.25) {
              const headerProgress = gsap.utils.mapRange(0.1, 0.25, 0, 1, progress);
              const yValue = gsap.utils.mapRange(0, 1, 40, 0, headerProgress);
              const opacityValue = gsap.utils.mapRange(0, 1, 0, 1, headerProgress);

              gsap.set(stickyHeaderText.current, {
                y: yValue,
                opacity: opacityValue,
              });
            } else if (progress < 0.1) {
              gsap.set(stickyHeaderText.current, {
                y: 40,
                opacity: 0,
              });
            } else if (progress > 0.25) {
              gsap.set(stickyHeaderText.current, {
                y: 0,
                opacity: 1,
              });
            }

            
            if (progress <= 0.25) {
              const widthPercentage = gsap.utils.mapRange(0, 0.25, 75, 60, progress);
              gsap.set(cardContainer.current, {
                width: `${widthPercentage}%`,
              });
            } else {
              gsap.set(cardContainer.current, {
                width: "60%",
              });
            }

            
            if (progress >= 0.35 && !isGapAnimationCompleted.current) {
              gsap.to(cardContainer.current, {
                gap: "20px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to(["#card-1", "#card-2", "#card-3"], {
                borderRadius: "20px",
                duration: 0.5,
                ease: "power3.inOut",
              });

              isGapAnimationCompleted.current = true;
            } else if (progress < 0.35 && isGapAnimationCompleted.current) {
              gsap.to(cardContainer.current, {
                gap: "0px",
                duration: 0.5,
                ease: "power3.out",
              });

              gsap.to("#card-1", {
                borderRadius: "20px 0 0 20px",
                duration: 0.5,
                ease: "power3.inOut",
              });

              gsap.to("#card-2", {
                borderRadius: "0px",
                duration: 0.5,
                ease: "power3.inOut",
              });

              gsap.to("#card-3", {
                borderRadius: "0px 20px 20px 0px",
                duration: 0.5,
                ease: "power3.inOut",
              });

              isGapAnimationCompleted.current = false;
            }

            
            if (progress >= 0.7 && !isFlipAnimationCompleted.current) {
              gsap.to(".carD", {
                rotationY: 180,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: 0.25,
              });

              gsap.to(["#card-1", "#card-3"], {
                y: 30,
                rotationZ: (i) => [-15, 15][i],
                duration: 0.75,
                ease: "power3.inOut",
              });

              isFlipAnimationCompleted.current = true;
            } else if (progress < 0.7 && isFlipAnimationCompleted.current) {
              gsap.to(".carD", {
                rotationY: 0,
                duration: 0.75,
                ease: "power3.inOut",
                stagger: -0.1,
              });

              gsap.to(["#card-1", "#card-3"], {
                y: 0,
                rotationZ: 0,
                duration: 0.75,
                ease: "power3.inOut",
              });

              isFlipAnimationCompleted.current = false;
            }
          },
        });
      });
    }

  
    const unsubscribe = onGalleryReady(() => {
      initAnimation();

      handleResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(initAnimation, 250);
      };
      window.addEventListener("resize", handleResize);
    });

    return () => {
      unsubscribe();
      if (handleResize) window.removeEventListener("resize", handleResize);
      priceCardTrigger?.kill();
      mm?.revert();
    };
  }, { scope: containerRef });

  return (
    <section className="sticky" ref={containerRef}>
      <div className="sticky-header">
        <h1 ref={stickyHeaderText}> Contact Us</h1>
      </div>

      <div className="card-container" ref={cardContainer}>
        <div className="carD" id="card-1">
          <div className="card-front">
            <img src="/part1.png" alt="" />
          </div>
          <div className="card-back">
            <span>( 01 ) </span>
            <p>Enjoyed  the journey beyond your expectations</p>
          </div>
        </div>

        <div className="carD" id="card-2">
          <div className="card-front">
            <img src="/part2.png" alt="" />
          </div>
          <div className="card-back">
           
            <span>( 02 ) </span>
            <p>Let's redefine creativity together</p>
          </div>
        </div>

        <div className="carD" id="card-3">
          <div className="card-front">
            <img src="/part3.png" alt="" />
          </div>
          <div className="card-back">
            <span>( 03 ) </span>
            <p>Zacsgrapher@gmail.com</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PriceCard;