import { Heart, Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { Listing } from "@/data/mockData";
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

// Extract logo URL from description metadata
const extractLogo = (desc: string | null): string => {
  if (!desc) return "";
  const match = desc.match(/\nLogo:\s*(https?:\/\/[^\n]+)/);
  return match ? match[1].trim() : "";
};

// Extract district from description metadata
const extractDistrict = (desc: string | null): string => {
  if (!desc) return "";
  const match = desc.match(/\nRayon:\s*([^\n]+)/);
  return match ? match[1].trim() : "";
};

// Format price: "min ₼200 — max ₼1500"
const formatPrice = (priceRange: string): string => {
  if (!priceRange) return priceRange;
  if (priceRange.startsWith("min ")) return priceRange;
  const parts = priceRange.split(" - ");
  if (parts.length === 2) return `min ${parts[0]} — max ${parts[1]}`;
  return `min ${priceRange}`;
};

// Check if URL is a video file
const isVideoUrl = (url: string) =>
  /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);

// Pick first image, fallback to first video if no images
const firstMedia = (images?: string[] | null) => {
  if (!images || images.length === 0) return { url: "/placeholder.svg", isVideo: false };
  const img = images.find(u => !isVideoUrl(u));
  if (img) return { url: img, isVideo: false };
  return { url: images[0], isVideo: true };
};


// iOS-safe video thumbnail — draws first frame via canvas
const VideoThumb = ({ src }: { src: string }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setReady(true);
      video.remove();
    };

    video.addEventListener("loadeddata", () => {
      video.currentTime = 0.1;
    });
    video.addEventListener("seeked", draw);
    video.addEventListener("error", () => setReady(true)); // show placeholder on error
    video.load();
  }, [src]);

  return (
    <div className="w-full h-full relative flex items-center justify-center"
      style={{ background: "hsl(25 28% 88%)" }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ display: ready ? "block" : "none" }}
      />
      {!ready && (
        <div className="absolute inset-0 animate-pulse"
          style={{ background: "linear-gradient(110deg, hsl(25 26% 91%) 40%, hsl(25 26% 87%) 50%, hsl(25 26% 91%) 60%)" }} />
      )}
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "hsl(20 20% 10% / 0.45)", backdropFilter: "blur(4px)" }}>
          <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
// Blurred image with fade-in on load
const LazyImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Placeholder skeleton */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: "linear-gradient(110deg, hsl(25 26% 91%) 40%, hsl(25 26% 87%) 50%, hsl(25 26% 91%) 60%)", backgroundSize: "200% 100%" }}
        />
      )}
      {!error ? (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          className={`${className} transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "hsl(25 26% 91%)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="w-10 h-10" style={{ color: "hsl(25 20% 70%)" }}>
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </div>
      )}
    </div>
  );
};

const ListingCard = ({ listing }: { listing: Listing }) => {
  const { t } = useLanguage(); 
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState("");
  const [district, setDistrict] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      if (!listing.id) return;
      const { data } = await supabase
        .from("services")
        .select("description")
        .eq("id", listing.id)
        .maybeSingle();
      if (data?.description) {
        setLogoUrl(extractLogo(data.description));
        setDistrict(extractDistrict(data.description));
      }
    };
    fetchLogo();
  }, [listing.id]);

  useEffect(() => {
    if (!user) { setLiked(false); setFavId(null); return; }
    supabase
      .from("favorites").select("id")
      .eq("user_id", user.id).eq("service_id", listing.id)
      .maybeSingle()
      .then(({ data }) => { if (data) { setLiked(true); setFavId(data.id); } });
  }, [user, listing.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { toast.info(t("favLogin")); return; }
    if (liked && favId) {
      const { error } = await supabase.from("favorites").delete().eq("id", favId);
      if (!error) { setLiked(false); setFavId(null); toast.success(t("favRemoved")); }
    } else {
      const { data, error } = await supabase.from("favorites")
        .insert({ user_id: user.id, service_id: listing.id }).select("id").single();
      if (!error && data) { setLiked(true); setFavId(data.id); toast.success(t("favAdded")); }
    }
  };

  return (
    <Link
      to={`/listing/${listing.id}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: "linear-gradient(160deg, hsl(28 38% 97%) 0%, hsl(22 32% 94%) 100%)",
        border: "1px solid hsl(25 28% 88%)",
        boxShadow: "0 1px 4px hsl(25 18% 78% / 0.28)",
      }}
    >
      {/* Image with lazy load + blur-up */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
          {listing.image && isVideoUrl(listing.image) ? (
            <VideoThumb src={listing.image} />
          ) : (
            <LazyImage
              src={listing.image}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center hover:scale-110 transition-transform z-10"
          style={{ background: "hsl(28 38% 97% / 0.85)", backdropFilter: "blur(6px)" }}
        >
          <Heart className={`w-4 h-4 ${liked ? "text-primary fill-primary" : "text-foreground/60"}`} />
        </button>

        {/* Price badge */}
        {listing.priceRange && listing.priceRange !== t("askPrice") && (
          <div className="absolute bottom-3 left-3 z-10">
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: "hsl(28 38% 97% / 0.88)", backdropFilter: "blur(6px)", color: "hsl(20 20% 20%)" }}
            >
              {formatPrice(listing.priceRange)}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Logo + title */}
        <div className="flex items-center gap-2.5 mb-1.5">
          {logoUrl && (
            <img
              src={logoUrl}
              alt="logo"
              className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-border"
              loading="lazy"
            />
          )}
          <h3
            className="font-serif font-semibold transition-colors group-hover:text-primary leading-snug"
            style={{ color: "hsl(20 20% 18%)" }}
          >
            {listing.title}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm mb-2.5" style={{ color: "hsl(20 12% 52%)" }}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{listing.location}{district ? `, ${district}` : ""}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {listing.rating > 0 ? (
              <>
                <Star className="w-4 h-4 text-gold fill-gold" />
                <span className="text-sm font-medium" style={{ color: "hsl(20 20% 18%)" }}>
                  {listing.rating}
                </span>
                <span className="text-xs" style={{ color: "hsl(20 12% 58%)" }}>
                  ({listing.reviewCount})
                </span>
              </>
            ) : (
              <span className="text-xs" style={{ color: "hsl(20 12% 58%)" }}></span>
            )}
          </div>
          {listing.vendor && (
            <span className="text-xs truncate max-w-[100px]" style={{ color: "hsl(20 12% 60%)" }}>
              {listing.vendor}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;