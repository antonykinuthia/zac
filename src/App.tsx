import './index.css'
import { useRef } from "react";
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
import Services from './components/Services';

gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase, useGSAP);

function App() {
  const loadRef = useRef<HTMLParagraphElement>(null);
  const heroLayersRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    CustomEase.create('hop', '0.8, 0, 0.2, 1');
    CustomEase.create('hop2', '0.9, 0, 0.1, 1');

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const splitText = ({ selector, type, className, mask = true }: any) => {
      return SplitText.create(selector, {
        type: type,
        [`${type}Class`]: className,
        ...(mask && { mask: type })
      });
    };

    splitText({ selector: ".preload-header h1", type: "chars", className: "char" });
    splitText({ selector: "nav a", type: "words", className: "word" });
    splitText({ selector: ".header h1", type: "chars", className: "char", mask: false });
    splitText({ selector: ".hero-footer p", type: "words", className: "word" });

    const preloadImgRotation = [7.5, -2.5, -10, 12.5, -5, 5];

    gsap.set(".preload-img", {
      rotate: (i: number) => preloadImgRotation[i],
    });

    const tl = gsap.timeline({ delay: 0.5 });

    tl.to(".preload-img", {
      scale: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      duration: 1,
      ease: "hop",
      stagger: 0.2
    });

    tl.to(".preload-header h1 .char", {
      y: "0%",
      duration: 1,
      ease: "hop2",
      stagger: { each: 0.125, from: "random" },
    }, "0.35");

    tl.to(".preload-counter p", {
      y: "0%",
      duration: 1,
      onStart: () => {
        const counterEl = loadRef.current;
        const counter = { value: 0 };
        gsap.to(counter, {
          value: 100,
          duration: 2,
          delay: 0.5,
          ease: "power2.inOut",
          onUpdate: () => {
            if (counterEl) counterEl.textContent = String(Math.round(counter.value)).padStart(3, "0");
          },
        });
      },
    }, "<");

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
      stagger: -0.075
    }, 3.5);

    tl.to(".preload", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      duration: 1,
      ease: "hop2",
    }, 4.35);

    tl.to(".header h1 .char", {
      y: '0%',
      duration: 1,
      ease: "hop",
      stagger: { each: 0.125, from: "random" }
    }, 4.65);

    tl.to("nav a .word", { y: "0%", duration: 1, ease: "hop", stagger: 0.25 }, 4.75);

    tl.to(".hero-footer p .word", { y: "0%", duration: 1, ease: "hop", stagger: 0.25 }, 4.75);

   
    const heroLayersEl = heroLayersRef.current;
    if (heroLayersEl) {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroLayersEl,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      const heroLayers = [
        { layer: "1", yPercent: 20 }, // .header — anchor plane, moves least
        { layer: "2", yPercent: 50 }, // .hero-footer — moves more, reads as closer/faster plane
      ];

      heroLayers.forEach((layerObj, idx) => {
        heroTl.to(
          heroLayersEl.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          { yPercent: layerObj.yPercent, ease: "none" },
          idx === 0 ? undefined : "<"
        );
      });
    }

  }, []);

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
      <Services/>
      <PriceCard />

      <section className='gallerie'>
        <Footer />
      </section>
    </div>
  )
}

export default App