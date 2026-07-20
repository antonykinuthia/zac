type HeroProps = {
  footerItems: string[];
};

export default function Hero({ footerItems }: HeroProps) {
  return (
    <section className="hero">
      <div className="header">
        <h1>
          Galleri<span>e</span>
        </h1>
      </div>

      <div className="hero-footer">
        {footerItems.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </section>
  );
}