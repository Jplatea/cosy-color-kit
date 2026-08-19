import { Nav } from "@/components/cyp/Nav";
import { Hero } from "@/components/cyp/Hero";
import { Videos } from "@/components/cyp/Videos";
import { Shorts } from "@/components/cyp/Shorts";
import { Personajes } from "@/components/cyp/Personajes";
import { HazlosHablar } from "@/components/cyp/HazlosHablar";
import { Vestidor } from "@/components/cyp/Vestidor";
import { Poemas } from "@/components/cyp/Poemas";
import { InstagramFeed } from "@/components/cyp/InstagramFeed";
import { Visitas } from "@/components/cyp/Visitas";
import { Contacto } from "@/components/cyp/Contacto";
import { SiteFooter } from "@/components/cyp/SiteFooter";
import { useSectionTracking } from "@/hooks/useVisitas";
import { Redes } from "@/components/cyp/Redes";

const Index = () => {
  useSectionTracking();

  return (
    <div className="min-w-0 overflow-x-hidden bg-cyp-ink text-cyp-cream">
      <Nav />
      <Hero />
      <Videos />
      <Shorts />
      <Personajes />
      <HazlosHablar />
      <Vestidor />
      <Poemas />
      <InstagramFeed />
      <Visitas />
      <Contacto />
      <SiteFooter />
            <Redes />
    </div>
  );
};

export default Index;
