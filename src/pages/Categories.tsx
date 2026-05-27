import { useSEO } from "@/hooks/useSEO";
import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, SlidersHorizontal, X, ChevronDown, MapPin,
  Users, Banknote, ArrowUpDown, Star, Clock, TrendingUp, Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { categories } from "@/data/mockData";
import { cities, bakuDistricts, isVenueCategory, venueAmenities, cuisineTypes } from "@/data/locations";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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

  const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof Clock }[] = [
    { value: "newest", label: t("sortNewest"), icon: Clock },
    { value: "price_asc", label: t("sortPriceAsc"), icon: TrendingUp },
    { value: "price_desc", label: t("sortPriceDesc"), icon: TrendingUp },
    { value: "oldest", label: t("sortOldest"), icon: Clock },
  ];

  const [services, setServices] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);

  const isVenue = isVenueCategory(selectedCat);

  // Update URL params when category changes
  const handleCatChange = useCallback((catId: string) => {
    setSelectedCat(catId);
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
      return matchCat && matchQ && matchLocation && matchPriceMin && matchPriceMax;
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
  }, [selectedCat, query, selectedLocation, priceMin, priceMax, sortBy, services]);

  const clearFilters = () => {
    setSelectedCat("");
    setQuery("");
    setPriceMin("");
    setPriceMax("");
    setSelectedLocation("");
    setSelectedDistrict("");
    setGuestCount("");
    setSelectedAmenities([]);
    setSelectedCuisines([]);
    setSortBy("newest");
    setSearchParams({}, { replace: true });
  };

  const toggleAmenity = (a: string) =>
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  const toggleCuisine = (c: string) =>
    setSelectedCuisines((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const hasActiveFilters = !!(selectedCat || query || priceMin || priceMax || selectedLocation ||
    guestCount || selectedDistrict || selectedAmenities.length || selectedCuisines.length || sortBy !== "newest");

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
      {/* SEO meta handled via document.title below */}
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
              {selectedCat ? (t(`cat.${selectedCat}`) || categories.find(c => c.id === selectedCat)?.name || "Xidmətlər") : t("allCategories")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {loading ? t("loading") : `${filtered.length} ${t("services")} tapıldı`}
            </p>
          </div>

          {/* Category chips — wrap on desktop, scroll on mobile */}
          <div className="relative mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCatChange("")}
                className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                style={!selectedCat
                  ? { background: "hsl(16 38% 48%)", color: "#fff" }
                  : { background: "hsl(28 38% 97%)", border: "1px solid hsl(25 28% 87%)", color: "hsl(20 18% 40%)" }
                }
              >
                Hamısı
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCatChange(cat.id === selectedCat ? "" : cat.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={selectedCat === cat.id
                    ? { background: "hsl(16 38% 48%)", color: "#fff" }
                    : { background: "hsl(28 38% 97%)", border: "1px solid hsl(25 28% 87%)", color: "hsl(20 18% 40%)" }
                  }
                >
                  {t(`cat.${cat.id}`) || cat.name}
                </button>
              ))}
            </div>
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
                    <div className="relative">
                      <select value={guestCount} onChange={(e) => setGuestCount(e.target.value)} className={selectCls} style={fieldStyle}>
                        <option value="">{t("select")}</option>
                        <option value="50">{t("cap50")}</option>
                        <option value="100">50–100</option>
                        <option value="200">100–200</option>
                        <option value="300">200–300</option>
                        <option value="500">300–500</option>
                        <option value="1000">500+</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
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
          ) : (
            <EmptyState hasFilters={hasActiveFilters} onClear={clearFilters} />
          )}
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