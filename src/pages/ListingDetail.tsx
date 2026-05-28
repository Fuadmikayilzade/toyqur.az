import { useSEO } from "@/hooks/useSEO";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Star, MapPin, Phone, Share2, MessageCircle, Play, ExternalLink, Calendar, CheckCircle, Store, Instagram, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import type { Tables } from "@/integrations/supabase/types";
import Footer from "@/components/Footer";
import ImageLightbox from "@/components/ImageLightbox";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { categories } from "@/data/mockData";

// Returns first media (image or video) — whatever was uploaded first
const firstImage = (images?: string[] | null): string => images?.[0] || "/placeholder.svg";


const isVideoFile = (url: string) => {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  return ["mp4", "mov", "webm", "avi"].includes(ext);
};

const parseServiceMeta = (desc: string | null) => {
  if (!desc) return { cleanDesc: "", phones: [], address: "", logoUrl: "", instagram: "", district: "", capacity: "", amenities: [] as string[], cuisines: [] as string[], whatsapp: "" };
  const sepIdx = desc.indexOf("\n---\n");
  const cleanDesc = sepIdx === -1 ? desc : desc.slice(0, sepIdx).trim();
  if (sepIdx === -1) return { cleanDesc, phones: [], address: "", logoUrl: "", instagram: "", district: "", capacity: "", amenities: [] as string[], cuisines: [] as string[], whatsapp: "" };
  const metaLines = desc.slice(sepIdx + 5).split("\n");
  const phones: string[] = [];
  let address = "", logoUrl = "", instagram = "", district = "", capacity = "";
  let amenities: string[] = [], cuisines: string[] = [];
  for (const line of metaLines) {
    if (line.startsWith("Əlaqə")) {
      const val = line.split(":").slice(1).join(":").trim();
      if (val) phones.push(val);
    } else if (line.startsWith("Ünvan:")) {
      address = line.slice(6).trim();
    } else if (line.startsWith("Logo:")) {
      logoUrl = line.slice(5).trim();
    } else if (line.startsWith("Instagram:")) {
      instagram = line.slice(10).trim();
    } else if (line.startsWith("Rayon:")) {
      district = line.slice(6).trim();
    } else if (line.startsWith("Tutum:")) {
      capacity = line.slice(6).trim();
    } else if (line.startsWith("Xidmətlər:")) {
      amenities = line.slice(10).trim().split("||").map(s => s.trim()).filter(Boolean);
    } else if (line.startsWith("Mətbəx:")) {
      cuisines = line.slice(7).trim().split("||").map(s => s.trim()).filter(Boolean);
    }
  }
  let whatsapp = "";
  for (const line of metaLines) {
    if (line.startsWith("WhatsApp:")) { whatsapp = line.slice(9).trim(); break; }
  }
  return { cleanDesc, phones, address, logoUrl, instagram, district, capacity, amenities, cuisines, whatsapp };
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}.${mm}.${yy}`;
};

const formatPrice = (min: number | null, max: number | null) => {
  if (!min) return "";
  return max
    ? `min ₼${min.toLocaleString()} — max ₼${max.toLocaleString()}`
    : `min ₼${min.toLocaleString()}`;
};

// ── Horizontal slider for related/mixed services ──
const DetailSlider = ({ title, items, accentColor = "hsl(16 38% 48%)" }: {
  title: string;
  items: Array<{ id: string; title: string; category: string; location: string | null; price_min: number | null; price_max: number | null; rating: number | null; review_count: number | null; images: string[] | null; description: string | null }>;
  accentColor?: string;
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

  if (items.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-lg font-serif font-bold text-foreground mb-5 flex items-center gap-2">
        <span className="w-1 h-5 rounded-full inline-block" style={{ background: accentColor }} />
        {title}
      </h2>
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
          className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none" }}>
          {items.map(s => (
            <div key={s.id} className="w-[260px] flex-shrink-0 snap-start">
              <ListingCard listing={{
                id: s.id, title: s.title, category: s.category,
                location: s.location || "",
                priceRange: s.price_min ? (s.price_max ? `min ₼${s.price_min} — max ₼${s.price_max}` : `min ₼${s.price_min}`) : t("askPrice"),
                rating: s.rating || 0, reviewCount: s.review_count || 0,
                image: firstImage(s.images), vendor: "", featured: false,
                description: s.description || "", images: s.images || [],
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ListingDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [service, setService] = useState<Tables<"services"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [favId, setFavId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [similarServices, setSimilarServices] = useState<Tables<"services">[]>([]);
  const [mixedServices, setMixedServices] = useState<Tables<"services">[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const [vendorWhatsapp, setVendorWhatsapp] = useState<string | null>(null);

  // SEO — uses service state (null until loaded, updates when service loads)
  useSEO({
    title: service?.title,
    description: service?.description
      ? service.description.slice(0, service.description.indexOf("\n---\n") > -1
          ? service.description.indexOf("\n---\n")
          : 155).trim().slice(0, 155)
      : undefined,
    image: firstImage(service?.images),
  });

  useEffect(() => {
    const fetchService = async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("id", id)
        .eq("is_approved", true)
        .maybeSingle();
      setService(data);
      setLoading(false);
      // Increment view count + fetch vendor WhatsApp
      if (data) {
        supabase.rpc("increment_view_count", { service_id: data.id }).then(() => {});
        // Get vendor's dedicated WA number from their profile
        if (data.user_id) {
          supabase
            .from("vendor_profiles")
            .select("brand_whatsapp, brand_phone1")
            .eq("user_id", data.user_id)
            .maybeSingle()
            .then(({ data: vp }) => {
              if (vp?.brand_whatsapp) setVendorWhatsapp(vp.brand_whatsapp);
              else if (vp?.brand_phone1) setVendorWhatsapp(vp.brand_phone1);
            });
        }
      }
    };
    if (id) fetchService();
  }, [id]);

  useEffect(() => {
    if (!service) return;
    const venueCategories = ["wedding-hall", "banquet-hall"];
    const excludeCats = [...venueCategories, service.category];

    // Similar: same category, exclude current
    supabase.from("services").select("*")
      .eq("category", service.category)
      .eq("is_approved", true)
      .neq("id", service.id)
      .then(({ data }) => setSimilarServices(data || []));

    // Mixed: other categories, exclude venues, exclude current category
    supabase.from("services").select("*")
      .eq("is_approved", true)
      .neq("id", service.id)
      .then(({ data }) => {
        const filtered = (data || []).filter(s => !excludeCats.includes(s.category));
        setMixedServices(filtered);
      });
  }, [service]);

  useEffect(() => {
    if (!user || !id) return;
    supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("service_id", id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) { setLiked(true); setFavId(data.id); }
      });
  }, [user, id]);

  const toggleFavorite = async () => {
    if (!user) { toast.info(t("login")); return; }
    if (liked && favId) {
      await supabase.from("favorites").delete().eq("id", favId);
      setLiked(false); setFavId(null);
      toast.success(t("favRemoved"));
    } else {
      const { data, error } = await supabase
        .from("favorites")
        .insert({ user_id: user.id, service_id: id! })
        .select("id")
        .single();
      if (!error && data) { setLiked(true); setFavId(data.id); toast.success(t("favAdded")); }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 container mx-auto px-4 text-center py-20">
          <p className="text-muted-foreground text-lg">{t("notFound")}</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/categories">{t("back")}</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const images: string[] = service.images || [];
  const safeIdx = images.length > 0 ? Math.min(selectedImg, images.length - 1) : 0;
  const { cleanDesc, phones, address, logoUrl, instagram, district, capacity, amenities, cuisines, whatsapp: metaWA } = parseServiceMeta(service.description);

  const isVenue = ["wedding-hall", "banquet-hall"].includes(service.category);
  const catInfo = categories.find((c) => c.id === service.category);

  // Build WhatsApp message in current language
  const waMsg = lang === "ru"
    ? `Здравствуйте! Пишу вам с сайта toyqur.az. Интересует услуга "${service.title}". Расскажите подробнее, пожалуйста.`
    : lang === "en"
    ? `Hello! I am contacting you from toyqur.az. I am interested in "${service.title}". Could you please provide more details?`
    : `Salam! Sizə toyqur.az saytından müraciət edirəm. "${service.title}" xidmətiniz ilə maraqlanıram. Ətraflı məlumat verə bilərsinizmi?`;
  const waAutoMsg = encodeURIComponent(waMsg);

  // Priority: service meta WA → vendor profile WA → description phone1 → site default
  const rawWA = metaWA || vendorWhatsapp || phones[0] || "+994104195344";
  // Normalize to international format without + (WhatsApp requires this)
  const waNumber = rawWA.replace(/[\s\-()+]/g, "").replace(/^0/, "994");
  const primaryPhone = phones[0] || rawWA;

  const handleShare = () => setShareOpen(v => !v);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = encodeURIComponent(`${service?.title ?? ""} — ToyQur.az`);
  const shareLink = encodeURIComponent(shareUrl);

  const cardStyle = {
    background: "linear-gradient(160deg, hsl(30 42% 98%) 0%, hsl(24 35% 95%) 100%)",
    border: "1px solid hsl(25 28% 87%)",
    boxShadow: "0 2px 8px hsl(25 18% 75% / 0.2)",
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/categories" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("back")}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Images */}
            <div className="lg:col-span-3">
              <div
                className="rounded-2xl overflow-hidden mb-3 aspect-[16/10] cursor-pointer"
                onClick={() => { if (images.length > 0 && !isVideoFile(images[safeIdx])) setLightboxOpen(true); }}
              >
                {images.length === 0 ? (
                  <img src="/placeholder.svg" alt={service.title} className="w-full h-full object-cover" />
                ) : isVideoFile(images[safeIdx]) ? (
                  <video
                    src={images[safeIdx]}
                    controls
                    controlsList="nodownload"
                    className="w-full h-full object-contain bg-black"
                    style={{ maxHeight: "100%" }}
                  />
                ) : (
                  <img
                    src={images[safeIdx]}
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((media, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImg(i)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === safeIdx ? "border-primary" : "border-transparent"}`}
                    >
                      {isVideoFile(media) ? (
                        <div className="w-full h-full bg-muted flex items-center justify-center relative">
                          <video src={media} className="w-full h-full object-cover" muted />
                          <Play className="absolute w-5 h-5 text-primary-foreground bg-primary/70 rounded-full p-0.5" />
                        </div>
                      ) : (
                        <img src={media} alt="" className="w-full h-full object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Map section */}
              {address && (() => {
                // Extract coordinates from Google Maps URL: @lat,lng
                const coordMatch = address.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                // Extract place name from URL
                const placeMatch = address.match(/place\/([^/@?]+)/);
                const placeName = placeMatch ? decodeURIComponent(placeMatch[1]).replace(/\+/g, " ") : "";

                // Always use original vendor link as external href if it's a URL
                const externalHref = address.startsWith("http")
                  ? address
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

                // Build Google Maps embed URL
                let embedSrc = "";
                if (coordMatch) {
                  const lat = coordMatch[1];
                  const lng = coordMatch[2];
                  const q = placeName || `${lat},${lng}`;
                  embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&ll=${lat},${lng}&z=16&output=embed`;
                } else if (placeName) {
                  embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
                } else if (address.startsWith("http")) {
                  // Try to use vendor's raw Google Maps link directly as embed
                  // Convert share links: maps.app.goo.gl can't embed, fallback to button
                  const isEmbeddable = address.includes("google.com/maps");
                  if (isEmbeddable) {
                    embedSrc = address.includes("output=embed")
                      ? address
                      : address + (address.includes("?") ? "&output=embed" : "?output=embed");
                  }
                } else {
                  // Plain text address
                  embedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
                }

                return (
                  <div className="mt-6 rounded-2xl overflow-hidden" style={cardStyle}>
                    <div className="p-4 flex items-center justify-between border-b border-border">
                      <h3 className="font-serif font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        {t("mapTitle")}
                      </h3>
                      <a
                        href={externalHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {t("mapBtn")}
                      </a>
                    </div>

                    {embedSrc ? (
                      <div style={{ height: 260 }}>
                        <iframe
                          title="location-map"
                          width="100%"
                          height="260"
                          style={{ border: 0, display: "block" }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={embedSrc}
                        />
                      </div>
                    ) : (
                      /* Fallback: goo.gl short links or unembeddable — show button */
                      <div
                        className="flex flex-col items-center justify-center gap-4 py-10"
                        style={{ background: "hsl(25 28% 94%)", height: 160 }}
                      >
                        <MapPin className="w-9 h-9 text-primary/40" />
                        <a
                          href={externalHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                          style={{ background: "hsl(16 38% 44%)" }}
                        >
                          <ExternalLink className="w-4 h-4" /> {t("mapBtn")}
                        </a>
                      </div>
                    )}

                    <div className="px-4 py-2.5 border-t border-border">
                      <p className="text-xs text-muted-foreground truncate">{address}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Description — below images and map */}
              {cleanDesc && (
                <div className="mt-6 rounded-2xl p-5" style={cardStyle}>
                  <h3 className="font-serif font-semibold text-foreground mb-3">{t("about_vendor")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{cleanDesc}</p>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                {/* Logo + header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {logoUrl && (
                      <img src={logoUrl} alt="logo" className="w-14 h-14 rounded-xl object-cover border border-border flex-shrink-0" />
                    )}
                    <div>
                      {catInfo && (
                        <span className="text-xs px-2.5 py-1 rounded-full inline-block mb-2" style={{ background: "hsl(25 30% 89%)", color: "hsl(20 20% 32%)" }}>
                          {t(`cat.${service.category}`) || catInfo.name}
                        </span>
                      )}
                      <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-1">
                        {service.title}
                      </h1>
                      {service.location && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{service.location}{district ? `, ${district}` : ""}</span>
                        </div>
                      )}
                      {/* View count */}
                      {(service.view_count ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{service.view_count} {t("views")}</span>
                        </div>
                      )}
                      <Link to={`/store/${service.vendor_id}`}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-90"
                        style={{
                          background: "linear-gradient(135deg, hsl(16 38% 48%) 0%, hsl(20 45% 42%) 100%)",
                          color: "#fff",
                          border: "1px solid hsl(16 38% 40%)",
                          boxShadow: "0 2px 8px hsl(16 38% 48% / 0.3)",
                        }}>
                        <Store className="w-3.5 h-3.5" />
                        {t("store")}
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 relative">
                    <button onClick={toggleFavorite} className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary/30 transition-colors">
                      <Heart className={`w-4 h-4 ${liked ? "text-primary fill-primary" : "text-foreground/50"}`} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={handleShare}
                        className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-primary/30 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-foreground/50" />
                      </button>

                      {shareOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShareOpen(false)} />
                          <div
                            className="absolute right-0 top-12 z-50 rounded-2xl p-4"
                            style={{
                              background: "linear-gradient(145deg, hsl(30 42% 99%) 0%, hsl(24 35% 96%) 100%)",
                              border: "1px solid hsl(25 28% 85%)",
                              boxShadow: "0 8px 32px hsl(20 20% 60% / 0.18), 0 2px 8px hsl(20 20% 60% / 0.10)",
                              minWidth: 200,
                            }}
                          >
                            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3 text-center" style={{ letterSpacing: "0.12em" }}>
                              {t("share")}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                              {/* WhatsApp */}
                              <a
                                href={`https://wa.me/?text=${shareText}%20${shareLink}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShareOpen(false)}
                                title="WhatsApp"
                                className="group flex flex-col items-center gap-1.5"
                              >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md"
                                  style={{ background: "linear-gradient(145deg, #25d366, #128c7e)" }}>
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.555 4.122 1.526 5.856L.057 23.215a.75.75 0 00.921.921l5.37-1.47A11.932 11.932 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.716 9.716 0 01-4.964-1.364l-.356-.214-3.686 1.008 1.007-3.676-.232-.368A9.718 9.718 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                                  </svg>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">WhatsApp</span>
                              </a>

                              {/* Telegram */}
                              <a
                                href={`https://t.me/share/url?url=${shareLink}&text=${shareText}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setShareOpen(false)}
                                title="Telegram"
                                className="group flex flex-col items-center gap-1.5"
                              >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md"
                                  style={{ background: "linear-gradient(145deg, #29b6f6, #0277bd)" }}>
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                  </svg>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">Telegram</span>
                              </a>

                              {/* Instagram — copy link */}
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(shareUrl);
                                    toast.success(t("igCopy"));
                                  } catch { toast.error(t("error")); }
                                  setShareOpen(false);
                                }}
                                title="Instagram"
                                className="group flex flex-col items-center gap-1.5"
                              >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md"
                                  style={{ background: "linear-gradient(145deg, #f9ce34, #ee2a7b, #6228d7)" }}>
                                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                  </svg>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">Instagram</span>
                              </button>

                              {/* Copy link */}
                              <button
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(shareUrl);
                                    toast.success(t("copied"));
                                  } catch { toast.error(t("error")); }
                                  setShareOpen(false);
                                }}
                                title="Linki Kopyala"
                                className="group flex flex-col items-center gap-1.5"
                              >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 group-hover:shadow-md"
                                  style={{ background: "linear-gradient(145deg, hsl(25 35% 55%), hsl(20 30% 38%))" }}>
                                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                                  </svg>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium">{t("copy")}</span>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating — deaktiv edilib */}

                {/* Price */}
                <div className="p-5 rounded-xl mb-5" style={cardStyle}>
                  <p className="text-xs text-muted-foreground mb-1">{isVenue ? t("venuePrice") : t("price")}</p>
                  <p className="text-xl font-serif font-bold text-foreground">
                    {formatPrice(service.price_min, service.price_max) || t("askPrice")}
                  </p>
                </div>

                {/* Dates - created & approved */}
                <div className="p-4 rounded-xl mb-5 space-y-2" style={{ background: "hsl(28 35% 95%)", border: "1px solid hsl(25 26% 87%)" }}>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{t("postedAt")}: <span className="text-foreground">{formatDate(service.created_at)}</span></span>
                  </div>
                  {service.approved_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t("approvedAt")}: <span className="text-foreground">{formatDate(service.approved_at)}</span></span>
                    </div>
                  )}
                </div>

                {/* Venue details — capacity, district, amenities, cuisines */}
                {isVenue && (district || capacity || amenities.length > 0 || cuisines.length > 0) && (
                  <div className="mb-5 rounded-xl p-4 space-y-3" style={{ background: "hsl(28 35% 95%)", border: "1px solid hsl(25 26% 87%)" }}>
                    <h3 className="font-serif font-semibold text-foreground text-sm">{t("venueInfo")}</h3>

                    {district && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{t("district")}:</span>
                        <span className="text-foreground font-medium">{district}</span>
                      </div>
                    )}

                    {capacity && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg leading-none">👥</span>
                        <span className="text-muted-foreground">{t("capacity")}:</span>
                        <span className="text-foreground font-medium">
                          {capacity === "50" ? t("cap50") : capacity === "100" ? t("cap100") : capacity === "200" ? t("cap200") : capacity === "300" ? t("cap300") : capacity === "500" ? t("cap500") : capacity === "1000" ? t("cap1000") : capacity}
                        </span>
                      </div>
                    )}

                    {amenities.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{`✅ ${t("amenities")}:`}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {amenities.map((a) => (
                            <span key={a} className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ background: "hsl(142 35% 90%)", color: "hsl(142 40% 28%)" }}>
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {cuisines.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">{`🍽️ ${t("cuisine")}:`}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cuisines.map((c) => (
                            <span key={c} className="text-xs px-2.5 py-1 rounded-full font-medium"
                              style={{ background: "hsl(25 35% 88%)", color: "hsl(20 30% 30%)" }}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Contact CTAs */}
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="rounded-xl w-full text-white"
                    style={{ background: "hsl(142 60% 42%)" }}
                    asChild
                  >
                    <a href={`https://wa.me/${waNumber}?text=${waAutoMsg}`} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      {t("contactBtn")}
                    </a>
                  </Button>
                  {phones.map((phone, i) => (
                    <Button key={i} size="lg" variant="outline" className="rounded-xl w-full" asChild>
                      <a href={`tel:${phone.replace(/\s/g, "")}`}>
                        <Phone className="w-5 h-5 mr-2" />{phone}
                      </a>
                    </Button>
                  ))}
                  {phones.length === 0 && (
                    <Button size="lg" variant="outline" className="rounded-xl w-full" asChild>
                      <a href="tel:+994104195344">
                        <Phone className="w-5 h-5 mr-2" />+994 10 419 53 44
                      </a>
                    </Button>
                  )}
                  {instagram && (
                    <Button size="lg" variant="outline" className="rounded-xl w-full" asChild>
                      <a
                        href={instagram.startsWith("http") ? instagram : `https://instagram.com/${instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Instagram className="w-5 h-5 mr-2" />
                        {instagram.startsWith("@") ? instagram : `@${instagram.replace(/.*instagram\.com\//, "").replace(/\/$/, "")}`}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={safeIdx}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Similar products — slider */}
      {similarServices.length > 0 && (
        <div className="pb-6" style={{ background: "hsl(28 38% 98%)" }}>
          <div className="container mx-auto px-4">
            <DetailSlider
              title={`${t(`cat.${service?.category}`) || categories.find(c => c.id === service?.category)?.name} — ${t("similarProducts")}`}
              items={similarServices}
              accentColor="hsl(16 38% 48%)"
            />
          </div>
        </div>
      )}

      {/* Mixed products — grouped by category, each as slider */}
      {mixedServices.length > 0 && (() => {
        const map = new Map<string, typeof mixedServices>();
        for (const s of mixedServices) {
          if (!map.has(s.category)) map.set(s.category, []);
          map.get(s.category)!.push(s);
        }
        const ordered = categories
          .filter(c => map.has(c.id))
          .map(c => ({ catId: c.id, items: map.get(c.id)! }));
        const inList = new Set(ordered.map(o => o.catId));
        for (const [catId, items] of map.entries()) {
          if (!inList.has(catId)) ordered.push({ catId, items });
        }
        return (
          <div className="pb-16" style={{ background: "hsl(28 38% 98%)" }}>
            <div className="container mx-auto px-4">
              {ordered.map(({ catId, items }) => (
                <DetailSlider
                  key={catId}
                  title={t(`cat.${catId}`) || catId}
                  items={items}
                  accentColor="hsl(25 35% 65%)"
                />
              ))}
            </div>
          </div>
        );
      })()}

      <Footer />
    </div>
  );
};

export default ListingDetail;