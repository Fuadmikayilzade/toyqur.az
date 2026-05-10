import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Headphones, MessageCircle, Phone, Mail, Clock, Shield, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

const PHONE = "+994 10 419 53 44";
const WA_NUMBER = "994104195344";

const Support = () => {
  const { t } = useLanguage();
  useSEO({ title: t("support") });

  const supportFeatures = [
    { icon: Clock, title: t("sup1Title"), desc: t("sup1Desc") },
    { icon: Users, title: t("sup2Title"), desc: t("sup2Desc") },
    { icon: Shield, title: t("sup3Title"), desc: t("sup3Desc") },
    { icon: Zap, title: t("sup4Title"), desc: t("sup4Desc") },
  ];

  const steps = [
    { step: "1", title: t("step1Title"), desc: t("step1Desc") },
    { step: "2", title: t("step2Title"), desc: t("step2Desc") },
    { step: "3", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Headphones className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              {t("supportTitle")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("supportDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            {supportFeatures.map((f) => (
              <div key={f.title} className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-8">
              {t("faqTitle")}
            </h2>
            <div className="space-y-4">
              {steps.map((item) => (
                <div key={item.step} className="flex gap-4 items-start p-5 bg-card border border-border rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary/5 via-secondary to-secondary rounded-2xl p-8 border border-border text-center">
            <h2 className="text-xl font-serif font-bold text-foreground mb-4">{t("contactNow")}</h2>
            <p className="text-muted-foreground mb-6">{t("supportHelp")}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="rounded-xl bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white" asChild>
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl" asChild>
                <a href={`tel:${PHONE.replace(/\s/g, "")}`}>
                  <Phone className="w-5 h-5 mr-2" />
                  {PHONE}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="rounded-xl" asChild>
                <a href="mailto:info@toyqur.az">
                  <Mail className="w-5 h-5 mr-2" />
                  E-poçt
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Support;
