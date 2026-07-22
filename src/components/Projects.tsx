import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useRef } from "react";
import { onGalleryReady } from "../lib/GalleryReady";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Projects = () => {
  const container = useRef<HTMLElement | null>(null);

  useGSAP(() => {
    
    const spotlightSection = container.current;
    if (!spotlightSection) return;

    let trigger: ScrollTrigger | undefined;

    
    const unsubscribe = onGalleryReady(() => {
    
      const projectIndex = spotlightSection.querySelector<HTMLElement>('.project-index h1');
      const projectImagesContainer = spotlightSection.querySelector<HTMLElement>('.project-images');
      const projectNamesContainer = spotlightSection.querySelector<HTMLElement>('.project-names');
      const projectImgs = spotlightSection.querySelectorAll<HTMLElement>('.project-img');
      const projectNames = spotlightSection.querySelectorAll<HTMLElement>('.project-names p');

   
      if (!projectIndex || !projectImagesContainer || !projectNamesContainer) return;

      const totalProjectCount = projectNames.length;

      const spotlightSectionHeight = spotlightSection.clientHeight;
      const spotlightSectionPadding = parseFloat(getComputedStyle(spotlightSection).padding);
      const projectIndexHeight = projectIndex.clientHeight;
      const containerHeight = projectNamesContainer.clientHeight;
      const imagesHeight = projectImagesContainer.clientHeight;

      const moveDistanceIndex = spotlightSectionHeight - spotlightSectionPadding * 2 - projectIndexHeight;
      const moveDistanceNames = spotlightSectionHeight - spotlightSectionPadding * 2 - containerHeight;
      const moveDistanceImages = window.innerHeight - imagesHeight;
      const imgActivationThreshold = window.innerHeight / 2;

     


      trigger = ScrollTrigger.create({
        trigger: spotlightSection, 
        start: 'top top',
        end: `+=${window.innerHeight * 2}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
        const progress = self.progress;
        const currentIndex = Math.min(Math.floor(progress * totalProjectCount) + 1, totalProjectCount);

 
        if (projectIndex) {
          projectIndex.textContent = `${String(currentIndex).padStart(2, "0")}/${String(totalProjectCount).padStart(2, "0")}`;
        }

        gsap.set(projectIndex, {
          y: progress * moveDistanceIndex,
        });

        gsap.set(projectImagesContainer, {
          y: progress * moveDistanceImages,
        });

        projectImgs.forEach((img) => {
          const imgRect = img.getBoundingClientRect();
          const imgTop = imgRect.top;
          const imgBottom = imgRect.bottom;

          if (imgTop <= imgActivationThreshold && imgBottom >= -imgActivationThreshold) {
            gsap.set(img, { opacity: 1 });
          } else {
            gsap.set(img, { opacity: 0.5 });
          }
        });

        projectNames.forEach((p, index) => {
          const startProgress = index / totalProjectCount;
          const endProgress = (index + 1) / totalProjectCount;
          const projectProgress = Math.max(
            0,
            Math.min(1, (progress - startProgress) / (endProgress - startProgress)),
          );

          gsap.set(p, {
            y: -projectProgress * moveDistanceNames,
          });

          if (projectProgress > 0 && projectProgress < 1) {
            gsap.set(p, { color: '#000000' });
          } else {
            gsap.set(p, { color: '#4a4a4a' });
          }
        });

        },
      });
      ScrollTrigger.refresh();
    });

    return () => {
      unsubscribe();
      trigger?.kill();
    };
  }, { scope: container });

  return (
    <section className='spotlight' ref={container}>
    
      
      <div className='project-index'>
        <h1>01/20</h1>
      </div>
      <div className='project-images'>
        <div className="project-img"><img src='/project/photo.jpg' /></div>
        <div className="project-img"><img src='/project/photo2.jpg' /></div>
        <div className="project-img"><img src='/project/photo3.jpg'/></div>
        <div className="project-img"><img src='/project/photo4.jpg' /></div>
        <div className="project-img"><img src='/project/photo5.jpg' /></div>
        <div className="project-img"><img src='/project/photo6.jpg' /></div>
        <div className="project-img"><img src='/project/photo7.jpg' /></div>
        <div className="project-img"><img src='/project/photo8.jpg' /></div>
        <div className="project-img"><img src='/project/photo9.jpg' /></div>
        <div className="project-img"><img src='/project/photo10.jpg' /></div>
      </div>
      <div className='project-names'>
        <p>Night Visuals</p>
        <p>Lost in the wild</p>
        <p>untamed wildernes</p>
        <p>New perspective</p>
        <p>Split The lines</p>
        <p>Unmatched Beauty</p>
        <p>Untapped Ideas</p>
        <p>Blue haze</p>
        <p>Blinding Lights</p>
        <p>In The action</p>
      </div>
      <div className='end_text'>
         <p>A curated collection of my work</p>
      </div>
    </section>
  );
};

export default Projects;