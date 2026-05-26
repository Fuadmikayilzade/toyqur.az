import { useSEO } from "@/hooks/useSEO";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedListings from "@/components/FeaturedListings";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { Headphones, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const WA_NUMBER = "994104195344";

const Index = () => {
  const { t } = useLanguage();
  useSEO({ title: "ToyQur.az — Toy Xidmətləri Platforması" });

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSlider />
      <FeaturedListings />
      <CategoryGrid />
      <Testimonials />

      {/* Professional Support Banner */}
      <section className="py-12 bg-gradient-to-r from-primary/5 to-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Headphones className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-foreground">{t("supportBlockTitle")}</h3>
                <p className="text-sm text-muted-foreground">{t("supportBlockDesc")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/support" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                {t("learnMore")}
              </Link>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-[hsl(142,70%,45%)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />


    </div>
  );
};

export default Index;