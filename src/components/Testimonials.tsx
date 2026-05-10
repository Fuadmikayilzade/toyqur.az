import { Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Testimonials = () => {
  const { t } = useLanguage();

  const items = [
    { id: "1", name: "Aynur & Rəşad", textKey: "test1text" as const, rating: 5, avatar: "A" },
    { id: "2", name: "Günel & Tural",  textKey: "test2text" as const, rating: 5, avatar: "G" },
    { id: "3", name: "Səbinə & Elvin", textKey: "test3text" as const, rating: 5, avatar: "S" },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            {t("testimonialsTitle")}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("testimonialsSub")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                ))}
              </div>
              <p className="text-foreground/80 text-sm leading-relaxed mb-4">"{t(item.textKey)}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-bold text-sm">
                  {item.avatar}
                </div>
                <span className="font-medium text-sm text-foreground">{item.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
