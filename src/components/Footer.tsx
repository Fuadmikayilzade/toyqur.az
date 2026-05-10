import { Heart, Phone, Mail, MapPin, MessageCircle, Headphones, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage, type Lang } from "@/contexts/LanguageContext";

const PHONE = "+994 10 419 53 44";
const WA_NUMBER = "994104195344";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

const Footer = () => {
  const { lang, setLang, t } = useLanguage();

  return (
    <footer className="border-t border-border" style={{ background: "hsl(24 32% 95%)" }}>
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <span className="text-lg font-serif font-bold">ToyQur<span className="text-primary">.az</span></span>
            </div>
            <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
              {t("heroSub")}
            </p>
            <div className="flex gap-3">
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                style={{ background: "hsl(142 60% 42%)" }}>
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`}
                className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Şirkət */}
          <div>
            <h4 className="font-serif font-semibold mb-4 text-foreground">{t("about")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t("about")}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t("contact")}</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              <li>
                <Link to="/support" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Headphones className="w-3 h-3" /> {t("support")}
                </Link>
              </li>
              <li><Link to="/auth?mode=register" className="hover:text-primary transition-colors">{t("register")}</Link></li>
            </ul>
          </div>

          {/* Əlaqə */}
          <div>
            <h4 className="font-serif font-semibold mb-4 text-foreground">{t("contact")}</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="hover:text-primary transition-colors">{PHONE}</a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
                <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a href="mailto:info@toyqur.az" className="hover:text-primary transition-colors">info@toyqur.az</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span>{t("contactCity")}</span>
              </li>
            </ul>
          </div>

          {/* Dil seçici */}
          <div>
            <h4 className="font-serif font-semibold mb-4 text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Dil / Language
            </h4>
            <div className="flex flex-col gap-2">
              {LANGS.map(l => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all text-left"
                  style={{
                    background: l.code === lang ? "hsl(16 38% 44%)" : "hsl(25 28% 89%)",
                    color: l.code === lang ? "white" : "hsl(20 20% 30%)",
                    border: l.code === lang ? "1px solid hsl(16 38% 38%)" : "1px solid hsl(25 26% 83%)",
                  }}>
                  <span style={{ fontSize: 16 }}>{l.flag}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
