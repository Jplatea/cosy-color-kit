import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/cyp-logo.jpg";
import { nav, socials } from "@/config/cyp";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-[60] border-b border-cyp-cream/10 bg-cyp-ink/[0.72] backdrop-blur-[18px] backdrop-saturate-150">
      <div className="flex items-center gap-7 px-6 py-[14px] lg:px-10">
        <a href="#inicio" className="mr-auto flex items-center gap-3">
          <img
            src={logo}
            alt="Culow y Pililarge"
            width={38}
            height={38}
            className="h-[38px] w-[38px] rounded-[11px] object-cover"
          />
          <span className="font-bagel text-[19px] tracking-[0.01em] text-cyp-cream-hi">
            Culow y Pililarge
          </span>
        </a>

        <div className="hidden items-center gap-[22px] font-bagel text-[15px] tracking-[0.005em] text-cyp-cream/[0.72] lg:flex">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="transition-colors hover:text-cyp-gold">
              {item.label}
            </a>
          ))}
        </div>

        <a
          href={socials.youtube}
          target="_blank"
          rel="noopener"
          className="hidden rounded-full bg-cyp-gold px-5 py-[10px] font-bagel text-[14.5px] text-cyp-on-gold transition-colors hover:bg-cyp-gold-hi sm:inline-block"
        >
          Suscríbete
        </a>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          className="rounded-[10px] border border-cyp-cream/20 p-2 text-cyp-cream lg:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="grid gap-1 border-t border-cyp-cream/10 px-6 pb-5 pt-3 font-bagel text-[17px] text-cyp-cream/[0.72] lg:hidden">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-2 transition-colors hover:text-cyp-gold"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
