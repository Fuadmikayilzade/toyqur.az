import { useSEO } from "@/hooks/useSEO";
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Mail, Lock, User, Eye, EyeOff, Check, X as XIcon, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type AuthMode = "login" | "register" | "forgot" | "reset";

const checkPassword = (pw: string) => ({
  min: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  lower: /[a-z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw),
});

const strength = (checks: ReturnType<typeof checkPassword>) => {
  const count = Object.values(checks).filter(Boolean).length;
  if (count <= 1) return 0;
  if (count === 2) return 1;
  if (count === 3) return 2;
  if (count === 4) return 3;
  return 4;
};

const Auth = () => {
  const { t } = useLanguage();
  useSEO({ title: t("login"), description: "ToyQur.az hesabınıza daxil olun və ya qeydiyyatdan keçin." });
  const [searchParams] = useSearchParams();
  const initialMode: AuthMode = searchParams.get("mode") === "register"
    ? "register"
    : searchParams.get("mode") === "reset"
    ? "reset"
    : "login";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isVendor, setIsVendor] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Detect Supabase password reset session from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setMode("reset");
    }
  }, []);

  const pwChecks = useMemo(() => checkPassword(password), [password]);
  const pwStrength = strength(pwChecks);
  const newPwChecks = useMemo(() => checkPassword(newPassword), [newPassword]);
  const newPwStrength = strength(newPwChecks);
  const strengthColors = ["#e24b4a", "#e24b4a", "#ef9f27", "#1d9e75", "#1d9e75"];
  const strengthLabels = [t("passWeak"), t("passWeak"), t("passMedium"), t("passStrong"), t("passVeryStrong")];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        toast.success("Şifrə yeniləmə linki e-poçtunuza göndərildi!");
        setMode("login");
      } else if (mode === "reset") {
        if (newPwStrength < 3) { toast.error("Şifrə kifayət qədər güclü deyil"); setLoading(false); return; }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast.success("Şifrəniz uğurla yeniləndi!");
        navigate("/");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Uğurla daxil oldunuz!");
        navigate("/");
      } else {
        if (!fullName.trim()) { toast.error("Ad və soyad daxil edin"); setLoading(false); return; }
        if (pwStrength < 3) { toast.error("Şifrə kifayət qədər güclü deyil"); setLoading(false); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName, role: isVendor ? "vendor" : "user" },
          },
        });
        if (error) throw error;
        toast.success("Qeydiyyat uğurlu oldu! E-poçtunuzu yoxlayın.");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth — vendor rolu searchParams-dan oxunur
  const handleGoogle = async () => {
    // isVendor seçimini localStorage-da saxla ki, callback-də istifadə edilsin
    if (isVendor) {
      localStorage.setItem("toyqur_google_role", "vendor");
    } else {
      localStorage.removeItem("toyqur_google_role");
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message || "Google ilə giriş mümkün olmadı");
  };

  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const inputStyle = { background: "hsl(28 38% 97%)", border: "1px solid hsl(25 28% 86%)", color: "hsl(20 20% 18%)" };

  const modeTitle = mode === "login" ? t("login")
    : mode === "register" ? t("register")
    : mode === "reset" ? "Yeni Şifrə Təyin Et"
    : t("resetPass");

  const modeSub = mode === "login" ? t("authLoginSub")
    : mode === "register" ? t("authRegisterSub")
    : mode === "reset" ? "Yeni şifrənizi daxil edin"
    : t("authForgotSub");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(160deg, hsl(28 40% 98%) 0%, hsl(22 35% 94%) 100%)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-7 h-7 text-primary fill-primary" />
            <span className="text-2xl font-serif font-bold">ToyQur<span className="text-primary">.az</span></span>
          </div>
          <h1 className="text-xl font-serif font-bold text-foreground">{modeTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">{modeSub}</p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: "hsl(30 42% 99%)", border: "1px solid hsl(25 28% 88%)", boxShadow: "0 4px 24px hsl(20 18% 72%/0.15)" }}
        >
          {/* Google button — only for login/register */}
          {(mode === "login" || mode === "register") && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-xl mb-4 flex items-center gap-2"
                onClick={handleGoogle}
              >
                <Chrome className="w-4 h-4" />
                {mode === "login" ? t("googleLogin") : t("googleRegister")}
              </Button>
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 text-muted-foreground" style={{ background: "hsl(30 42% 99%)" }}>
                    {t("orEmail")}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Vendor toggle */}
          {mode === "register" && (
            <div
              className="mb-5 p-3 rounded-xl flex items-center gap-3 cursor-pointer select-none"
              style={{ background: isVendor ? "hsl(16 38% 92%)" : "hsl(28 35% 94%)", border: `1px solid ${isVendor ? "hsl(16 38% 72%)" : "hsl(25 26% 86%)"}` }}
              onClick={() => setIsVendor(v => !v)}
            >
              <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                style={{ background: isVendor ? "hsl(16 38% 44%)" : "hsl(25 28% 82%)" }}>
                {isVendor && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm font-medium text-foreground">{t("asVendor")}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                  className={inputCls} style={inputStyle} placeholder={t("fullName")} required />
              </div>
            )}

            {/* Reset mode — only new password field */}
            {mode === "reset" ? (
              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className={`${inputCls} pr-10`}
                    style={inputStyle}
                    placeholder="Yeni şifrə"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="h-1.5 flex-1 rounded-full transition-colors"
                          style={{ background: i < newPwStrength ? strengthColors[newPwStrength] : "hsl(25 26% 86%)" }} />
                      ))}
                    </div>
                    <p className="text-xs font-medium" style={{ color: strengthColors[newPwStrength] }}>
                      {t("passStrength")}: {strengthLabels[newPwStrength]}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {mode !== "forgot" || mode === "forgot" ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className={inputCls} style={inputStyle} placeholder={t("email")} required />
                  </div>
                ) : null}

                {mode !== "forgot" && (
                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={`${inputCls} pr-10`}
                        style={inputStyle}
                        placeholder={t("password")}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password strength — register only */}
                    {mode === "register" && password.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex gap-1">
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} className="h-1.5 flex-1 rounded-full transition-colors"
                              style={{ background: i < pwStrength ? strengthColors[pwStrength] : "hsl(25 26% 86%)" }} />
                          ))}
                        </div>
                        <p className="text-xs font-medium" style={{ color: strengthColors[pwStrength] }}>
                          {t("passStrength")}: {strengthLabels[pwStrength]}
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {([
                            ["min", t("passMin")],
                            ["upper", t("passUpper")],
                            ["lower", t("passLower")],
                            ["number", t("passNumber")],
                            ["special", t("passSpecial")],
                          ] as [keyof typeof pwChecks, string][]).map(([key, label]) => (
                            <div key={key} className="flex items-center gap-2">
                              {pwChecks[key]
                                ? <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#1d9e75" }} />
                                : <XIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#e24b4a" }} />}
                              <span className="text-xs" style={{ color: pwChecks[key] ? "#1d9e75" : "hsl(20 15% 55%)" }}>{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {mode === "login" && (
              <div className="text-right">
                <button type="button" onClick={() => setMode("forgot")}
                  className="text-xs text-primary hover:underline">{t("forgotPass")}</button>
              </div>
            )}

            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? t("loading")
                : mode === "login" ? t("login")
                : mode === "register" ? t("register")
                : mode === "reset" ? "Şifrəni Yenilə"
                : t("sendReset")}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "login" ? (
              <>{t("noAccount")}{" "}
                <button onClick={() => setMode("register")} className="text-primary hover:underline font-medium">{t("register")}</button>
              </>
            ) : mode === "register" ? (
              <>{t("hasAccount")}{" "}
                <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">{t("login")}</button>
              </>
            ) : mode === "reset" ? (
              <button onClick={() => navigate("/")} className="text-primary hover:underline font-medium">Ana səhifəyə qayıt</button>
            ) : (
              <button onClick={() => setMode("login")} className="text-primary hover:underline font-medium">{t("back")}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;