import { Nav } from "@/components/cyp/Nav";
import { Hero } from "@/components/cyp/Hero";
import { Videos } from "@/components/cyp/Videos";
import { Shorts } from "@/components/cyp/Shorts";
import { Personajes } from "@/components/cyp/Personajes";
import { HazlosHablar } from "@/components/cyp/HazlosHablar";
import { Vestidor } from "@/components/cyp/Vestidor";
import { Poemas } from "@/components/cyp/Poemas";
import { Redes } from "@/components/cyp/Redes";
import { Tienda } from "@/components/cyp/Tienda";
import { Subasta } from "@/components/cyp/Subasta";
import { Test } from "@/components/cyp/Test";
import { Visitas } from "@/components/cyp/Visitas";
import { Contacto } from "@/components/cyp/Contacto";
import { SiteFooter } from "@/components/cyp/SiteFooter";
import { useSectionTracking } from "@/hooks/useVisitas";

const Index = () => {
  useSectionTracking();

  return (
    <div className="min-w-0 overflow-x-hidden">
      <Nav />
      <Hero />
      <Videos />
      <Shorts />
      <Personajes />
      <HazlosHablar />
      <Vestidor />
      <Test />
      <Poemas />
      <Subasta />
      <Redes />
      <Tienda />
      <Visitas />
      <Contacto />
      <SiteFooter />
    </div>
  );
};

export default Index;
