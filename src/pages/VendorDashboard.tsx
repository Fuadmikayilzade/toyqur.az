import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VendorServices from "@/components/vendor/VendorServices";
import BrandSettings from "@/components/vendor/BrandSettings";
import { ShoppingBag, Store, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

type Tab = "services" | "brand";

const VendorDashboard = () => {
  const { user, role, loading, profile } = useAuth();
  const { t } = useLanguage();
  const tabs = [
    { id: "services" as const, label: t("myServices"), icon: ShoppingBag },
    { id: "brand" as const, label: t("store_settings"), icon: Store },
  ];
  const [activeTab, setActiveTab] = useState<Tab>("services");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (role !== "vendor") return <Navigate to="/" replace />;

  const profileComplete = !!(profile?.full_name?.trim() && profile?.phone?.trim());

  const cardStyle = {
    background: "linear-gradient(160deg, hsl(30 42% 98%) 0%, hsl(24 35% 95%) 100%)",
    border: "1px solid hsl(25 28% 87%)",
  };

  return (
    <div className="min-h-screen" style={{ background: "hsl(28 38% 98%)" }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">

          {/* Profile completion warning */}
          {!profileComplete && (
            <div className="mb-6 p-4 rounded-2xl flex items-start gap-3"
              style={{ background: "hsl(38 90% 94%)", border: "1px solid hsl(38 60% 78%)" }}>
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "hsl(38 70% 40%)" }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: "hsl(38 60% 30%)" }}>{t("profileWarningTitle")}</p>
                <p className="text-xs mt-0.5" style={{ color: "hsl(38 50% 40%)" }}>{t("profileWarningMsg")}</p>
              </div>
              <Button size="sm" className="rounded-xl flex-shrink-0" asChild>
                <Link to="/profile">{t("completeProfileBtn")}</Link>
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">{t("dashboard")}</h1>
              <p className="text-muted-foreground text-sm mt-0.5">{t("manageServices")}</p>
            </div>
            <Link
              to={`/store/${user.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all self-start"
              style={{ ...cardStyle, boxShadow: "0 1px 4px hsl(25 18% 78%/0.3)", color: "hsl(20 20% 25%)" }}
            >
              <Store className="w-4 h-4 text-primary" />
              {t("myStore")}
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto mb-8" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-1 p-1 rounded-xl w-max" style={{ background: "hsl(25 30% 91%)" }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
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

          {activeTab === "services" && <VendorServices profileComplete={profileComplete} />}
          {activeTab === "brand"    && <BrandSettings />}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
