type NavLink = { label: string; href: string };

type NavProps = {
  logo: NavLink;
  links: NavLink[];
};

export default function Nav({ logo, links }: NavProps) {
  return (
    <nav>
      <div className="logo">
        <a href={logo.href}>{logo.label}</a>
      </div>

      <div className="links">
        {links.map((link) => (
          <a href={link.href} key={link.label}>
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}