import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Services = () => {
    const container = useRef<HTMLElement | null>(null);

    useGSAP(() => {
       const cards = document.querySelectorAll('.service-cards .service-card'); 
       const totalCards  = cards.length;
       const transitions = totalCards - 1;
       const segmentSize =  1/ transitions;

       const cardYOffset = 10;
       const cardScaleStep = 0.15;
       const cardExitRotation =20;
       const cardExitz = 350;
       const isMobile = window.matchMedia("(max-width: 1000px").matches;
       const cardExitY = isMobile? -420 : -200;
       const cardParkedY = isMobile ? -480 : -250;

       cards.forEach((card, i) => {
        gsap.set(card, {
            xPercent: -50,
            yPercent: -50 + i * cardYOffset,
            scale: 1 - i * cardScaleStep,
        });
       });

       ScrollTrigger.create({
        trigger: container.current,
        start: "top top",
        end: `+=${window.innerHeight * 8}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
            const progress =  self.progress;

            const activeCardIndex =  Math.min(
                Math.floor(progress / segmentSize),
                transitions -1,
            );

            const segProgress = (progress - activeCardIndex * segmentSize) / segmentSize;

            cards.forEach((card, i) => {
                if(i < activeCardIndex) {
                    gsap.set(card, {
                        yPercent: cardParkedY,
                        rotation: cardExitRotation,
                        z: cardExitz
                    });
                }else if (i === activeCardIndex){
                    const exitProgress = gsap.parseEase("power2.in")(segProgress);
                    gsap.set(card, {
                        yPercent: gsap.utils.interpolate(-50, cardExitY, exitProgress),
                        rotation: gsap.utils.interpolate(0, cardExitRotation,  exitProgress),
                        z: gsap.utils.interpolate(0, cardExitz, exitProgress),
                        scale: 1
                    })
                } else {
                    const behindIndex = i - activeCardIndex;
                    const delayedSeg =  gsap.utils.clamp(0, 1, (segProgress - 0.3) / 0.7);
                    const easedSeg = gsap.parseEase("back.out(2)")(delayedSeg);
                    const currentYOffset = (behindIndex - easedSeg) * cardYOffset;
                    const currentScale = 1 - (behindIndex - easedSeg) * cardScaleStep;

                    gsap.set(card, {
                        yPercent: -50 + currentYOffset,
                        rotation: 0,
                        z: 0,
                        scale: currentScale,
                    })
                }
            });
        },
       });
    }, {scope: container})

  return (
    <section className='services' ref={container}>
      <div className='service-copy'>
        <h1>Behind the scenes</h1>
        <p>
            After midnight the rules soften and the glow takes over. This is style with nothing left to prove, draped in gold and lit from within. Every gesture lingers, every look catches the light, and the night belongs to whoever moves through it unhurried.
        </p>
      </div>

      <div className='service-cards'>
        <div className='service-card' id='card-1'>
            <h3>radiate</h3>
        </div>
        <div className='service-card' id='card-2'>
            <h3>illuminate</h3>
        </div>
        <div className='service-card' id='card-3'>
            <h3>Glow</h3>
        </div>
        <div className='service-card' id='card-4'>
            <h3>shine</h3>
        </div>
        <div className='service-card' id='card-5'>
            <h3>shimmer</h3>
        </div>
      </div>
    </section>
  )
}

export default Services