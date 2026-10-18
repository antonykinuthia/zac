import './index.css'
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from 'lenis';
import Gallery from './components/Gallery';
import PriceCard from './components/PriceCard';
import Projects from './components/Projects';
import Footer from './components/Footer';

gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase, useGSAP);

function App() {
  const loadRef = useRef<HTMLParagraphElement>(null);
  const heroLayersRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);


  const [introReady, setIntroReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const loaderImages = Array.from(
      document.querySelectorAll<HTMLImageElement>(".preload-img img"),
    );
    const assets = Promise.all([
      document.fonts.ready,
      ...loaderImages.map((img) => img.decode().catch(() => {})),
    ]);
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, 2500));

    Promise.race([assets, timeout]).then(() => {
      if (!cancelled) setIntroReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  
  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const lenis = new Lenis();
    lenisRef.current = lenis;
    lenis.stop();

    const failsafe = setTimeout(() => lenis.start(), 12000);

    const onScroll = () => ScrollTrigger.update();
    const onTick = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', onScroll);
    gsap.ticker.add(onTick);

    return () => {
      clearTimeout(failsafe);
      gsap.ticker.remove(onTick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  useGSAP(
    () => {
      if (!introReady) return;

      CustomEase.create('hop', '0.8, 0, 0.2, 1');
      CustomEase.create('hop2', '0.9, 0, 0.1, 1');

      const splitText = ({ selector, type, className, mask = true }: any) => {
        return SplitText.create(selector, {
          type: type,
          [`${type}Class`]: className,
          ...(mask && { mask: type })
        });
      };

      const preloadHeaderSplit = splitText({ selector: ".preload-header h1", type: "chars", className: "char" });
      const navSplit = splitText({ selector: "nav a", type: "words", className: "word" });
      const headerSplit = splitText({ selector: ".header h1", type: "chars", className: "char", mask: false });
      const footerSplit = splitText({ selector: ".hero-footer p", type: "words", className: "word" });

      gsap.set(".preload-header h1", { visibility: "visible" });

      const preloadImgRotation = [7.5, -2.5, -10, 12.5, -5, 5];

      gsap.set(".preload-img", {
        rotate: (i: number) => preloadImgRotation[i],
      });

      const counterEl = loadRef.current;
      const counter = { value: 0 };

      const tl = gsap.timeline({
        delay: 0.5,
        onComplete: () => {
          gsap.ticker.lagSmoothing(0);
        },
      });

      tl.to(".preload-img", {
        scale: 1,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 1,
        ease: "hop",
        stagger: 0.2,
      });

      tl.to(".preload-header h1 .char", {
        y: "0%",
        duration: 1,
        ease: "hop2",
        stagger: { each: 0.125, from: "random" },
      }, "0.35");

      tl.to(".preload-counter p", { y: "0%", duration: 1 }, "<");
      tl.to(counter, {
        value: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterEl) {
            counterEl.textContent = String(Math.round(counter.value)).padStart(3, "0");
          }
        },
      }, 0.85);

      tl.to(".preload-counter p", { y: "-100%", duration: 0.75, ease: "hop2" }, 3.25);

      tl.to(".preload-header h1 .char", {
        y: "-100%",
        duration: 0.75,
        ease: "hop2",
        stagger: { each: 0.125, from: "random" }
      }, 3.25);

      tl.to(".preload-image .preload-img", {
        scale: 0,
        clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
        duration: 1,
        ease: "hop2",
        stagger: -0.075,
        clearProps: "willChange",
      }, 3.5);

      tl.to(".preload", {
        yPercent: -100,
        duration: 1,
        ease: "hop2",
        onComplete: () => {
          gsap.set(".preload", { display: "none" });
          lenisRef.current?.start();
        },
      }, 4.35);

      tl.to(".header h1 .char", {
        y: '0%',
        duration: 1,
        ease: "hop",
        stagger: { each: 0.125, from: "random" }
      }, 4.65);

      tl.to("nav a .word", { y: "0%", duration: 1, ease: "hop", stagger: 0.25, clearProps: "willChange" }, 4.75);

      tl.to(".hero-footer p .word", { y: "0%", duration: 1, ease: "hop", stagger: 0.25, clearProps: "willChange" }, 4.75);


      const heroLayersEl = heroLayersRef.current;
      let heroTrigger: ScrollTrigger | undefined;
      if (heroLayersEl) {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: heroLayersEl,
            start: "0% 0%",
            end: "100% 0%",
            scrub: 0,
          },
        });
        heroTrigger = heroTl.scrollTrigger ?? undefined;

        const heroLayers = [
          { layer: "1", yPercent: 20 },
          { layer: "2", yPercent: 50 },
        ];

        heroLayers.forEach((layerObj, idx) => {
          heroTl.to(
            heroLayersEl.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
            { yPercent: layerObj.yPercent, ease: "none" },
            idx === 0 ? undefined : "<"
          );
        });
      }

      return () => {
        preloadHeaderSplit.revert();
        navSplit.revert();
        headerSplit.revert();
        footerSplit.revert();
        heroTrigger?.kill();
      };
    },
    { dependencies: [introReady] },
  );

  return (
    <div>
      <div className="preload">
        <div className="preload-image">
          <div className="preload-img"><img src='/new/loader/photo.webp' alt='' /></div>
          <div className="preload-img"><img src='/new/loader/photo2.webp' alt='' /></div>
          <div className="preload-img"><img src='/new/loader/photo3.webp' alt='' /></div>
          <div className="preload-img"><img src='/new/loader/photo4.webp' alt='' /></div>
          <div className="preload-img"><img src='/new/loader/photo5.webp' alt='' /></div>
        </div>
        <div className="preload-header">
          <h1>Alph<span>a</span></h1>
          <div className="preload-counter">
            <p ref={loadRef}>000</p>
          </div>
        </div>
      </div>

      <nav>
        <div className="logo"><a href='#'>Alpha Labs</a></div>
        <div className="links">
          <a href='#'>Home</a>
          <a href='#'>About</a>
          <a href='#'>Contact</a>
        </div>
      </nav>

      <section className="hero">
        <div ref={heroLayersRef} data-parallax-layers className="relative h-full w-full">
          <div className="header" data-parallax-layer="1">
            <h1>Alph<span>a</span></h1>
            <h1>Lab<span>s</span></h1>
          </div>
          <div className="hero-footer" data-parallax-layer="2">
            <p>Permanance</p>
            <p>Craftmanship</p>
            <p>Expression</p>
          </div>
        </div>
      </section>

      <Gallery />
      <Projects />
      <PriceCard />

     
    </div>
  )
}

export default App