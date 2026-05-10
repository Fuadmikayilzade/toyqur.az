import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const CTASection = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-rose-light to-gold-light">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          {t("ctaTitle")}
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          {t("ctaDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" className="rounded-full px-8" asChild>
            <Link to="/auth?mode=register">
              {t("ctaBtn")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8" asChild>
            <Link to="/categories">{t("browseSvcs")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
