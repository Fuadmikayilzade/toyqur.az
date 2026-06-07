import { useSEO } from "@/hooks/useSEO";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin,
  Users, Banknote, ArrowUpDown, Star, Clock, TrendingUp, Heart, ChevronLeft, ChevronRight
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { categories } from "@/data/mockData";
import { cities, bakuDistricts, isVenueCategory, venueAmenities, cuisineTypes } from "@/data/locations";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORY_FILTERS, matchesCategoryFilters } from "@/data/categoryFilters";

// Returns first media (image or video) — whatever was uploaded first
const firstImage = (images?: string[] | null): string => images?.[0] || "/placeholder.svg";


interface ServiceListing {
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
  vendor_id: string;
  is_approved: boolean | null;
  created_at: string;
}

type SortOption = "newest" | "oldest" | "price_asc" | "price_desc";

const SkeletonCard = () => (
  <div
    className="rounded-2xl overflow-hidden animate-pulse"
    style={{
      background: "linear-gradient(160deg, hsl(28 38% 97%) 0%, hsl(22 32% 94%) 100%)",
      border: "1px solid hsl(25 28% 88%)",
    }}
  >
    <div className="aspect-[4/3]" style={{ background: "hsl(25 26% 90%)" }} />
    <div className="p-4 space-y-2.5">
      <div className="h-4 rounded-lg w-3/4" style={{ background: "hsl(25 26% 89%)" }} />
      <div className="h-3 rounded-lg w-1/2" style={{ background: "hsl(25 26% 91%)" }} />
      <div className="h-3 rounded-lg w-2/3" style={{ background: "hsl(25 26% 90%)" }} />
    </div>
  </div>
);

// EmptyState — inside this file so it can use the t() from parent
const EmptyState = ({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) => {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-serif font-semibold text-foreground mb-2">
        {hasFilters ? t("noResults") : t("noServices")}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        {hasFilters ? t("noResultsMsg") : t("noCatServices")}
      </p>
      {hasFilters ? (
        <button
          onClick={onClear}
          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {t("resetFilters")}
        </button>
      ) : (
        <a
          href="/"
          className="px-6 py-2.5 rounded-xl bg-secondary border border-border text-sm font-medium hover:bg-secondary/80 transition-colors"
        >
          {t("goHome")}
        </a>
      )}
    </div>
  );
};

// ── Category slider for "Hamısı" view ──
interface SliderItem {
  id: string; title: string; category: string; location: string | null;
  price_min: number | null; price_max: number | null; rating: number | null;
  review_count: number | null; images: string[] | null; description: string | null;
  vendor_profiles?: { brand_name: string | null; brand_logo: string | null } | null;
}

const AllCatSlider = ({ catId, title, items, toFormat }: {
  catId: string; title: string; items: SliderItem[];
  toFormat: (s: SliderItem) => Parameters<typeof ListingCard>[0]["listing"];
}) => {
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
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-serif font-bold text-foreground">{title}</h3>
        <Link to={`/categories?cat=${catId}`}
          className="text-sm font-medium transition-opacity hover:opacity-70 flex-shrink-0 ml-4"
          style={{ color: "hsl(16 38% 48%)" }}>
          {t("seeAll")} →
        </Link>
      </div>
      <div className="relative group">
        {canLeft && (
          <button onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "hsl(16 38% 38%)" }}>
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
        )}
        {canRight && (
          <button onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
            style={{ background: "hsl(16 38% 38%)" }}>
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        )}
        <div ref={scrollRef} onScroll={updateArrows}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}>
          {items.map(s => (
            <div key={s.id} className="w-[270px] flex-shrink-0 snap-start">
              <ListingCard listing={toFormat(s)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Categories = () => {
  const { t } = useLanguage();
  useSEO({ title: t("categories"), description: "Toy fotoqrafları, məkanlar, gəlinlik, dekor, tort, aparıcı və digər toy xidmətlərini kəşf edin." });
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("cat") || "";
  const initialQ = searchParams.get("q") || "";

  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [query, setQuery] = useState(initialQ);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [guestMin, setGuestMin] = useState("");
  const [guestMax, setGuestMax] = useState("");
  const [catFilterValues, setCatFilterValues] = useState<Record<string, string | string[] | boolean>>({});

  const setCatFilter = (key: string, value: string | string[] | boolean) =>
    setCatFilterValues(prev => ({ ...prev, [key]: value }));

  const toggleCatMultiFilter = (key: string, val: string) =>
    setCatFilterValues(prev => {
      const arr = (prev[key] as string[]) || [];
      return { ...prev, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] };
    });

  const currentCatFilters = CATEGORY_FILTERS[selectedCat] || [];

  const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof Clock }[] = [
    { value: "newest", label: t("sortNewest"), icon: Clock },
    { value: "price_asc", label: t("sortPriceAsc"), icon: TrendingUp },
    { value: "price_desc", label: t("sortPriceDesc"), icon: TrendingUp },
    { value: "oldest", label: t("sortOldest"), icon: Clock },
  ];

  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);

  const isVenue = isVenueCategory(selectedCat);
  const isLocationCat = ["buket", "gelinlik-buketi"].includes(selectedCat);
  const showLocationFilter = isVenue || isLocationCat || !selectedCat;

  // Sync state with URL params (when navigating from Navbar)
  useEffect(() => {
    const catFromUrl = searchParams.get("cat") || "";
    setSelectedCat(catFromUrl);
  }, [searchParams]);

  // Update URL params when category changes
  const handleCatChange = useCallback((catId: string) => {
    setSelectedCat(catId);
    setCatFilterValues({}); // Reset category filters on cat change
    const params = new URLSearchParams(searchParams);
    if (catId) params.set("cat", catId);
    else params.delete("cat");
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("is_approved", true);
      setServices((data as ServiceListing[]) || []);
      setLoading(false);
    };
    fetchServices();
  }, []);

  const filtered = useMemo(() => {
    let result = services.filter((s) => {
      const matchCat = !selectedCat || s.category === selectedCat;
      const matchQ = !query ||
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        (s.description || "").toLowerCase().includes(query.toLowerCase());
      const matchLocation = !selectedLocation || s.location === selectedLocation;
      const matchPriceMin = !priceMin || (s.price_min !== null && s.price_min >= Number(priceMin));
      const matchPriceMax = !priceMax || (s.price_min !== null && s.price_min <= Number(priceMax));
      const hasCatFilters = Object.values(catFilterValues).some(v => v !== "" && v !== false && (!Array.isArray(v) || v.length > 0));
      const matchCatFilters = !hasCatFilters || matchesCategoryFilters(s.description, s.category, catFilterValues);
      return matchCat && matchQ && matchLocation && matchPriceMin && matchPriceMax && matchCatFilters;
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "price_asc": return (a.price_min || 0) - (b.price_min || 0);
        case "price_desc": return (b.price_min || 0) - (a.price_min || 0);
        case "rating": return (b.rating || 0) - (a.rating || 0);
        default: return 0;
      }
    });

    return result;
  }, [selectedCat, query, selectedLocation, priceMin, priceMax, sortBy, services, catFilterValues]);

  const clearFilters = () => {
    setSelectedCat("");
    setQuery("");
    setPriceMin("");
    setPriceMax("");
    setSelectedLocation("");
    setSelectedDistrict("");
    setGuestCount("");
    setGuestMin("");
    setGuestMax("");
    setSelectedAmenities([]);
    setSelectedCuisines([]);
    setCatFilterValues({});
    setSortBy("newest");
    setSearchParams({}, { replace: true });
  };

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  const toggleCuisine = (c: string) =>
    setSelectedCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const hasActiveFilters = !!(selectedCat || query || priceMin || priceMax || selectedLocation || guestMin || guestMax ||
    guestCount || selectedDistrict || selectedAmenities.length || selectedCuisines.length || sortBy !== "newest" ||
    Object.values(catFilterValues).some(v => v !== "" && v !== false && (!Array.isArray(v) || v.length > 0)));

  const selectCls = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-colors";
  const inputCls = "w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors";
  const fieldStyle = {
    background: "hsl(28 38% 97%)",
    border: "1px solid hsl(25 28% 86%)",
    color: "hsl(20 20% 18%)",
  };

  const toListingFormat = (s: ServiceListing) => ({
    id: s.id,
    title: s.title,
    category: s.category,
    location: s.location || "",
    priceRange: s.price_min
      ? (s.price_max ? `min ₼${s.price_min} — max ₼${s.price_max}` : `min ₼${s.price_min}`)
      : t("askPrice"),
    rating: s.rating || 0,
    reviewCount: s.review_count || 0,
    image: firstImage(s.images),
    vendor: "",
    featured: false,
    description: s.description || "",
    images: s.images || [],
  });

  const currentSort = SORT_OPTIONS.find(o => o.value === sortBy)!;

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Sticky chip bar — mobile only */}
      <div className="fixed left-0 right-0 z-40 md:hidden" style={{ top: "64px", background: "hsl(28 40% 98% / 0.95)", backdropFilter: "blur(14px)", borderBottom: "1px solid hsl(25 28% 88%)" }}>
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          <button onClick={() => handleCatChange("")} className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap" style={!selectedCat ? { background: "hsl(16 38% 42%)", color: "#fff" } : { background: "hsl(28 35% 93%)", color: "hsl(20 18% 42%)", border: "1px solid hsl(25 28% 85%)" }}>✦ Hamısı</button>
          <div className="w-px h-4 flex-shrink-0" style={{ background: "hsl(25 28% 84%)" }} />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCatChange(cat.id === selectedCat ? "" : cat.id)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
              style={selectedCat === cat.id
                ? { background: "hsl(16 38% 42%)", color: "#fff" }
                : { background: "hsl(28 35% 93%)", color: "hsl(20 18% 42%)", border: "1px solid hsl(25 28% 85%)" }}>
              {t(`cat.${cat.id}`) || cat.name}
            </button>
          ))}
        </div>
      </div>
      {/* SEO meta */}
      <div className="pt-36 md:pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 items-start">
          <div className="hidden md:block w-48 flex-shrink-0 sticky top-32 self-start">
            <p className="text-xs uppercase tracking-widest font-semibold mb-3" style={{ color: "hsl(20 15% 58%)" }}>Kateqoriyalar</p>
            <div className="space-y-0.5" style={{ overflowY: "auto", maxHeight: "80vh", scrollbarWidth: "thin" }}>
              <button onClick={() => handleCatChange("")} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left"
                style={!selectedCat ? { background: "hsl(16 38% 42%)", color: "#fff" } : { color: "hsl(20 18% 38%)" }}>✦ Hamısı</button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => handleCatChange(cat.id === selectedCat ? "" : cat.id)}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left hover:bg-black/5"
                  style={selectedCat === cat.id ? { background: "hsl(16 38% 42%)", color: "#fff" } : { color: "hsl(20 18% 38%)" }}>
                  <span className="text-base w-5 text-center">{cat.emoji}</span>
                  <span className="truncate">{t(`cat.${cat.id}`) || cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
              {selectedCat ? (t(`cat.${selectedCat}`) || categories.find(c => c.id === selectedCat)?.name || "Xidmətlər") : t("allCategories")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {loading ? t("loading") : `${filtered.length} ${t("services")} tapıldı`}
            </p>
          </div>

          {/* Toolbar: search + filter toggle + sort */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {/* Search bar */}
            <div
              className="flex items-center gap-2 flex-1 min-w-[160px] rounded-xl px-3"
              style={fieldStyle}
            >
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent py-2.5 focus:outline-none text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Filters toggle + sort row on mobile: side by side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Filtrlər</span>
                {hasActiveFilters && (
                  <span className="ml-1.5 w-2 h-2 rounded-full bg-white/80 animate-pulse" />
                )}
              </Button>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ ...fieldStyle, paddingTop: "0.625rem", paddingBottom: "0.625rem" }}
                >
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="hidden xs:inline truncate max-w-[100px]">{currentSort.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform flex-shrink-0 ${showSortMenu ? "rotate-180" : ""}`} />
                </button>
                {showSortMenu && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-52 rounded-xl overflow-hidden z-20 shadow-lg"
                    style={{ background: "hsl(28 38% 97%)", border: "1px solid hsl(25 28% 87%)" }}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-secondary/50"
                        style={sortBy === opt.value ? { color: "hsl(16 38% 48%)", fontWeight: 500 } : { color: "hsl(20 18% 30%)" }}
                      >
                        <opt.icon className="w-3.5 h-3.5" />
                        {opt.label}
                        {sortBy === opt.value && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sıfırla</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div
              className="rounded-2xl p-6 mb-8 shadow-sm"
              style={{ background: "hsl(28 36% 97%)", border: "1px solid hsl(25 26% 88%)" }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Price range */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5" />
                    {isVenue ? t("venuePriceLabel") : t("priceFilterLabel")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      className={inputCls}
                      style={fieldStyle}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      className={inputCls}
                      style={fieldStyle}
                    />
                  </div>
                </div>

                {/* Location */}
                {showLocationFilter && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Şəhər
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLocation}
                      onChange={(e) => { setSelectedLocation(e.target.value); if (e.target.value !== "Bakı") setSelectedDistrict(""); }}
                      className={`${selectCls}`}
                      style={fieldStyle}
                    >
                      <option value="">{t("allCities")}</option>
                      {cities.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                )}

                {/* Baku district */}
                {selectedLocation === "Bakı" && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Rayon
                    </label>
                    <div className="relative">
                      <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} className={selectCls} style={fieldStyle}>
                        <option value="">{t("allDistricts")}</option>
                        {bakuDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Guest count (venue only) */}
                {isVenue && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Qonaq sayı
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Min</label>
                        <input
                          type="number"
                          value={guestMin}
                          onChange={e => setGuestMin(e.target.value)}
                          className={selectCls}
                          style={fieldStyle}
                          placeholder="50"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Max</label>
                        <input
                          type="number"
                          value={guestMax}
                          onChange={e => setGuestMax(e.target.value)}
                          className={selectCls}
                          style={fieldStyle}
                          placeholder="500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Venue amenities & cuisine */}
              {isVenue && (
                <div className="mt-6 pt-5 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Mövcud xidmətlər</label>
                    <div className="grid grid-cols-2 gap-2">
                      {venueAmenities.map((a) => (
                        <label key={a} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                          <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)} className="w-4 h-4 rounded accent-primary" />
                          {a}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-3 block">Mətbəx</label>
                    <div className="grid grid-cols-2 gap-2">
                      {cuisineTypes.map((c) => (
                        <label key={c} className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                          <input type="checkbox" checked={selectedCuisines.includes(c)} onChange={() => toggleCuisine(c)} className="w-4 h-4 rounded accent-primary" />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {/* Kateqoriya-spesifik filtrlər */}
              {currentCatFilters.length > 0 && (
                <div className="mt-6 pt-5 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    🔍 {categories.find(c => c.id === selectedCat)?.name || ""} Filtrləri
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentCatFilters.map(field => (
                      <div key={field.key}>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{field.label}</label>

                        {field.type === "select" && (
                          <div className="relative">
                            <select
                              value={(catFilterValues[field.key] as string) || ""}
                              onChange={e => setCatFilter(field.key, e.target.value)}
                              className={selectCls}
                              style={fieldStyle}
                            >
                              <option value="">Hamısı</option>
                              {field.options?.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                          </div>
                        )}

                        {field.type === "multiselect" && (
                          <div className="flex flex-wrap gap-1.5">
                            {field.options?.map(opt => {
                              const arr = (catFilterValues[field.key] as string[]) || [];
                              const active = arr.includes(opt.value);
                              return (
                                <button
                                  key={opt.value}
                                  onClick={() => toggleCatMultiFilter(field.key, opt.value)}
                                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                                  style={active ? {
                                    background: "hsl(16 38% 44%)",
                                    color: "white",
                                    border: "1px solid hsl(16 38% 44%)",
                                  } : {
                                    background: "hsl(28 38% 97%)",
                                    color: "hsl(20 20% 40%)",
                                    border: "1px solid hsl(25 28% 86%)",
                                  }}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {field.type === "boolean" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCatFilter(field.key, catFilterValues[field.key] === true ? "" : true)}
                              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                              style={catFilterValues[field.key] === true ? {
                                background: "hsl(16 38% 44%)",
                                color: "white",
                                border: "1px solid hsl(16 38% 44%)",
                              } : {
                                background: "hsl(28 38% 97%)",
                                color: "hsl(20 20% 40%)",
                                border: "1px solid hsl(25 28% 86%)",
                              }}
                            >
                              ✓ Bəli
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            !selectedCat ? (
              // "Hamısı" — show per-category sliders in categories order
              (() => {
                const map = new Map<string, typeof filtered>();
                for (const s of filtered) {
                  if (!map.has(s.category)) map.set(s.category, []);
                  map.get(s.category)!.push(s);
                }
                // Sort by categories array order
                const ordered = categories
                  .filter(c => map.has(c.id))
                  .map(c => ({ catId: c.id, items: map.get(c.id)! }));
                // Append any leftover categories not in the list
                const inList = new Set(ordered.map(o => o.catId));
                for (const [catId, items] of map.entries()) {
                  if (!inList.has(catId)) ordered.push({ catId, items });
                }
                return ordered.map(({ catId, items }) => (
                  <AllCatSlider
                    key={catId}
                    catId={catId}
                    title={t(`cat.${catId}`) || catId}
                    items={items}
                    toFormat={toListingFormat}
                  />
                ));
              })()
            ) : (
              <>
                <p className="text-xs text-muted-foreground mb-4">
                  {filtered.length} {t("services")} · {currentSort.label}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map((s) => (
                    <ListingCard key={s.id} listing={toListingFormat(s)} />
                  ))}
                </div>
              </>
            )
          ) : (
            <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
          )}
          </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Close sort menu on outside click */}
      {showSortMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
      )}
    </div>
  );
};

export default Categories;