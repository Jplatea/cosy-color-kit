import logo from "@/assets/cyp-logo.jpg";

export function SiteFooter() {
  return (
    <footer className="border-t border-cyp-cream/10 px-6 py-11 lg:px-10">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-[9px] object-cover"
          />
          <span className="font-bagel text-[16px] text-cyp-cream/80">culowypililarge.com</span>
        </div>
        <div className="text-[13.5px] text-cyp-cream/40">
          © {new Date().getFullYear()} Culow y Pililarge · Hecho a mano y sin brazos
        </div>
      </div>
    </footer>
  );
}
