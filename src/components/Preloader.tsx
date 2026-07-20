import type { RefObject } from "react";

type PreloaderProps = {
  images: string[];
  counterRef: RefObject<HTMLParagraphElement | null>;
};

export default function Preloader({ images, counterRef }: PreloaderProps) {
  return (
    <div className="preload">
      <div className="preload-image">
        {images.map((src) => (
          <div className="preload-img" key={src}>
            <img src={src} alt="" />
          </div>
        ))}
      </div>

      <div className="preload-header">
        <h1>
          Galleri<span>e</span>
        </h1>

        <div className="preload-counter">
          <p ref={counterRef}>000</p>
        </div>
      </div>
    </div>
  );
}