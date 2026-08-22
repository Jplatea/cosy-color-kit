import { LogoMark } from "./Logo";
import { socials } from "@/config/cyp";

/** El pie: la placa de la entrada, con el horario que nadie cumple. */
export function SiteFooter() {
  return (
    <footer className="border-t border-museo-linea px-6 py-11 lg:px-8">
      <div className="mx-auto grid max-w-[1180px] gap-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="flex items-center gap-4">
          <LogoMark className="h-[22px] w-[28px] text-museo-tinta" />
          <div>
            <div className="font-display text-[19px] leading-none text-museo-tinta">
              Museo Culow &amp; Pililarge
            </div>
            <div className="cartela mt-[7px] text-museo-tinta-tenue">
              Abierto todos los días · Entrada gratuita · No se vende nada
            </div>
          </div>
        </div>

        <div className="cartela text-museo-tinta-tenue sm:text-right">
          <a href={socials.youtube} target="_blank" rel="noopener" className="hover:text-museo-laton">
            culowypililarge.com
          </a>
          <div className="mt-[7px]">
            © {new Date().getFullYear()} · Hecho a mano y sin prisa
          </div>
        </div>
      </div>
    </footer>
  );
}
