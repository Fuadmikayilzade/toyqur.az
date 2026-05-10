import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Image as ImageIcon, Calendar, CheckCircle, Clock, Store, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import ServiceForm from "./ServiceForm";
import BrandSettings from "./BrandSettings";
import type { Tables } from "@/integrations/supabase/types";
import { categories } from "@/data/mockData";

type Service = Tables<"services">;

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

const VendorServices = ({ profileComplete = true }: { profileComplete?: boolean }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [storeReady, setStoreReady] = useState<boolean | null>(null); // null = loading
  const [showBrandSetup, setShowBrandSetup] = useState(false);

  const fetchServices = async () => {
    if (!user) return;
    const [{ data: svcData, error }, { data: profile }] = await Promise.all([
      supabase.from("services").select("*").eq("vendor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("vendor_profiles").select("brand_name,brand_logo,brand_phone1,brand_whatsapp").eq("vendor_id", user.id).maybeSingle(),
    ]);
    if (error) { toast.error(t("svcLoadErr")); }
    else { setServices(svcData || []); }
    // Store is "ready" if brand_name, brand_logo and at least one phone filled
    const ready = !!(profile?.brand_name && profile?.brand_logo && (profile?.brand_phone1 || profile?.brand_whatsapp));
    setStoreReady(ready);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(t("error")); }
    else { toast.success(t("svcDeleted")); setServices((prev) => prev.filter((s) => s.id !== id)); }
  };

  if (loading || storeReady === null) return <div className="text-center py-10 text-muted-foreground">{t("loading")}</div>;

  // Show brand setup inline if store not ready
  if (showBrandSetup) {
    return (
      <div>
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: "hsl(142 50% 95%)", border: "1px solid hsl(142 40% 80%)" }}>
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-800">{t("completeProfile")}</p>
            <p className="text-xs text-green-700 mt-0.5">{t("completeProfileMsg")}</p>
          </div>
        </div>
        <BrandSettings onSaved={() => { setShowBrandSetup(false); fetchServices(); }} />
      </div>
    );
  }

  // Prompt to set up store before adding first product
  if (!storeReady && services.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(160deg, hsl(30 42% 98%) 0%, hsl(24 35% 95%) 100%)", border: "1px solid hsl(25 28% 87%)" }}>
        <Store className="w-14 h-14 mx-auto mb-4" style={{ color: "hsl(16 38% 50%)" }} />
        <h3 className="text-lg font-serif font-semibold text-foreground mb-2">{t("setupStore")}</h3>
        <p className="text-sm text-muted-foreground mb-1 max-w-sm mx-auto">
          {t("setupStoreMsg")}
        </p>
        <p className="text-xs text-muted-foreground mb-6"></p>
        <Button className="rounded-xl" onClick={() => {
          if (!profileComplete) { toast.error(t("profileFillRequired")); return; }
          setShowBrandSetup(true);
        }}>
          <Store className="w-4 h-4 mr-2" />
          {t("setupStoreBtn")}
        </Button>
      </div>
    );
  }

  if (showForm || editingService) {
    return (
      <ServiceForm
        service={editingService}
        onClose={() => { setShowForm(false); setEditingService(null); }}
        onSaved={() => { setShowForm(false); setEditingService(null); fetchServices(); }}
      />
    );
  }

  const cardStyle = {
    background: "linear-gradient(160deg, hsl(30 42% 98%) 0%, hsl(24 35% 95%) 100%)",
    border: "1px solid hsl(25 28% 87%)",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-serif font-semibold text-foreground">
          {t("svcCount")} ({services.length})
        </h2>
        <Button onClick={() => { if (!profileComplete) { toast.error(t("profileFillRequired")); return; } if (!storeReady) { setShowBrandSetup(true); } else { setShowForm(true); } }} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          {t("newService")}
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={cardStyle}>
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">{t("noServicesYet")}</p>
          <Button onClick={() => { if (!profileComplete) { toast.error(t("profileFillRequired")); return; } if (!storeReady) { setShowBrandSetup(true); } else { setShowForm(true); } }} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />{t("addFirstService")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => {
            const catName = t(`cat.${service.category}`) || categories.find(c => c.id === service.category)?.name || service.category;
            return (
              <div key={service.id} className="rounded-2xl overflow-hidden" style={cardStyle}>
                <div className="aspect-[16/10] relative" style={{ background: "hsl(25 28% 91%)" }}>
                  {service.images && service.images.length > 0 ? (
                    <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-10 h-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                      service.is_approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {service.is_approved
                        ? <><CheckCircle className="w-3 h-3" /> {t("statusConfirmed")}</>
                        : <><Clock className="w-3 h-3" /> {t("statusPending")}</>
                      }
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-semibold text-foreground mb-0.5">{service.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{catName} · {service.location}</p>
                  <p className="text-sm font-medium text-foreground mb-3">
                    {formatPrice(service.price_min, service.price_max) || t("askPrice")}
                  </p>

                  {/* Dates */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{t("postedAt")}: {formatDate(service.created_at)}</span>
                    </div>
                    {service.is_approved && service.approved_at && (
                      <div className="flex items-center gap-1.5 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>{t("approvedAt")}: {formatDate(service.approved_at)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={() => setEditingService(service)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" />{t("edit")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-destructive hover:text-destructive hover:bg-red-50"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorServices;
