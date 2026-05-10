import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSlider = () => {
  const { t } = useLanguage();
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
      title: t("slide1Title"),
      highlight: t("slide1High"),
      subtitle: t("slide1Sub"),
    },
    {
      image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
      title: t("slide2Title"),
      highlight: t("slide2High"),
      subtitle: t("slide2Sub"),
    },
    {
      image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200",
      title: t("slide3Title"),
      highlight: t("slide3High"),
      subtitle: t("slide3Sub"),
    },
    {
      image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200",
      title: t("slide4Title"),
      highlight: t("slide4High"),
      subtitle: t("slide4Sub"),
    },
  ];
  const [current, setCurrent] = useState(0);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/categories?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover scale-105"
            loading={i === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/30 to-background" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-3xl mx-auto">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="transition-all duration-700 absolute inset-0 flex flex-col items-center justify-center"
              style={{
                opacity: i === current ? 1 : 0,
                transform: i === current ? "translateY(0)" : "translateY(20px)",
                pointerEvents: i === current ? "auto" : "none",
              }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground mb-2 leading-tight drop-shadow-lg">
                {slide.title}
                <br />
                <span className="text-gradient-gold">{slide.highlight}</span>
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/80 font-light drop-shadow mb-8">
                {slide.subtitle}
              </p>
            </div>
          ))}

          {/* Search - always visible */}
          <div className="relative z-20 mt-[220px] md:mt-[240px]">
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
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              i === current ? "bg-primary w-8" : "bg-primary-foreground/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
