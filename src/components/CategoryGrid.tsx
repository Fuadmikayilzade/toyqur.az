import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { categories } from "@/data/mockData";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

const CategoryIcon = ({ id }: { id: string }) => {
  const icons: Record<string, React.ReactElement> = {
    "wedding-hall": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M3 21h18M4 21V8l8-5 8 5v13M9 21V15h6v6M9 9h2m4 0h-2"/></svg>,
    "banquet-hall": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M4 21v-7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7M2 10l10-7 10 7"/><rect x="9" y="15" width="6" height="6"/></svg>,
    "photographer": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    "videographer": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
    "mobilograf": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/><path d="M9 6h6"/></svg>,
    "cake": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2 1 2 1"/><path d="M2 21h20"/><path d="M7 8v2M12 8v2M17 8v2"/><path d="M7 4h.01M12 4h.01M17 4h.01"/></svg>,
    "buket": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22V12"/>
        <path d="M12 12C12 12 8 9 8 6a4 4 0 0 1 8 0c0 3-4 6-4 6z"/>
        <path d="M12 12C12 12 15.5 8.5 18 9a3 3 0 0 1-3 5c-1.5 0-3-2-3-2z"/>
        <path d="M12 12C12 12 8.5 8.5 6 9a3 3 0 0 0 3 5c1.5 0 3-2 3-2z"/>
        <path d="M9 22h6"/>
      </svg>
    ),
    "gelinlik-buketi": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 22V12"/>
        <path d="M12 12C12 12 8 9 8 6a4 4 0 0 1 8 0c0 3-4 6-4 6z"/>
        <path d="M12 12C12 12 15.5 8.5 18 9a3 3 0 0 1-3 5c-1.5 0-3-2-3-2z"/>
        <path d="M12 12C12 12 8.5 8.5 6 9a3 3 0 0 0 3 5c1.5 0 3-2 3-2z"/>
        <path d="M9 22h6"/>
        <path d="M10 2c0 0-.5 1.5 0 2.5"/>
        <path d="M14 2c0 0 .5 1.5 0 2.5"/>
      </svg>
    ),
    "xonca": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M3 9h18l-2 10H5L3 9z"/>
        <path d="M7 9V7a5 5 0 0 1 10 0v2"/>
        <path d="M10 13c.5 1 1 2 2 2s1.5-1 2-2"/>
        <path d="M9 9v1M15 9v1"/>
      </svg>
    ),
    "invitation": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    "mc": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    "car": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
    "decoration": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    "music": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
    "dress": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 2c0 0-1 1.5-1 3s1 2 1 2 1-.5 1-2-1-3-1-3z"/>
        <path d="M9 7L6 10l-3 11h18L18 10l-3-3"/>
        <path d="M9 7c0 0 .5 2 3 2s3-2 3-2"/>
      </svg>
    ),
    "groom-suit": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M12 11v10M9 14l3-3 3 3"/></svg>,
    "dj": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>,
    "singer": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M7 21l1-6M17 21l-1-6M9 21h6"/></svg>,
    "dance-group": (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="7" cy="3.5" r="1.5"/><path d="M5 7l-1.5 4 2 1.5L4 17"/><path d="M5 7l2.5 1 1.5-1"/><path d="M4 17l-1 3M4 17l2 3"/>
        <circle cx="17" cy="3.5" r="1.5"/><path d="M19 7l1.5 4-2 1.5L20 17"/><path d="M19 7l-2.5 1-1.5-1"/><path d="M20 17l1 3M20 17l-2 3"/>
      </svg>
    ),
    "beauty-salon": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    "bride-assistant": <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  };
  return icons[id] || <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6"><circle cx="12" cy="12" r="10"/></svg>;
};

const CategoryGrid = () => {
  const { t } = useLanguage();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCounts = async () => {
      const { data } = await supabase
        .from("services")
        .select("category")
        .eq("is_approved", true);
      if (!data) return;
      const c: Record<string, number> = {};
      for (const row of data) {
        c[row.category] = (c[row.category] || 0) + 1;
      }
      setCounts(c);
    };
    fetchCounts();
  }, []);

  const venueCategories = categories.filter((c) => !!c.group);
  const otherCategories = categories.filter((c) => !c.group);

  const cardStyle = {
    background: "linear-gradient(135deg, hsl(30 40% 97%) 0%, hsl(24 34% 93%) 100%)",
    border: "1px solid hsl(25 28% 87%)",
    boxShadow: "0 1px 4px hsl(25 20% 78% / 0.3)",
  };
  const iconStyle = { background: "hsl(25 30% 84%)", color: "hsl(20 25% 32%)" };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] font-medium mb-3" style={{ color: "hsl(15 30% 55%)" }}>{t("categories")}</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">{t("allCategories")}</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">{t("heroSub")}</p>
        </div>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground px-2">{t("cat.group.venues")}</h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {venueCategories.map((cat) => (
              <Link key={cat.id} to={`/categories?cat=${cat.id}`}
                className="group flex items-center gap-4 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                style={cardStyle}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110" style={iconStyle}>
                  <CategoryIcon id={cat.id} />
                </div>
                <div>
                  <span className="font-semibold text-sm block" style={{ color: "hsl(20 20% 18%)" }}>{t(`cat.${cat.id}`) || cat.name}</span>
                  <span className="text-xs" style={{ color: "hsl(20 12% 55%)" }}>{counts[cat.id] ?? 0} {t("services")}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <Link to="/categories" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "hsl(16 38% 48%)" }}>
              {t("seeAll")} →
            </Link>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <h3 className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground px-2">{t("cat.group.other")}</h3>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {otherCategories.map((cat, i) => (
              <Link key={cat.id} to={`/categories?cat=${cat.id}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                style={{ ...cardStyle, animationDelay: `${i * 40}ms` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110" style={iconStyle}>
                  <CategoryIcon id={cat.id} />
                </div>
                <div className="text-center">
                  <span className="font-semibold text-xs block leading-tight" style={{ color: "hsl(20 20% 18%)" }}>{t(`cat.${cat.id}`) || cat.name}</span>
                  <span className="text-xs mt-0.5 block" style={{ color: "hsl(20 12% 55%)" }}>{counts[cat.id] ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <Link to="/categories" className="text-sm font-medium transition-opacity hover:opacity-70" style={{ color: "hsl(16 38% 48%)" }}>
              {t("seeAll")} →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;