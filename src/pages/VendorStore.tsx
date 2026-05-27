import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { MapPin, Phone, MessageCircle, Star, Instagram, ArrowLeft, Store } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";
import { categories } from "@/data/mockData";

// Returns first media (image or video) — whatever was uploaded first
const firstImage = (images?: string[] | null): string => images?.[0] || "/placeholder.svg";


interface VendorProfile {
  vendor_id: string;
  brand_name: string | null;
  brand_logo: string | null;
  brand_description: string | null;
  brand_phone1: string | null;
  brand_phone2: string | null;
  brand_address: string | null;
  brand_instagram: string | null;
  brand_whatsapp: string | null;
}

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

const VendorStore = () => {
  const { t } = useLanguage();
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendorProfile, setVendorProfile] = useState<VendorProfile | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: vendorProfile?.brand_name ? `${vendorProfile.brand_name} — ${t("vendorStoreSuffix")}` : t("vendorStoreSuffix"),
    description: vendorProfile?.brand_description || undefined,
    image: vendorProfile?.brand_logo || undefined,
  });

  useEffect(() => {
    if (!vendorId) return;
    const load = async () => {
      const [{ data: vp }, { data: svcs }] = await Promise.all([
        supabase.from("vendor_profiles").select("*").eq("vendor_id", vendorId).maybeSingle(),
        supabase.from("services").select("id,title,category,location,price_min,price_max,rating,review_count,images,description")
          .eq("vendor_id", vendorId).eq("is_approved", true).order("created_at", { ascending: false }),
      ]);
      setVendorProfile(vp as VendorProfile | null);
      setServices((svcs as ServiceItem[]) || []);
      setLoading(false);
    };
    load();
  }, [vendorId]);

  const toListingFormat = (s: ServiceItem) => ({
    id: s.id, title: s.title, category: s.category,
    location: s.location || "",
    priceRange: s.price_min ? (s.price_max ? `min ₼${s.price_min} — max ₼${s.price_max}` : `min ₼${s.price_min}`) : "Qiymət soruşun",
    rating: s.rating || 0, reviewCount: s.review_count || 0,
    image: firstImage(s.images),
    vendor: "", featured: false,
    description: s.description || "", images: s.images || [],
  });

  const cardStyle = {
    background: "linear-gradient(160deg, hsl(30 42% 98%) 0%, hsl(24 35% 95%) 100%)",
    border: "1px solid hsl(25 28% 87%)",
  };

  const brandName = vendorProfile?.brand_name || t("defaultStoreName");
  const waNumber  = (vendorProfile?.brand_whatsapp || vendorProfile?.brand_phone1 || "")
    .replace(/[\s\-()+]/g, "").replace(/^\+/, "");
  const waMsg = encodeURIComponent(`Salam, ToyQur.az-dan "${brandName}" mağazasına müraciət edirəm.`);

  const groupedByCategory = services.reduce<Record<string, ServiceItem[]>>((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "hsl(28 38% 98%)" }}>
      <Navbar />
      <div className="pt-20 pb-16">
        {/* Cover banner */}
        <div className="h-36 md:h-48 w-full relative"
          style={{ background: "linear-gradient(135deg, hsl(16 38% 44%) 0%, hsl(25 40% 60%) 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container mx-auto px-4">
          {/* Brand header card */}
          <div className="rounded-2xl p-5 md:p-6 -mt-10 relative z-10 mb-8" style={cardStyle}>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Logo */}
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-background flex-shrink-0"
                style={{ background: "hsl(25 30% 88%)" }}>
                {vendorProfile?.brand_logo
                  ? <img src={vendorProfile.brand_logo} alt={brandName} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-9 h-9" style={{ color: "hsl(20 22% 50%)" }} />
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-0.5">{brandName}</h1>
                {vendorProfile?.brand_address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5" /> {vendorProfile.brand_address}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mb-3">
                  {services.length} {t("productsCount")} · {Object.keys(groupedByCategory).length} {t("catCount")}
                </p>
                {vendorProfile?.brand_description && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{vendorProfile.brand_description}</p>
                )}
              </div>

              {/* Contact buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                {waNumber && (
                  <a href={`https://wa.me/${waNumber}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: "hsl(142 60% 42%)" }}>
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {vendorProfile?.brand_phone1 && (
                  <a href={`tel:${vendorProfile.brand_phone1.replace(/\s/g, "")}`}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                    style={{ borderColor: "hsl(25 28% 84%)", color: "hsl(20 20% 25%)", background: "hsl(28 38% 97%)" }}>
                    <Phone className="w-4 h-4" /> {vendorProfile.brand_phone1}
                  </a>
                )}
                {vendorProfile?.brand_instagram && (
                  <a href={`https://instagram.com/${vendorProfile.brand_instagram.replace("@","")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border"
                    style={{ borderColor: "hsl(25 28% 84%)", color: "hsl(20 20% 25%)", background: "hsl(28 38% 97%)" }}>
                    <Instagram className="w-4 h-4" /> {vendorProfile.brand_instagram}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Products grouped by category */}
          {services.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t("notFound")}</p>
            </div>
          ) : (
            Object.entries(groupedByCategory).map(([catId, items]) => {
              const catName = t(`cat.${catId}`) || categories.find(c => c.id === catId)?.name || catId;
              return (
                <div key={catId} className="mb-12">
                  <h2 className="text-lg font-serif font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full inline-block" style={{ background: "hsl(16 38% 48%)" }} />
                    {catName}
                    <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map(s => <ListingCard key={s.id} listing={toListingFormat(s)} />)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VendorStore;