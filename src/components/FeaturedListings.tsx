import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ListingCard from "./ListingCard";
import { categories } from "@/data/mockData";
import { Link } from "react-router-dom";

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

// Skeleton card for loading
const SkeletonCard = () => (
  <div
    className="w-[290px] flex-shrink-0 rounded-2xl overflow-hidden animate-pulse"
    style={{
      background: "linear-gradient(160deg, hsl(28 38% 97%) 0%, hsl(22 32% 94%) 100%)",
      border: "1px solid hsl(25 28% 88%)",
    }}
  >
    <div className="aspect-[4/3]" style={{ background: "hsl(25 26% 90%)" }} />
    <div className="p-4 space-y-2.5">
      <div className="h-4 rounded-lg w-3/4" style={{ background: "hsl(25 26% 89%)" }} />
      <div className="h-3 rounded-lg w-1/2" style={{ background: "hsl(25 26% 91%)" }} />
    </div>
  </div>
);

const toListingFormat = (s: ServiceItem, askPrice: string) => ({
  id: s.id,
  title: s.title,
  category: s.category,
  location: s.location || "",
  priceRange: s.price_min
    ? (s.price_max ? `min ₼${s.price_min} — max ₼${s.price_max}` : `min ₼${s.price_min}`)
    : askPrice,
  rating: s.rating || 0,
  reviewCount: s.review_count || 0,
  image: s.images?.[0] || "/placeholder.svg",
  vendor: "",
  featured: false,
  description: s.description || "",
  images: s.images || [],
});

const HorizontalSlider = ({ title, items, catId }: { title: string; items: ServiceItem[]; catId?: string }) => {
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
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  const catIcon = categories.find((c) => c.id === (catId || ""))?.emoji || "✦";

  // Build "see all" link — for venues group link to wedding-hall, etc.
  const seeAllHref = catId ? `/categories?cat=${catId}` : "/categories";

  return (
    <div className="mb-14 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground flex items-center gap-2.5">
          <span className="text-lg opacity-70">{catIcon}</span>
          {title}
        </h3>
        <Link
          to={seeAllHref}
          className="text-sm font-medium flex items-center gap-1 transition-opacity hover:opacity-70 flex-shrink-0 ml-4"
          style={{ color: "hsl(16 38% 48%)" }}
        >
          {t("seeAll")} →
        </Link>
      </div>

      {/* Slider wrapper with side arrows */}
      <div className="relative group">
        {/* Left arrow */}
        {canLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all"
            style={{ background: "hsl(16 38% 38%)", boxShadow: "0 2px 12px hsl(16 38% 30%/0.4)" }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}

        {/* Right arrow */}
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
          {items.map((s) => (
            <div key={s.id} className="w-[290px] flex-shrink-0 snap-start">
              <ListingCard listing={toListingFormat(s, t("askPrice"))} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeaturedListings = () => {
  const { t } = useLanguage();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("services")
        .select("id, title, category, location, price_min, price_max, rating, review_count, images, description")
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      setServices((data as ServiceItem[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const weddingHallServices = services.filter((s) => s.category === "wedding-hall");
  const banquetHallServices = services.filter((s) => s.category === "banquet-hall");
  const otherServices = services.filter(
    (s) => !["wedding-hall", "banquet-hall"].includes(s.category)
  );

  // Group other services by category, preserve insertion order
  const otherByCategory = (() => {
    const map = new Map<string, ServiceItem[]>();
    for (const s of otherServices) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return Array.from(map.entries()).map(([catId, items]) => ({
      catId,
      title: t(`cat.${catId}`) || catId,
      items,
    }));
  })();

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-3 rounded-full w-24 mx-auto mb-4 animate-pulse" style={{ background: "hsl(25 26% 88%)" }} />
            <div className="h-8 rounded-xl w-64 mx-auto animate-pulse" style={{ background: "hsl(25 26% 88%)" }} />
          </div>
          <div className="flex gap-5 overflow-hidden pb-4">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (services.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-2" style={{ color: "hsl(15 30% 55%)" }}>
            {t("featuredOn")}
          </p>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            {t("featuredTitle")}
          </h2>
        </div>

        <HorizontalSlider title={t("cat.wedding-hall")} items={weddingHallServices} catId="wedding-hall" />
        <HorizontalSlider title={t("cat.banquet-hall")} items={banquetHallServices} catId="banquet-hall" />
        {otherByCategory.map(({ catId, title, items }) => (
          <HorizontalSlider key={catId} title={title} items={items} catId={catId} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedListings;