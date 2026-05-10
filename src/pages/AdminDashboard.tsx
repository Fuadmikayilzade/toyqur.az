import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Check, X, Eye, Users, ShoppingBag, Calendar, BarChart3,
  ChevronDown, ChevronUp, Image as ImageIcon, Trash2, Search, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/mockData";

interface Service {
  id: string;
  title: string;
  category: string;
  location: string | null;
  is_approved: boolean | null;
  created_at: string;
  vendor_id: string;
  price_min: number | null;
  price_max: number | null;
  description: string | null;
  images: string[] | null;
  approved_at: string | null;
  listing_code: string | null;
}

interface Booking {
  id: string;
  status: string;
  event_date: string | null;
  created_at: string;
  service_id: string;
  user_id: string;
}

const extractContactInfo = (desc: string | null) => {
  if (!desc) return null;
  const sep = desc.indexOf("\n---\n");
  if (sep === -1) return null;
  return desc.slice(sep + 5).split("\n").filter((l) => l.trim()).join("\n");
};

const extractCleanDescription = (desc: string | null): string => {
  if (!desc) return "";
  const sep = desc.indexOf("\n---\n");
  return sep === -1 ? desc : desc.slice(0, sep).trim();
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}.${mm}.${yy}`;
};

const AdminDashboard = () => {
  const { user, role, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "bookings" | "users">("overview");
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [codeSearch, setCodeSearch] = useState("");

  useEffect(() => {
    if (role === "admin") fetchData();
  }, [role]);

  const fetchData = async () => {
    setLoadingData(true);
    const [{ data: svc }, { data: bk }, { count }] = await Promise.all([
      supabase.from("services").select("*").order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);
    setServices((svc as Service[]) || []);
    setBookings((bk as Booking[]) || []);
    setUserCount(count || 0);
    setLoadingData(false);
  };

  const approveService = async (id: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("services").update({ is_approved: true, approved_at: now }).eq("id", id);
    if (error) { toast.error("Xəta baş verdi"); return; }
    toast.success("Xidmət təsdiqləndi");
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, is_approved: true, approved_at: now } : s));
  };

  const rejectService = async (id: string) => {
    const { error } = await supabase.from("services").update({ is_approved: false, approved_at: null }).eq("id", id);
    if (error) { toast.error("Xəta baş verdi"); return; }
    toast.success("Xidmət rədd edildi");
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, is_approved: false, approved_at: null } : s));
  };

  const deleteService = async (id: string) => {
    if (!confirm("Bu xidməti silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.")) return;
    setDeletingId(id);
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error("Silmə zamanı xəta baş verdi"); setDeletingId(null); return; }
    toast.success("Xidmət silindi");
    setServices((prev) => prev.filter((s) => s.id !== id));
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  const pendingServices = services.filter((s) => !s.is_approved);
  const approvedServices = services.filter((s) => s.is_approved);

  const stats = [
    { label: "Ümumi", value: services.length, icon: ShoppingBag, color: "text-primary" },
    { label: "Gözləyir", value: pendingServices.length, icon: Eye, color: "text-amber-600" },
    { label: "Təsdiqlənib", value: approvedServices.length, icon: Check, color: "text-green-600" },
    { label: "İstifadəçi", value: userCount, icon: Users, color: "text-primary" },
    { label: "Rezerv", value: bookings.length, icon: Calendar, color: "text-primary" },
  ];

  const tabs = [
    { id: "overview" as const, label: "İcmal", icon: BarChart3 },
    { id: "services" as const, label: "Xidmətlər", icon: ShoppingBag },
    { id: "bookings" as const, label: "Rezerv", icon: Calendar },
    { id: "users" as const, label: "İstifadəçi", icon: Users },
  ];

  const getCatName = (catId: string) => categories.find((c) => c.id === catId)?.name ?? catId;

  const cs = {
    background: "linear-gradient(160deg, hsl(30 42% 98%) 0%, hsl(24 35% 95%) 100%)",
    border: "1px solid hsl(25 28% 87%)",
  };

  const ServiceRow = ({ s }: { s: Service }) => {
    const contactInfo = extractContactInfo(s.description);
    const cleanDesc = extractCleanDescription(s.description);
    const isExpanded = expandedService === s.id;

    return (
      <div className="p-3 sm:p-4 rounded-xl" style={cs}>
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="font-medium text-foreground text-sm">{s.title}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${s.is_approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {s.is_approved ? "Təsdiqlənib" : "Gözləyir"}
              </span>
              {s.listing_code && (
                <span className="text-xs px-2 py-0.5 rounded-full font-mono flex items-center gap-1" style={{ background: "hsl(25 30% 88%)", color: "hsl(20 25% 32%)" }}>
                  <Hash className="w-3 h-3" />{s.listing_code}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{getCatName(s.category)} · {s.location || "—"}</p>
            {s.price_min && (
              <p className="text-xs text-foreground mt-0.5">
                min ₼{s.price_min}{s.price_max ? ` — max ₼${s.price_max}` : ""}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">Yerləşdirildi: {formatDate(s.created_at)}</p>
            {s.is_approved && s.approved_at && (
              <p className="text-xs text-green-600">Təsdiqləndi: {formatDate(s.approved_at)}</p>
            )}
          </div>

          {/* Action buttons — wrap on mobile */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setExpandedService(isExpanded ? null : s.id)}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {!s.is_approved && (
              <Button size="sm" onClick={() => approveService(s.id)} className="rounded-lg h-8 px-2 text-xs">
                <Check className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Təsdiqlə</span>
              </Button>
            )}

            {!s.is_approved && (
              <Button size="sm" variant="outline" onClick={() => rejectService(s.id)} className="rounded-lg h-8 px-2 text-xs">
                <X className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Rədd et</span>
              </Button>
            )}

            {s.is_approved && (
              <Button size="sm" variant="outline" onClick={() => rejectService(s.id)} className="rounded-lg h-8 px-2 text-xs">
                <X className="w-3.5 h-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Geri al</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteService(s.id)}
              disabled={deletingId === s.id}
              className="rounded-lg h-8 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden sm:inline">{deletingId === s.id ? "Silinir..." : "Sil"}</span>
            </Button>
          </div>
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border space-y-3">
            {cleanDesc && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Təsvir</p>
                <p className="text-xs text-muted-foreground whitespace-pre-line">{cleanDesc}</p>
              </div>
            )}
            {contactInfo && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1">Əlaqə</p>
                <p className="text-xs text-muted-foreground whitespace-pre-line">{contactInfo}</p>
              </div>
            )}
            {s.images && s.images.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" /> Şəkillər ({s.images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {s.images.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer"
                      className="aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen" style={{ background: "hsl(28 38% 98%)" }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          <div className="mb-6">
            <h1 className="text-2xl font-serif font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm mt-0.5">ToyQur.az idarəetmə paneli</p>
          </div>

          {/* Tabs — scrollable on mobile */}
          <div className="overflow-x-auto mb-6" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-1 p-1 rounded-xl w-max min-w-full sm:w-fit" style={{ background: "hsl(25 30% 91%)" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
                  style={
                    activeTab === tab.id
                      ? { background: "hsl(30 42% 98%)", color: "hsl(20 20% 18%)", boxShadow: "0 1px 3px hsl(25 18% 74% / 0.4)" }
                      : { color: "hsl(20 15% 52%)" }
                  }
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loadingData ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div>
                  {/* Stats grid — 2 cols on mobile, 5 on desktop */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {stats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl p-4" style={cs}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-muted-foreground leading-tight">{stat.label}</span>
                          <stat.icon className={`w-4 h-4 flex-shrink-0 ${stat.color}`} />
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {pendingServices.length > 0 ? (
                    <div className="rounded-2xl p-4 sm:p-6" style={cs}>
                      <h3 className="text-base sm:text-lg font-serif font-semibold text-foreground mb-4">
                        Təsdiq gözləyən ({pendingServices.length})
                      </h3>
                      <div className="space-y-3">
                        {pendingServices.map((s) => <ServiceRow key={s.id} s={s} />)}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl p-8 text-center" style={cs}>
                      <Check className="w-10 h-10 text-green-500 mx-auto mb-3" />
                      <p className="font-medium text-foreground">Gözləyən xidmət yoxdur</p>
                    </div>
                  )}
                </div>
              )}

              {/* SERVICES */}
              {activeTab === "services" && (
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2 rounded-xl px-3 flex-1 min-w-[180px]" style={{ background: "hsl(25 30% 93%)", border: "1px solid hsl(25 28% 87%)" }}>
                      <Hash className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <input
                        type="text"
                        placeholder="Elan kodu ilə axtar (6 rəqəm)..."
                        className="flex-1 bg-transparent py-2.5 focus:outline-none text-sm"
                        value={codeSearch}
                        onChange={(e) => setCodeSearch(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                      />
                      {codeSearch && (
                        <button onClick={() => setCodeSearch("")}><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>Ümumi: <b className="text-foreground">{services.length}</b></span>
                      <span>·</span>
                      <span className="text-green-600">Təsdiqlənmiş: <b>{approvedServices.length}</b></span>
                      <span>·</span>
                      <span className="text-amber-600">Gözləyən: <b>{pendingServices.length}</b></span>
                    </div>
                  </div>
                  {(() => {
                    const filtered = codeSearch.length > 0
                      ? services.filter((s) => s.listing_code?.includes(codeSearch))
                      : services;
                    return (
                      <div className="space-y-3">
                        {filtered.map((s) => <ServiceRow key={s.id} s={s} />)}
                        {filtered.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            {codeSearch ? `"${codeSearch}" kodlu elan tapılmadı` : "Heç bir xidmət yoxdur"}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* BOOKINGS */}
              {activeTab === "bookings" && (
                <div className="rounded-2xl overflow-hidden" style={cs}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[400px]">
                      <thead>
                        <tr className="border-b border-border" style={{ background: "hsl(25 30% 91%)" }}>
                          <th className="text-left p-3 font-medium text-foreground text-xs">ID</th>
                          <th className="text-left p-3 font-medium text-foreground text-xs">Status</th>
                          <th className="text-left p-3 font-medium text-foreground text-xs">Tarix</th>
                          <th className="text-left p-3 font-medium text-foreground text-xs">Yaradılıb</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => (
                          <tr key={b.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                            <td className="p-3 text-foreground font-mono text-xs">{b.id.slice(0, 8)}…</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                b.status === "confirmed" ? "bg-green-100 text-green-700"
                                  : b.status === "rejected" ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}>
                                {b.status === "pending" ? "Gözləyir" : b.status === "confirmed" ? "Təsdiqlənib" : "Rədd edilib"}
                              </span>
                            </td>
                            <td className="p-3 text-muted-foreground text-xs">{b.event_date || "—"}</td>
                            <td className="p-3 text-muted-foreground text-xs">{formatDate(b.created_at)}</td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Heç bir rezervasiya yoxdur</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* USERS */}
              {activeTab === "users" && (
                <div className="rounded-2xl p-8 text-center" style={cs}>
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-lg font-medium text-foreground mb-1">Ümumi {userCount} istifadəçi</p>
                  <p className="text-sm text-muted-foreground">İstifadəçi idarəetməsi genişləndirilə bilər</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
