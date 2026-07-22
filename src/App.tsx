import './index.css'
import { useRef } from "react";
import gsap from "gsap";
import { SplitText} from "gsap/SplitText";
import { CustomEase} from "gsap/CustomEase";
import { ScrollTrigger} from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Lenis from 'lenis';
import Gallery from './components/Gallery';
import PriceCard from './components/PriceCard';
import Projects from './components/Projects';
import Footer from './components/Footer';


gsap.registerPlugin(SplitText, ScrollTrigger, CustomEase, useGSAP);
function App() {
  const loadRef = useRef(null);

  useGSAP(() =>{
    CustomEase.create('hop', '0.8, 0, 0.2, 1');
    CustomEase.create('hop2', '0.9, 0, 0.1, 1');

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    

      const splitText = ({selector, type, className, mask = true}: any) => {
      return SplitText.create(selector, {
        type: type,
      [`${type}Class`]: className,
       ...(mask && { mask: type })
      }
      )
    };

   const preloadHeaderSplit = splitText({ selector: ".preload-header h1", type: "chars", className: "char" });
    const navSplit = splitText({ selector: "nav a", type: "words", className: "word" });
    const headerSplit = splitText({ selector: ".header h1", type: "chars", className: "char", mask: false });
    const footerSplit = splitText({ selector: ".hero-footer p", type: "words", className: "word" });

    const preloadImgRotation = [7.5, -2.5, -10, 12.5, -5, 5];

    gsap.set(".preload-img", {
      rotate: (i) => preloadImgRotation[i],
    });

    const tl = gsap.timeline({
      delay: 0.5,
    });

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
      stagger: {each: 0.125, from: "random"
      },
    },
    "0.35",
    );

    tl.to(
      ".preload-counter p",
      {
        y: "0%",
        duration: 1,
        onStart: () => {
          const  counterEl  =  loadRef.current;
          const counter = {value: 0};

          gsap.to(counter, {
            value: 100,
            duration:2,
            delay: 0.5,
            ease: "power2.inOut",
            onUpdate: () => {
              counterEl.textContent = String(Math.round(counter.value)).padStart(3, "0");
            },
          });

        },
      },
      "<",
    )

    tl.to(
      ".preload-counter p",{
        y: "-100%",
        duration: 0.75,
        ease: "hop2",
        
      },
      3.25
    );
    
    tl.to(".preload-header h1 .char", {
      y: "-100%",
      duration: 0.75,
      ease: "hop2",
      stagger: {each: 0.125, from: "random"}
    },
    3.25
  );
  tl.to(".preload-image .preload-img", {
    scale: 0,
    clipPath: "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)",
    duration: 1,
    ease: "hop2",
    stagger: -0.075
  },
  3.5
  );

  tl.to(".preload", {
    clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
    duration: 1,
    ease: "hop2",
    },
    4.35
    );

    tl.to(".header h1 .char",{
      y: '0%',
      duration: 1,
      ease: "hop",
      stagger: {each: 0.125, from: "random"}
    },
    4.65
    );

    tl.to("nav a  .word", {
      y: "0%",
      duration: 1,
      ease: "hop",
      stagger: 0.25
    },
   4.75
    );

    tl.to(".hero-footer p .word", {
      y: "0%",
      duration: 1,
      ease: "hop",
      stagger: 0.25
    },
    4.75
    );
    

  }, []);
 

  return (
    <div>
      
      <div className="preload">
        <div className="preload-image">
          <div className="preload-img"><img src='/photo.jpg' alt=''/></div>
          <div className="preload-img"><img src='/photo2.jpg' alt=''/></div>
          <div className="preload-img"><img src='/photo3.jpg' alt=''/></div>
          <div className="preload-img"><img src='/photo4.jpg' alt=''/></div>
          <div className="preload-img"><img src='/photo5.jpg' alt=''/></div>
        </div>
        <div className="preload-header">
          <h1>Galleri<span>e</span></h1>

          <div className="preload-counter">
            <p ref={loadRef}
            >000</p>
          </div>
        </div>
      </div>

      <nav>
        <div className="logo">
          <a href='#'>Gallerie</a>
        </div>

        <div className="links">
          <a href='#'>Home</a>
          <a href='#'>About</a>
          <a href='#'>Contact</a>
        </div>
      </nav>

      <section className="hero">
        <div className="header">
          <h1>Galleri<span>e</span></h1>
        </div>

        <div className="hero-footer">
          <p>Permanance</p>
          <p>Craftmanship</p>
          <p>Expression</p>
        </div>

      </section>

        <Gallery/>
        <Projects/>
        <PriceCard/>


        <section className='gallerie'>
          <Footer/>
        </section>


    </div>
  )
}

export default App
