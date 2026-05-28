import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowLeft, Trash2, Star, MapPin, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/contexts/LanguageContext";

interface FavService {
  id: string;
  title: string;
  category: string;
  location: string | null;
  price_min: number | null;
  price_max: number | null;
  images: string[] | null;
  rating: number | null;
  review_count: number | null;
}

interface FavRow {
  id: string;
  service_id: string;
  services: FavService;
}

// Skeleton card
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
      <div className="h-3 rounded-lg w-1/3" style={{ background: "hsl(25 26% 92%)" }} />
    </div>
  </div>
);

const cardStyle = {
  background: "linear-gradient(160deg, hsl(28 38% 97%) 0%, hsl(22 32% 94%) 100%)",
  border: "1px solid hsl(25 28% 88%)",
  boxShadow: "0 1px 4px hsl(25 18% 78% / 0.28)",
};

const isVideoUrl = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);


const Favorites = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  useSEO({ title: t("favorites") });
  const [favorites, setFavorites] = useState<FavRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("favorites")
      .select("id, service_id, services(id, title, category, location, price_min, price_max, images, rating, review_count)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFavorites((data as FavRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchFavorites(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeFavorite = async (favId: string) => {
    await supabase.from("favorites").delete().eq("id", favId);
    setFavorites((prev) => prev.filter((f) => f.id !== favId));
  };

  if (!user) {
    return (
      <div className="min-h-screen" style={{ background: "hsl(28 38% 98%)" }}>
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "hsl(25 30% 90%)" }}
          >
            <Heart className="w-9 h-9" style={{ color: "hsl(16 38% 55%)" }} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-2">{t("favoritesTitle")}</h2>
          <p className="text-muted-foreground mb-6">{t("favoritesLoginMsg")}</p>
          <Button asChild className="rounded-xl">
            <Link to="/auth?mode=login">{t("login")}</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "hsl(28 38% 98%)" }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> {t("back")}
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <h1 className="text-3xl font-serif font-bold text-foreground">
              {t("favoritesTitle")}
              {!loading && favorites.length > 0 && (
                <span className="text-lg font-normal text-muted-foreground ml-2">({favorites.length})</span>
              )}
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : favorites.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: "hsl(25 30% 90%)" }}
              >
                <Heart className="w-9 h-9" style={{ color: "hsl(16 38% 55%)" }} />
              </div>
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
                {t("favoritesEmpty")}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                {t("favoritesEmptySub")}
              </p>
              <Button asChild className="rounded-xl">
                <Link to="/categories">
                  <Search className="w-4 h-4 mr-2" />
                  {t("browseSvcs")}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => {
                const svc = fav.services;
                if (!svc) return null;
                const priceText = svc.price_min
                  ? (svc.price_max ? `min ₼${svc.price_min} — max ₼${svc.price_max}` : `min ₼${svc.price_min}`)
                  : t("askPrice");
                return (
                  <div key={fav.id} className="rounded-2xl overflow-hidden group" style={cardStyle}>
                    <Link to={`/listing/${svc.id}`}>
                      <div className="aspect-[4/3] overflow-hidden relative">
                        {/* Blur-up skeleton */}
                        <div
                          className="absolute inset-0 animate-pulse"
                          style={{ background: "hsl(25 26% 90%)", zIndex: 0 }}
                        />
                        {svc.images?.[0] && isVideoUrl(svc.images[0]) ? (
                          <video
                            src={svc.images[0]}
                            className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            muted
                            playsInline
                            preload="metadata"
                            onLoadedMetadata={(e) => {
                              const v = e.currentTarget;
                              if (v.duration > 0) v.currentTime = Math.min(0.5, v.duration * 0.05);
                              const prev = v.previousElementSibling as HTMLElement;
                              if (prev) prev.style.display = "none";
                            }}
                          />
                        ) : (
                          <img
                            src={svc.images?.[0] || "/placeholder.svg"}
                            alt={svc.title}
                            className="relative z-10 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onLoad={(e) => {
                              const prev = (e.target as HTMLImageElement).previousElementSibling as HTMLElement;
                              if (prev) prev.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-serif font-semibold text-foreground mb-1 group-hover:text-primary transition-colors leading-snug">
                          {svc.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{svc.location || "—"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-foreground">{priceText}</p>
                          {svc.rating && svc.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                              <span className="text-xs text-muted-foreground">{svc.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => removeFavorite(fav.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t("removeFromFav")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Favorites;