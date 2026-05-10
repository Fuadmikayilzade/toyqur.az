import { useSEO } from "@/hooks/useSEO";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { User, Phone, Mail, Lock, Save, Eye, EyeOff, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const { t } = useLanguage();
  const { user, profile, loading } = useAuth();
  useSEO({ title: t("profileTitle") });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, full_name: fullName.trim(), phone: phone.trim(), updated_at: new Date().toISOString() }, { onConflict: "user_id" });
    if (error) {
      toast.error(t("error") + ": " + error.message);
    } else {
      toast.success(t("profileUpdated"));
    }
    setSaving(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error(t("passNoMatch")); return; }
    if (newPassword.length < 6) { toast.error(t("passwordMinErr")); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(t("passwordChangeErr") + ": " + error.message);
    } else {
      toast.success(t("passwordChanged"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSavingPw(false);
  };

  const cardStyle = {
    background: "linear-gradient(160deg, hsl(30 42% 98%) 0%, hsl(24 35% 95%) 100%)",
    border: "1px solid hsl(25 28% 87%)",
    boxShadow: "0 2px 8px hsl(25 18% 75% / 0.18)",
  };

  const inputStyle = {
    background: "hsl(28 38% 97%)",
    border: "1px solid hsl(25 28% 86%)",
    color: "hsl(20 20% 18%)",
  };

  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="min-h-screen" style={{ background: "hsl(28 38% 98%)" }}>
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">{t("myProfile")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("profileManage")}</p>
          </div>

          {/* Account info banner */}
          <div className="rounded-2xl p-5 mb-6 flex items-center gap-4" style={cardStyle}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-serif font-bold"
              style={{ background: "hsl(25 30% 84%)", color: "hsl(20 25% 32%)" }}
            >
              {(profile?.full_name || user.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-foreground">{profile?.full_name || t("defaultUser")}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              {user.email_confirmed_at && (
                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                  <CheckCircle className="w-3 h-3" /> E-poçt təsdiqlənib
                </p>
              )}
            </div>
          </div>

          {/* Profile form */}
          <div className="rounded-2xl p-6 mb-6" style={cardStyle}>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t("personalInfo")}
            </h2>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("fullNameLabel")}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("phoneLabel")}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputCls}
                    style={inputStyle}
                    placeholder="+994 XX XXX XX XX"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("emailLabel")}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                    className={`${inputCls} opacity-60 cursor-not-allowed`}
                    style={inputStyle}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t("emailNote")}</p>
              </div>
              <Button type="submit" className="rounded-xl" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? t("saving") : t("saveChanges")}
              </Button>
            </form>
          </div>

          {/* Password change */}
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h2 className="text-lg font-serif font-semibold text-foreground mb-5 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              {t("changePassTitle")}
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("newPassLabel")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`${inputCls} pr-10`}
                    style={inputStyle}
                    placeholder="Ən azı 6 simvol"
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t("confirmPassLabel")}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`${inputCls} pr-10`}
                    style={inputStyle}
                    placeholder={t("confirmPassLabel")}
                    minLength={6}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Şifrələr uyğun gəlmir</p>
                )}
              </div>
              <Button type="submit" variant="outline" className="rounded-xl" disabled={savingPw}>
                <Lock className="w-4 h-4 mr-2" />
                {savingPw ? t("changing") : t("changePassTitle")}
              </Button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;