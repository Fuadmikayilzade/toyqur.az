import { useState, useEffect } from "react";
import { Store, Save, Upload, X, Instagram, Phone, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const BrandSettings = ({ onSaved }: { onSaved?: () => void } = {}) => {
  const { t } = useLanguage(); 
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const [form, setForm] = useState({
    brand_name: "",
    brand_description: "",
    brand_phone1: "",
    brand_phone2: "",
    brand_address: "",
    brand_instagram: "",
    brand_whatsapp: "",
    brand_logo: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("vendor_profiles").select("*").eq("vendor_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) setForm({
          brand_name: data.brand_name || "",
          brand_description: data.brand_description || "",
          brand_phone1: data.brand_phone1 || "",
          brand_phone2: data.brand_phone2 || "",
          brand_address: data.brand_address || "",
          brand_instagram: data.brand_instagram || "",
          brand_whatsapp: data.brand_whatsapp || "",
          brand_logo: data.brand_logo || "",
        });
        setLoading(false);
      });
  }, [user]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { toast.error(t("logoSizeErr")); return; }
    setLogoUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/brand-logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("service-images").upload(path, file);
    if (error) { toast.error(t("logoUploadErr")); setLogoUploading(false); return; }
    const { data } = supabase.storage.from("service-images").getPublicUrl(path);
    setForm(f => ({ ...f, brand_logo: data.publicUrl }));
    setLogoUploading(false);
    e.target.value = "";
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.brand_name.trim()) { toast.error(t("brandRequired")); return; }
    if (!form.brand_logo) { toast.error(t("logoRequired")); return; }
    if (!form.brand_phone1.trim()) { toast.error(t("phoneRequired")); return; }
    setSaving(true);
    const payload = { ...form, vendor_id: user.id, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("vendor_profiles")
      .upsert(payload, { onConflict: "vendor_id" });
    if (error) { toast.error(t("error") + ": " + error.message); }
    else { toast.success(t("brandSaved")); onSaved?.(); }
    setSaving(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const inputStyle = { background: "hsl(28 38% 97%)", border: "1px solid hsl(25 28% 86%)", color: "hsl(20 20% 18%)" };

  if (loading) return <div className="text-center py-10 text-muted-foreground">{t("loading")}</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold text-foreground mb-1">{t("storeName")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("storeDesc")}
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">{t("storeLogo")} <span className="text-destructive">*</span></label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
            style={{ background: "hsl(25 30% 88%)", border: "2px solid hsl(25 28% 84%)" }}>
            {form.brand_logo
              ? <img src={form.brand_logo} alt="logo" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-8 h-8" style={{ color: "hsl(20 22% 55%)" }} />
                </div>
            }
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors"
              style={{ background: "hsl(28 38% 97%)", border: "1px solid hsl(25 28% 84%)", color: "hsl(20 20% 25%)" }}>
              {logoUploading
                ? <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                : <><Upload className="w-4 h-4" /> {t("storeLogoUpload")}</>
              }
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
            </label>
            {form.brand_logo && (
              <button onClick={() => setForm(f => ({ ...f, brand_logo: "" }))}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" /> Sil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Brand name */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          {t("storeBrandName")} <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={form.brand_name}
            onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))}
            className={`${inputCls} pl-10`} style={inputStyle}
            placeholder="Məs: Studio Araz, Royal Decor..." />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">{t("storeAbout")}</label>
        <div className="relative">
          <FileText className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <textarea value={form.brand_description}
            onChange={e => setForm(f => ({ ...f, brand_description: e.target.value }))}
            className={`${inputCls} pl-10 min-h-[90px]`} style={inputStyle}
            placeholder="Şirkətiniz, xidmətləriniz haqqında qısa məlumat..." />
        </div>
      </div>

      {/* Phones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Telefon 1 <span className="text-destructive">*</span></label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="tel" value={form.brand_phone1}
              onChange={e => setForm(f => ({ ...f, brand_phone1: e.target.value }))}
              className={`${inputCls} pl-10`} style={inputStyle} placeholder="+994 XX XXX XX XX" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Telefon 2</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="tel" value={form.brand_phone2}
              onChange={e => setForm(f => ({ ...f, brand_phone2: e.target.value }))}
              className={`${inputCls} pl-10`} style={inputStyle} placeholder="+994 XX XXX XX XX" />
          </div>
        </div>
      </div>

      {/* WhatsApp + Instagram */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">{t("storeWA")}</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="tel" value={form.brand_whatsapp}
              onChange={e => setForm(f => ({ ...f, brand_whatsapp: e.target.value }))}
              className={`${inputCls} pl-10`} style={inputStyle} placeholder="+994 XX XXX XX XX" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Instagram</label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={form.brand_instagram}
              onChange={e => setForm(f => ({ ...f, brand_instagram: e.target.value }))}
              className={`${inputCls} pl-10`} style={inputStyle} placeholder="@hesabiniz" />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">{t("storeAddress")}</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={form.brand_address}
            onChange={e => setForm(f => ({ ...f, brand_address: e.target.value }))}
            className={`${inputCls} pl-10`} style={inputStyle}
            placeholder="Bakı, Nərimanov r., Əliağa Vahid küç. 12" />
        </div>
      </div>

      <Button onClick={handleSave} className="rounded-xl" disabled={saving}>
        <Save className="w-4 h-4 mr-2" />
        {saving ? t("saving") : t("saveProfile")}
      </Button>
    </div>
  );
};

export default BrandSettings;
