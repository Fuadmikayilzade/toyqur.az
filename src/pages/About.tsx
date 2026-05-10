import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Heart, Users, Shield, Award } from "lucide-react";

const About = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Heart, titleKey: "feat1Title" as const, descKey: "feat1Desc" as const },
    { icon: Users, titleKey: "feat2Title" as const, descKey: "feat2Desc" as const },
    { icon: Shield, titleKey: "feat3Title" as const, descKey: "feat3Desc" as const },
    { icon: Award, titleKey: "feat4Title" as const, descKey: "feat4Desc" as const },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-6">
              {t("aboutTitle")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("aboutSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
            {features.map((f) => (
              <div key={f.titleKey} className="bg-card border border-border rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-rose-light flex items-center justify-center text-primary mb-4">
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-semibold text-foreground mb-2">{t(f.titleKey)}</h3>
                <p className="text-sm text-muted-foreground">{t(f.descKey)}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto bg-secondary/50 border border-border rounded-2xl p-8 text-center">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">{t("missionTitle")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("missionText")}</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;
