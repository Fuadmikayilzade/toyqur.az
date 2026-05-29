import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { categories } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

const CatIcon = ({ id }: { id: string }) => {
  const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const icons: Record<string, React.ReactElement> = {
    "wedding-hall":    <svg viewBox="0 0 24 24" {...s}><path d="M3 21h18M4 21V9l8-6 8 6v12"/><rect x="9" y="14" width="6" height="7"/><path d="M9 10h2m4 0h-2"/></svg>,
    "banquet-hall":    <svg viewBox="0 0 24 24" {...s}><path d="M2 10l10-7 10 7v11H2z"/><path d="M9 21v-6h6v6"/></svg>,
    "photographer":    <svg viewBox="0 0 24 24" {...s}><rect x="2" y="6" width="20" height="15" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6l2-3h4l2 3"/></svg>,
    "videographer":    <svg viewBox="0 0 24 24" {...s}><rect x="1" y="6" width="15" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3V10z"/></svg>,
    "mobilograf":      <svg viewBox="0 0 24 24" {...s}><rect x="7" y="2" width="10" height="20" rx="2"/><circle cx="12" cy="17" r="1" fill="currentColor"/><path d="M10 6h4"/></svg>,
    "cake":            <svg viewBox="0 0 24 24" {...s}><path d="M4 21h16M3 12h18v9H3z"/><path d="M7 12V9a5 5 0 0 1 10 0v3"/><path d="M7 5.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zm6 0a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z"/></svg>,
    "buket":           <svg viewBox="0 0 24 24" {...s}><path d="M12 22v-8"/><path d="M12 14s-5-3-5-7a5 5 0 0 1 10 0c0 4-5 7-5 7z"/><path d="M12 14s3.5-4 6-3a3 3 0 0 1-3 5c-1.5 0-3-2-3-2z"/><path d="M12 14s-3.5-4-6-3a3 3 0 0 0 3 5c1.5 0 3-2 3-2z"/></svg>,
    "gelinlik-buketi": <svg viewBox="0 0 24 24" {...s}><path d="M12 22v-8"/><path d="M12 14s-4-2.5-4-6a4 4 0 0 1 8 0c0 3.5-4 6-4 6z"/><path d="M9 22h6"/><circle cx="12" cy="3" r="1" fill="currentColor"/></svg>,
    "xonca":           <svg viewBox="0 0 24 24" {...s}><path d="M5 8h14l-1.5 11H6.5L5 8z"/><path d="M3 8h18"/><path d="M9 8V5a3 3 0 0 1 6 0v3"/><path d="M10 13c.5 1 1 2 2 2s1.5-1 2-2"/></svg>,
    "invitation":      <svg viewBox="0 0 24 24" {...s}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>,
    "mc":              <svg viewBox="0 0 24 24" {...s}><path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 11a7 7 0 0 1-14 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="9" y1="22" x2="15" y2="22"/></svg>,
    "car":             <svg viewBox="0 0 24 24" {...s}><path d="M5 17H3a2 2 0 0 1-2-2v-5l3-6h16l3 6v5a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M7 10h10"/></svg>,
    "decoration":      <svg viewBox="0 0 24 24" {...s}><path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>,
    "music":           <svg viewBox="0 0 24 24" {...s}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    "dress":           <svg viewBox="0 0 24 24" {...s}><path d="M12 2s-1 2-1 4 1 3 1 3 1-1 1-3-1-4-1-4z"/><path d="M8 9l-4 13h16L16 9"/><path d="M8 9c0 0 1.5 2 4 2s4-2 4-2"/></svg>,
    "groom-suit":      <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v4M10 13l2 2 2-2"/></svg>,
    "dj":              <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>,
    "singer":          <svg viewBox="0 0 24 24" {...s}><path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M8 21l1-5M16 21l-1-5M7 21h10"/><path d="M19 11a7 7 0 0 1-14 0"/></svg>,
    "dance-group":     <svg viewBox="0 0 24 24" {...s}><circle cx="7" cy="3" r="1.5"/><path d="M5 7l-1 5 2 1-1 5M5 7l2 1 2-1"/><circle cx="17" cy="3" r="1.5"/><path d="M19 7l1 5-2 1 1 5M19 7l-2 1-2-1"/></svg>,
    "beauty-salon":    <svg viewBox="0 0 24 24" {...s}><path d="M20 7s-1-2-8-2-8 2-8 2v3a8 8 0 0 0 16 0V7z"/><path d="M8 13s1 2 4 2 4-2 4-2"/></svg>,
    "bride-assistant": <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="7" r="4"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/><path d="M16 3.5A4 4 0 0 1 20 7"/></svg>,
  };
  return icons[id] || <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/></svg>;
};

const CategoryBar = () => {
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
    scrollRef.current?.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-medium mb-1" style={{ color: "hsl(15 30% 55%)" }}>
              {t("categories")}
            </p>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
              {t("allCategories")}
            </h2>
          </div>
          <Link to="/categories" className="text-sm font-medium hover:opacity-70 transition-opacity flex-shrink-0"
            style={{ color: "hsl(16 38% 44%)" }}>
            Hamısına bax →
          </Link>
        </div>

        <div className="relative">
          {canLeft && (
            <button onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: "hsl(16 38% 38%)" }}>
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
          )}
          {canRight && (
            <button onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md"
              style={{ background: "hsl(16 38% 38%)" }}>
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          )}

          <div ref={scrollRef} onScroll={updateArrows}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories?cat=${cat.id}`}
                className="group flex-shrink-0 flex flex-col items-center justify-center gap-3 rounded-2xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{
                  width: 100,
                  height: 100,
                  background: "linear-gradient(160deg, hsl(30 38% 97%) 0%, hsl(25 32% 93%) 100%)",
                  border: "1px solid hsl(25 26% 88%)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                  style={{ background: "hsl(25 26% 86%)", color: "hsl(20 22% 30%)" }}
                >
                  <div className="w-5 h-5">
                    <CatIcon id={cat.id} />
                  </div>
                </div>
                <span className="text-center font-medium leading-tight px-1"
                  style={{ fontSize: 10, color: "hsl(20 18% 28%)" }}>
                  {t(`cat.${cat.id}`) || cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryBar;