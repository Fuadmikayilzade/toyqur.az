import Navbar from "@/components/Navbar";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";
import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";

const posts = [
  {
    id: "1",
    titleKey: "blog1Title" as const,
    excerptKey: "blog1Excerpt" as const,
    tagKey: "blog1Tag" as const,
    date: "2026-03-15",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
  },
  {
    id: "2",
    titleKey: "blog2Title" as const,
    excerptKey: "blog2Excerpt" as const,
    tagKey: "blog2Tag" as const,
    date: "2026-03-01",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600",
  },
  {
    id: "3",
    titleKey: "blog3Title" as const,
    excerptKey: "blog3Excerpt" as const,
    tagKey: "blog3Tag" as const,
    date: "2026-02-20",
    image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600",
  },
  {
    id: "4",
    titleKey: "blog4Title" as const,
    excerptKey: "blog4Excerpt" as const,
    tagKey: "blog4Tag" as const,
    date: "2026-02-10",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600",
  },
];

const Blog = () => {
  const { t, lang } = useLanguage();
  useSEO({ title: "Blog" });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">Blog</h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">{t("blogSub")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {posts.map((post) => (
              <Link
                to={`/blog/${post.id}`}
                key={post.id}
                className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-all group block"
              >
                <div className="aspect-[16/9] overflow-hidden relative">
                  <img src={post.image} alt={t(post.titleKey)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                    {t(post.tagKey)}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.date).toLocaleDateString(lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <h2 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {t(post.titleKey)}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{t(post.excerptKey)}</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
                    {t("readMore")} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
