import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ChevronDown, Menu, X, LogOut, LayoutDashboard, Shield, Headphones, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { categories } from "@/data/mockData";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const { user, role, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-serif font-bold text-foreground">
              ToyQur<span className="text-primary">.az</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">{t("home")}</Link>
            {/* Categories mega menu */}
            <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
              <Link to="/categories" className="flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-primary transition-colors py-2">
                {t("categories")}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
              </Link>

              {/* Mega dropdown */}
              {catOpen && (
              <div
                className="absolute top-full left-1/2 -translate-x-1/2 z-50 pt-1"
                style={{ minWidth: 560 }}
              >
                <div
                  className="rounded-2xl p-5 shadow-xl"
                  style={{
                    background: "hsl(30 42% 99%)",
                    border: "1px solid hsl(25 28% 88%)",
                    boxShadow: "0 8px 40px hsl(20 18% 60% / 0.18)",
                  }}
                >
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/categories?cat=${cat.id}`}
                        className="flex items-center px-3 py-2 rounded-xl transition-all duration-150 hover:bg-opacity-80"
                        style={{
                          background: "hsl(28 35% 95%)",
                          border: "1px solid hsl(25 26% 89%)",
                        }}
                      >
                        <span className="text-xs font-medium leading-tight truncate" style={{ color: "hsl(20 20% 25%)" }}>
                          {t(`cat.${cat.id}`) || cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="pt-3 border-t" style={{ borderColor: "hsl(25 26% 90%)" }}>
                    <Link
                      to="/categories"
                      className="flex items-center justify-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
                      style={{ color: "hsl(16 38% 44%)" }}
                    >
                      Bütün kateqoriyalara bax →
                    </Link>
                  </div>
                </div>
              </div>
              )}
            </div>
            <Link to="/about" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">{t("about")}</Link>
            <Link to="/blog" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">Blog</Link>
            <Link to="/contact" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors">{t("contact")}</Link>
            <Link to="/support" className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5" />{t("support")}
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {role === "admin" && (
                  <Button variant="ghost" size="sm" className="text-foreground/70" asChild>
                    <Link to="/admin"><Shield className="w-4 h-4 mr-1" />Admin</Link>
                  </Button>
                )}
                {role === "vendor" && (
                  <Button size="sm" asChild
                    className="text-white font-semibold"
                    style={{ background: "linear-gradient(135deg, hsl(16 38% 40%) 0%, hsl(20 45% 30%) 100%)", border: "none" }}>
                    <Link to="/vendor"><LayoutDashboard className="w-4 h-4 mr-1" />{t("dashboard")}</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-foreground/70" asChild>
                  <Link to="/favorites"><Heart className="w-4 h-4 mr-1" />{t("favorites")}</Link>
                </Button>
                <Button size="sm" asChild
                  className="font-semibold"
                  style={{ background: "hsl(25 30% 90%)", color: "hsl(20 20% 20%)", border: "1px solid hsl(25 28% 80%)" }}>
                  <Link to="/profile"><UserCircle className="w-4 h-4 mr-1" />{profile?.full_name || t("profile")}</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-1" />{t("logout")}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/auth?mode=login">{t("login")}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/auth?mode=register">{t("register")}</Link>
                </Button>
              </>
            )}
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-foreground">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary" onClick={() => setIsOpen(false)}>{t("home")}</Link>
              <Link to="/categories" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary" onClick={() => setIsOpen(false)}>{t("categories")}</Link>
              <Link to="/about" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary" onClick={() => setIsOpen(false)}>{t("about")}</Link>
              <Link to="/blog" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary" onClick={() => setIsOpen(false)}>Blog</Link>
              <Link to="/contact" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary" onClick={() => setIsOpen(false)}>{t("contact")}</Link>
              <Link to="/support" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary flex items-center gap-1" onClick={() => setIsOpen(false)}>
                <Headphones className="w-3.5 h-3.5" /> {t("support")}
              </Link>
              {user && (
                <Link to="/favorites" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary flex items-center gap-1" onClick={() => setIsOpen(false)}>
                  <Heart className="w-3.5 h-3.5" /> {t("favorites")}
                </Link>
              )}
              {user && (
                <Link to="/profile" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary flex items-center gap-1" onClick={() => setIsOpen(false)}>
                  <UserCircle className="w-3.5 h-3.5" /> {profile?.full_name || t("profile")}
                </Link>
              )}
              {user && role === "admin" && (
                <Link to="/admin" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary" onClick={() => setIsOpen(false)}>{t("adminPanel")}</Link>
              )}
              {user && role === "vendor" && (
                <Link to="/vendor" className="text-sm font-medium py-2 text-foreground/70 hover:text-primary" onClick={() => setIsOpen(false)}>{t("dashboard")}</Link>
              )}
              <hr className="border-border" />
              {user ? (
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">{profile?.full_name || user.email}</span>
                  <Button variant="outline" size="sm" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4 mr-1" /> {t("logout")}
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>{t("login")}</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link to="/auth?mode=register" onClick={() => setIsOpen(false)}>{t("register")}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;