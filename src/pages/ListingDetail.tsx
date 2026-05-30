import { useState } from "react";
import { ArrowLeft, Upload, X, ChevronDown, Play, MapPin, ExternalLink, Instagram, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { categories } from "@/data/mockData";
import { cities, bakuDistricts, isVenueCategory, venueAmenities, cuisineTypes } from "@/data/locations";
import type { Tables } from "@/integrations/supabase/types";

type Service = Tables<"services">;

interface ServiceFormProps {
  service?: Service | null;
  onClose: () => void;
  onSaved: () => void;
}

// Kateqoriyalar — min/max qiymət göstərilsin
const MIN_MAX_PRICE_CATEGORIES = [
  "wedding-hall", "banquet-hall",
  "photographer", "videographer", "mobilograf",
  "dj", "singer", "dance-group", "bride-assistant",
];

// Kateqoriyalar — şəhər/rayon göstərilsin
const LOCATION_CATEGORIES = [
  "wedding-hall", "banquet-hall",
  "buket", "gelinlik-buketi", "xonca",
  "car", "dress", "groom-suit", "beauty-salon",
];

// Kateqoriyalar — Google Maps ünvan göstərilsin
const ADDRESS_CATEGORIES = ["wedding-hall", "banquet-hall", "dress", "car"];

// Kateqoriyalar — menyu şəkilləri yükləmə
const VENUE_MENU_CATEGORIES = ["wedding-hall", "banquet-hall"];

const isBrideAssistant = (cat: string) => cat === "bride-assistant";
const needsMinMax = (cat: string) => MIN_MAX_PRICE_CATEGORIES.includes(cat);
const needsLocation = (cat: string) => LOCATION_CATEGORIES.includes(cat);
const needsAddress = (cat: string) => ADDRESS_CATEGORIES.includes(cat);
const needsMenu = (cat: string) => VENUE_MENU_CATEGORIES.includes(cat);

const isVideoFile = (url: string) => ["mp4", "mov", "webm", "avi"].includes(url.split(".").pop()?.toLowerCase() || "");

// ── Meta parse/build ──────────────────────────────────────────────────────────
const parseServiceMeta = (desc: string | null) => {
  const empty = { cleanDesc: "", phone1: "", phone2: "", whatsapp: "", address: "", logoUrl: "", instagram: "", district: "", capacity: "", amenities: [] as string[], cuisines: [] as string[], menuImages: [] as string[] };
  if (!desc) return empty;
  const sepIdx = desc.indexOf("\n---\n");
  const cleanDesc = sepIdx === -1 ? desc : desc.slice(0, sepIdx).trim();
  if (sepIdx === -1) return { ...empty, cleanDesc };
  const metaLines = desc.slice(sepIdx + 5).split("\n");
  const get = (prefix: string) => {
    const line = metaLines.find((l) => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : "";
  };
  const amenities = get("Xidmətlər:") ? get("Xidmətlər:").split("||").map(s => s.trim()).filter(Boolean) : [];
  const cuisines   = get("Mətbəx:")   ? get("Mətbəx:").split("||").map(s => s.trim()).filter(Boolean)   : [];
  return {
    cleanDesc,
    phone1: get("Əlaqə 1:"),
    phone2: get("Əlaqə 2:"),
    address: get("Ünvan:"),
    logoUrl: get("Logo:"),
    instagram: get("Instagram:"),
    whatsapp: get("WhatsApp:"),
    district: get("Rayon:"),
    capacity: get("Tutum:"),
    capacityMax: get("TutumMax:"),
    amenities,
    cuisines,
    menuImages: get("MenuImages:") ? get("MenuImages:").split("||").map(s => s.trim()).filter(Boolean) : [],
  };
};

// ── ServiceForm ───────────────────────────────────────────────────────────────
const ServiceForm = ({ service, onClose, onSaved }: ServiceFormProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [menuUploading, setMenuUploading] = useState(false);

  const parsed = parseServiceMeta(service?.description ?? null);

  const [form, setForm] = useState({
    title: service?.title || "",
    description: parsed.cleanDesc,
    category: service?.category || "",
    price_min: service?.price_min?.toString() || "",
    price_max: service?.price_max?.toString() || "",
    location: service?.location || "",
  });
  const [images, setImages] = useState<string[]>(service?.images || []);

  // Contact & meta fields
  const [phone1, setPhone1]   = useState(parsed.phone1);
  const [phone2, setPhone2]   = useState(parsed.phone2);
  const [address, setAddress] = useState(parsed.address);
  const [logoUrl, setLogoUrl] = useState(parsed.logoUrl);
  const [instagram, setInstagram] = useState(parsed.instagram);
  const [whatsapp, setWhatsapp] = useState(parsed.whatsapp || parsed.phone1);
  const [district, setDistrict] = useState(parsed.district);
  const [capacity, setCapacity] = useState(parsed.capacity);
  const [capacityMax, setCapacityMax] = useState(parsed.capacityMax ?? "");
  const [menuImages, setMenuImages] = useState<string[]>(parsed.menuImages);

  // Venue checkboxes — restored from saved data
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(parsed.amenities);
  const [selectedCuisines,  setSelectedCuisines]  = useState<string[]>(parsed.cuisines);

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  const toggleCuisine = (c: string) =>
    setSelectedCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  // Bride Assistant fields
  const [baFullName, setBaFullName] = useState("");
  const [baAge, setBaAge]           = useState("");
  const [baReelsSkill, setBaReelsSkill]     = useState(false);
  const [baMobileContent, setBaMobileContent] = useState(false);

  const isVenue   = isVenueCategory(form.category);
  const isBa      = isBrideAssistant(form.category);
  const showMinMax = needsMinMax(form.category);
  const showLocation = needsLocation(form.category);
  const showAddress = needsAddress(form.category);
  const showMenu = needsMenu(form.category);

  // ── Upload helpers ──────────────────────────────────────────────────────────
  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setUploading(true);
    const newMedia: string[] = [];
    for (const file of Array.from(e.target.files)) {
      if (file.size > 500 * 1024 * 1024) { toast.error(`${file.name} çox böyükdür (maks 500MB)`); continue; }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) { toast.error(`${file.name} dəstəklənmir.`); continue; }
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("service-images").upload(path, file);
      if (error) { toast.error(`${file.name} yüklənmədi: ${error.message}`); continue; }
      const { data } = supabase.storage.from("service-images").getPublicUrl(path);
      newMedia.push(data.publicUrl);
    }
    setImages(prev => [...prev, ...newMedia]);
    setUploading(false);
    e.target.value = "";
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !user) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { toast.error("Logo 5MB-dan böyük ola bilməz"); return; }
    setLogoUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("service-images").upload(path, file);
    if (error) { toast.error("Logo yüklənmədi"); setLogoUploading(false); return; }
    const { data } = supabase.storage.from("service-images").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setLogoUploading(false);
    e.target.value = "";
  };

  const handleMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setMenuUploading(true);
    const newImgs: string[] = [];
    for (const file of Array.from(e.target.files)) {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name} şəkil deyil`); continue; }
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} 10MB-dan böyükdür`); continue; }
      const ext = file.name.split(".").pop();
      const path = `${user.id}/menu-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("service-images").upload(path, file);
      if (error) { toast.error(`${file.name} yüklənmədi`); continue; }
      const { data } = supabase.storage.from("service-images").getPublicUrl(path);
      newImgs.push(data.publicUrl);
    }
    setMenuImages(prev => [...prev, ...newImgs]);
    setMenuUploading(false);
    if (newImgs.length > 0) toast.success("Menyu şəkli yükləndi!");
    e.target.value = "";
  };

  const removeMenuImage = (i: number) => setMenuImages(prev => prev.filter((_, idx) => idx !== i));

  const removeMedia = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // Edit limit check
    if (service && (service.edit_count ?? 0) >= 2) { toast.error(t("editLimitReached")); return; }
    if (!form.title || !form.category) { toast.error(t("fieldRequired")); return; }
    if (!form.price_min) { toast.error(t("priceRequired")); return; }
    if (!phone1) { toast.error(t("phoneRequired2")); return; }
    if (!whatsapp) { toast.error(t("whatsappRequired")); return; }
    if (!logoUrl) { toast.error(t("logoRequired2")); return; }
    if (isBa && (!baFullName || !baAge)) { toast.error(t("baRequired")); return; }
    if (isBa && !baReelsSkill && !baMobileContent) { toast.error(t("baSkillRequired")); return; }

    setLoading(true);

    let description = form.description.trim();
    if (isBa) {
      description = `Ad Soyad: ${baFullName}\nYaş: ${baAge}\nReels düzəltmə: ${baReelsSkill ? "Bəli" : "Xeyr"}\nMobil kontent: ${baMobileContent ? "Bəli" : "Xeyr"}\n\n${description}`;
    }

    // Build meta block — amenities/cuisines saved with || separator
    const meta: string[] = [`\n---\nƏlaqə 1: ${phone1}`];
    if (phone2)     meta.push(`Əlaqə 2: ${phone2}`);
    meta.push(`WhatsApp: ${whatsapp}`);
    if (address)    meta.push(`Ünvan: ${address}`);
    if (logoUrl)    meta.push(`Logo: ${logoUrl}`);
    if (instagram)  meta.push(`Instagram: ${instagram}`);
    if (district)   meta.push(`Rayon: ${district}`);
    if (capacity)   meta.push(`Tutum: ${capacity}`);
    if (capacityMax) meta.push(`TutumMax: ${capacityMax}`);
    if (selectedAmenities.length) meta.push(`Xidmətlər: ${selectedAmenities.join(" || ")}`);
    if (selectedCuisines.length)  meta.push(`Mətbəx: ${selectedCuisines.join(" || ")}`);
    if (menuImages.length) meta.push(`MenuImages: ${menuImages.join(" || ")}`);
    description += meta.join("\n");

    const payload = {
      title: form.title.trim(),
      description,
      category: form.category,
      price_min: form.price_min ? Number(form.price_min) : null,
      price_max: showMinMax && form.price_max ? Number(form.price_max) : null,
      location: showLocation ? form.location : null,
      images,
      vendor_id: user.id,
      is_approved: false,
    };

    try {
      if (service) {
        const { error } = await supabase.from("services").update({ ...payload, edit_count: (service.edit_count ?? 0) + 1 }).eq("id", service.id);
        if (error) throw error;
        toast.success(t("svcUpdated"));
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
        toast.success(t("svcAdded"));
      }
      onSaved();
    } catch (err: unknown) {
      toast.error((err as Error).message || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputCls = "w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const inputStyle = { background: "hsl(28 38% 97%)", border: "1px solid hsl(25 28% 86%)", color: "hsl(20 20% 18%)" };
  const sectionStyle = { background: "hsl(28 35% 95%)", border: "1px solid hsl(25 26% 87%)" };

  // Map preview from Google Maps link
  const coordMatch = address.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  const placeMatch = address.match(/place\/([^/@?]+)/);
  const placeName = placeMatch ? decodeURIComponent(placeMatch[1]).replace(/\+/g, " ") : "";

  let mapSrc = "";
  if (coordMatch) {
    const lat = coordMatch[1]; const lng = coordMatch[2];
    const q = placeName || `${lat},${lng}`;
    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&ll=${lat},${lng}&z=16&output=embed`;
  } else if (placeName) {
    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
  } else if (address.startsWith("http") && address.includes("google.com/maps")) {
    mapSrc = address.includes("output=embed") ? address : address + (address.includes("?") ? "&output=embed" : "?output=embed");
  } else if (address && !address.startsWith("http")) {
    mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }

  const mapsExternalHref = address.startsWith("http")
    ? address
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div>
      <button onClick={onClose} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Geri
      </button>
      <h2 className="text-xl font-serif font-semibold text-foreground mb-6">
        {service ? t("editService") : t("addService")}
      </h2>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5">

        {/* ── Logo ── */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Logo / Profil şəkli <span className="text-destructive">*</span>
            <span className="text-xs text-muted-foreground font-normal ml-1">(Mütləq)</span>
          </label>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/30">
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setLogoUrl("")}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-foreground/70 text-background rounded-full flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{ borderColor: "hsl(15 30% 55%)", background: "hsl(28 38% 97%)" }}>
                {logoUploading
                  ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <><Upload className="w-5 h-5 text-primary mb-1" /><span className="text-xs text-primary font-medium">Logo</span></>
                }
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={logoUploading} />
              </label>
            )}
            <p className="text-sm text-muted-foreground">Şirkət loqonuzu yükləyin.<br /><span className="text-xs">Maks 5MB · JPG, PNG, WebP</span></p>
          </div>
        </div>

        {/* ── Title ── */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Xidmət adı *</label>
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
            className={inputCls} style={inputStyle} placeholder="Məs: Studio Araz Photography" required />
        </div>

        {/* ── Category ── */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Kateqoriya *</label>
          <div className="relative">
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
              className={`${inputCls} appearance-none`} style={inputStyle} required>
              <option value="">{t("select")}</option>
              <optgroup label={t("cat.group.venues")}>
                {categories.filter(c => c.group === "Məkanlar").map(cat => (
                  <option key={cat.id} value={cat.id}>{t(`cat.${cat.id}`) || cat.name}</option>
                ))}
              </optgroup>
              <optgroup label={t("cat.group.other")}>
                {categories.filter(c => !c.group).map(cat => (
                  <option key={cat.id} value={cat.id}>{t(`cat.${cat.id}`) || cat.name}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* ── Bride Assistant ── */}
        {isBa && (
          <div className="rounded-xl p-5 space-y-4" style={sectionStyle}>
            <h3 className="text-sm font-semibold text-foreground">👗 Bride Assistant Məlumatları</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Ad Soyad *</label>
                <input type="text" value={baFullName} onChange={e => setBaFullName(e.target.value)} className={inputCls} style={inputStyle} placeholder="Ad Soyad" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Yaş *</label>
                <input type="number" value={baAge} onChange={e => setBaAge(e.target.value)} className={inputCls} style={inputStyle} placeholder="25" min="18" max="60" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground block">Bacarıqlar *</label>
              <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={baReelsSkill} onChange={e => setBaReelsSkill(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                Reels videoları düzəltmə / edit etmə
              </label>
              <label className="flex items-center gap-3 text-sm text-foreground cursor-pointer">
                <input type="checkbox" checked={baMobileContent} onChange={e => setBaMobileContent(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                Telefon vasitəsilə video və foto çəkmək
              </label>
            </div>
          </div>
        )}

        {/* ── Description ── */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Haqqında</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            className={`${inputCls} min-h-[100px]`} style={inputStyle} placeholder="Xidmətiniz haqqında məlumat verin..." />
        </div>

        {/* ── Phones ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("phoneLabel")} 1 *</label>
            <input type="tel" value={phone1} onChange={e => setPhone1(e.target.value)} className={inputCls} style={inputStyle} placeholder={t("whatsappPlaceholder")} required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">{t("phoneLabel")} 2</label>
            <input type="tel" value={phone2} onChange={e => setPhone2(e.target.value)} className={inputCls} style={inputStyle} placeholder={t("whatsappPlaceholder")} />
          </div>
        </div>

        {/* ── WhatsApp (required) ── */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5 block">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{color:"hsl(142 60% 42%)"}}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.554 4.12 1.523 5.85L.057 23.426a.5.5 0 00.617.617l5.57-1.466A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.967 0-3.807-.535-5.388-1.467l-.385-.228-3.996 1.052 1.052-3.892-.25-.397A9.955 9.955 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            {t("whatsappField")} *
          </label>
          <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)}
            className={inputCls} style={inputStyle} placeholder={t("whatsappPlaceholder")} required />
        </div>

        {/* ── Instagram ── */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5 block">
            <Instagram className="w-4 h-4 text-primary" />
            Instagram hesabı
            <span className="text-xs text-muted-foreground font-normal">(İstəyə görə)</span>
          </label>
          <input
            type="text"
            value={instagram}
            onChange={e => setInstagram(e.target.value)}
            className={inputCls}
            style={inputStyle}
            placeholder="@hesabiniz və ya https://instagram.com/hesabiniz"
          />
        </div>

        {/* ── Price ── */}
        {showMinMax ? (
          /* Min/Max qiymət — bu kateqoriyalar üçün */
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {isVenue ? t("minSeatPrice") : "Minimum qiymət (₼)"} *
              </label>
              <input type="number" value={form.price_min} onChange={e => setForm({...form, price_min: e.target.value})}
                className={inputCls} style={inputStyle} placeholder={isVenue ? "50" : "200"} min="0" required />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {isVenue ? t("maxSeatPrice") : "Maksimum qiymət (₼)"}
                <span className="text-xs text-muted-foreground ml-1">(İstəyə görə)</span>
              </label>
              <input type="number" value={form.price_max} onChange={e => setForm({...form, price_max: e.target.value})}
                className={inputCls} style={inputStyle} placeholder={isVenue ? "150" : "1500"} min="0" />
            </div>
          </div>
        ) : (
          /* Konkret qiymət — digər kateqoriyalar üçün */
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Qiymət (₼) *
              <span className="text-xs text-muted-foreground font-normal ml-1">(Konkret məbləğ)</span>
            </label>
            <input
              type="number"
              value={form.price_min}
              onChange={e => setForm({...form, price_min: e.target.value})}
              className={inputCls}
              style={inputStyle}
              placeholder="Məs: 150"
              min="0"
              required={!!form.category}
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              💡 Xidmətinizin başlanğıc qiymətini daxil edin
            </p>
          </div>
        )}

        {/* ── Location — yalnız müvafiq kateqoriyalar üçün ── */}
        {showLocation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Şəhər</label>
              <div className="relative">
                <select value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                  className={`${inputCls} appearance-none`} style={inputStyle}>
                  <option value="">{t("select")}</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            {form.location === "Bakı" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Rayon</label>
                <div className="relative">
                  <select value={district} onChange={e => setDistrict(e.target.value)}
                    className={`${inputCls} appearance-none`} style={inputStyle}>
                    <option value="">{t("select")}</option>
                    {bakuDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Address + Map ── */}
        {showAddress && (
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5 block">
              <MapPin className="w-4 h-4 text-primary" />
              Google Maps linki
              <span className="text-xs text-muted-foreground font-normal">(tövsiyə olunur)</span>
            </label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
              className={inputCls} style={inputStyle}
              placeholder="Google Maps linkini yapışdırın — maps.google.com/..." />
            <p className="text-xs text-muted-foreground mt-1.5">
              💡 {t("mapHint")}
            </p>
            {address && (
              <div className="mt-3 rounded-xl overflow-hidden border border-border">
                {mapSrc ? (
                  <>
                    <iframe title="map-preview" width="100%" height="200"
                      style={{ border: 0, display: "block" }} loading="lazy"
                      allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                      src={mapSrc} />
                    <div className="px-3 py-2 flex items-center justify-between border-t border-border"
                      style={{ background: "hsl(28 35% 95%)" }}>
                      <span className="text-xs text-muted-foreground truncate max-w-[60%]">{address}</span>
                      <a href={mapsExternalHref} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 hover:underline">
                        <ExternalLink className="w-3 h-3" /> Google Maps-da Bax
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex items-center gap-3" style={{ background: "hsl(28 35% 95%)" }}>
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{address}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Google Maps linki tanınmadı</p>
                    </div>
                    <a href={mapsExternalHref} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 whitespace-nowrap hover:underline">
                      <ExternalLink className="w-3 h-3" /> Aç
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Venue specific ── */}
        {isVenue && (
          <>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Qonaq sayı</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Minimum</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={e => setCapacity(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="50"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Maksimum</label>
                  <input
                    type="number"
                    value={capacityMax}
                    onChange={e => setCapacityMax(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl p-5" style={sectionStyle}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Mövcud xidmətlər</label>
                  <div className="space-y-2">
                    {venueAmenities.map(a => (
                      <label key={a} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer select-none">
                        <input type="checkbox"
                          checked={selectedAmenities.includes(a)}
                          onChange={() => toggleAmenity(a)}
                          className="w-4 h-4 rounded accent-primary" />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">Mətbəx</label>
                  <div className="space-y-2">
                    {cuisineTypes.map(c => (
                      <label key={c} className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer select-none">
                        <input type="checkbox"
                          checked={selectedCuisines.includes(c)}
                          onChange={() => toggleCuisine(c)}
                          className="w-4 h-4 rounded accent-primary" />
                        {c}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Menyu şəkilləri — yalnız toy/banket zalları üçün ── */}
        {showMenu && (
          <div className="rounded-xl p-5" style={sectionStyle}>
            <label className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2 block">
              <Image className="w-4 h-4 text-primary" />
              Menyu / Qiymət siyahısı şəkilləri
              <span className="text-xs text-muted-foreground font-normal">(İstəyə görə)</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Menyunuzu, qiymət siyahınızı və ya zal şəkillərini yükləyin. Müştərilər detallarda görə bilər. Bir neçə şəkil əlavə edə bilərsiniz.
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {menuImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeMenuImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 bg-foreground/70 text-background rounded-full flex items-center justify-center">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
                {menuUploading
                  ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  : <><Upload className="w-6 h-6 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">Şəkil əlavə et</span></>
                }
                <input type="file" accept="image/*" multiple onChange={handleMenuImageUpload} className="hidden" disabled={menuUploading} />
              </label>
            </div>
          </div>
        )}

        {/* ── Media ── */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Şəkillər və Videolar</label>
          <p className="text-xs text-muted-foreground mb-3">Şəkil (JPG, PNG) və video (MP4, MOV) yükləyə bilərsiniz. Maks: 500MB</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((media, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border">
                {isVideoFile(media)
                  ? <div className="w-full h-full bg-muted flex items-center justify-center relative">
                      <video src={media} className="w-full h-full object-cover" muted />
                      <Play className="absolute w-8 h-8 text-primary-foreground bg-primary/70 rounded-full p-1.5" />
                    </div>
                  : <img src={media} alt="" className="w-full h-full object-cover" />
                }
                <button type="button" onClick={() => removeMedia(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-foreground/70 text-background rounded-full flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <label className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors">
              <Upload className="w-6 h-6 text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground">{uploading ? "Yüklənir..." : t("addMedia")}</span>
              <input type="file" accept="image/*,video/mp4,video/quicktime,video/webm" multiple onChange={handleMediaUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="rounded-xl p-4 text-sm text-muted-foreground" style={sectionStyle}>
          <p>{t("formWarning")}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="rounded-xl" disabled={loading}>
            {loading ? t("submitting") : service ? t("saveService") : t("addServiceBtn")}
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>Ləğv Et</Button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;