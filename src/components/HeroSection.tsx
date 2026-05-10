import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-wedding.jpg";

const HeroSection = () => {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/categories?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Toy mərasimi"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/40 via-foreground/20 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto animate-fade-up">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground mb-4 leading-tight drop-shadow-lg">
            {t("heroLine1")}
            <br />
            <span className="text-gradient-gold">{t("heroLine2")}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 font-light drop-shadow">
            {t("heroSub")}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="glass rounded-full flex items-center p-2 shadow-xl">
              <Search className="w-5 h-5 text-muted-foreground ml-4" />
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm md:text-base"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-medium text-sm hover:opacity-90 transition-opacity"
              >
                {t("searchBtn")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
