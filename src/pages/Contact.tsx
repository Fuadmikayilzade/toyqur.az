import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const PHONE = "+994 10 419 53 44";
const WA_NUMBER = "994104195344";

const Contact = () => {
  const { t } = useLanguage();
  useSEO({ title: t("contact") });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {t("contactTitle")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("contactSub")}
            </p>
          </div>

          <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
              className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-serif font-semibold text-foreground mb-1">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">{PHONE}</p>
            </a>

            <a href={`tel:${PHONE.replace(/\s/g, "")}`}
              className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-serif font-semibold text-foreground mb-1">Telefon</h3>
              <p className="text-sm text-muted-foreground">{PHONE}</p>
            </a>

            <a href="mailto:info@toyqur.az"
              className="bg-card border border-border rounded-2xl p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all">
              <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-serif font-semibold text-foreground mb-1">{t("contactEmail")}</h3>
              <p className="text-sm text-muted-foreground">info@toyqur.az</p>
            </a>

            <div className="bg-card border border-border rounded-2xl p-6 text-center">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-serif font-semibold text-foreground mb-1">{t("contactAddress")}</h3>
              <p className="text-sm text-muted-foreground">{t("contactCity")}</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-secondary/50 border border-border rounded-2xl p-8 text-center">
            <h2 className="text-xl font-serif font-bold text-foreground mb-3">{t("vendorCtaTitle")}</h2>
            <p className="text-muted-foreground mb-4">{t("vendorCtaDesc")}</p>
            <Button size="lg" className="rounded-full px-8" asChild>
              <a href="/auth?mode=register">{t("vendorCtaBtn")}</a>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
