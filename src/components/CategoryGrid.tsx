import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ListingCard from "@/components/ListingCard";

interface ServiceItem {
  id: string;
  title: string;
  category: string;
  location: string | null;
  price_min: number | null;
  price_max: number | null;
  rating: number | null;
  review_count: number | null;
  images: string[] | null;
  description: string | null;
}

const CategorySlider = ({ catId, title, items }: { catId: string; title: string; items: ServiceItem[] }) => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
  };

  const cat = categories.find(c => c.id === catId);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground flex items-center gap-2.5">
          <span className="text-lg opacity-70">{cat?.emoji || "✦"}</span>
          {title}
        </h3>
        <Link
          to={`/categories?cat=${catId}`}
          className="text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70 flex-shrink-0 ml-4"
          style={{ color: "hsl(16 38% 48%)" }}
        >
          {t("seeAll")} →
        </Link>
      </div>

      <div className="relative group">
        {canLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all"
            style={{ background: "hsl(16 38% 38%)", boxShadow: "0 2px 12px hsl(16 38% 30%/0.4)" }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}
        {canRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all"
            style={{ background: "hsl(16 38% 38%)", boxShadow: "0 2px 12px hsl(16 38% 30%/0.4)" }}
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateArrows}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map(s => (
            <div key={s.id} className="w-[270px] flex-shrink-0 snap-start">
              <ListingCard listing={{
                id: s.id, title: s.title, category: s.category,
                location: s.location || "",
                priceRange: s.price_min
                  ? (s.price_max ? `min ₼${s.price_min} — max ₼${s.price_max}` : `min ₼${s.price_min}`)
                  : t("askPrice"),
                rating: s.rating || 0,
                reviewCount: s.review_count || 0,
                image: s.images?.[0] || "/placeholder.svg",
                vendor: "", featured: false,
                description: s.description || "",
                images: s.images || [],
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategoryGrid = () => {
  const { t } = useLanguage();
  const [servicesByCategory, setServicesByCategory] = useState<Map<string, ServiceItem[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      const { data } = await supabase
        .from("services")
        .select("id, title, category, location, price_min, price_max, rating, review_count, images, description")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      const map = new Map<string, ServiceItem[]>();
      for (const s of (data as ServiceItem[]) || []) {
        if (!map.has(s.category)) map.set(s.category, []);
        map.get(s.category)!.push(s);
      }
      setServicesByCategory(map);
      setLoading(false);
    };
    fetchServices();
  }, []);

  // Order: venues first, then others in categories order
  const orderedCats = categories.filter(c => servicesByCategory.has(c.id) && (servicesByCategory.get(c.id)?.length ?? 0) > 0);

  if (loading) {
    return (
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="h-8 rounded-xl w-48 mx-auto mb-10 animate-pulse" style={{ background: "hsl(25 26% 88%)" }} />
          {[1, 2].map(i => (
            <div key={i} className="mb-12">
              <div className="h-6 rounded-lg w-40 mb-5 animate-pulse" style={{ background: "hsl(25 26% 88%)" }} />
              <div className="flex gap-5 overflow-hidden">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="w-[270px] flex-shrink-0 rounded-2xl overflow-hidden animate-pulse" style={{ background: "hsl(25 26% 90%)" }}>
                    <div className="aspect-[4/3]" />
                    <div className="p-4 space-y-2"><div className="h-4 rounded w-3/4" style={{ background: "hsl(25 26% 88%)" }} /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (orderedCats.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: "hsl(15 30% 55%)" }}>
            {t("categories")}
          </p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
            {t("allCategories")}
          </h2>
        </div>

        {orderedCats.map(cat => (
          <CategorySlider
            key={cat.id}
            catId={cat.id}
            title={t(`cat.${cat.id}`) || cat.name}
            items={servicesByCategory.get(cat.id) || []}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;