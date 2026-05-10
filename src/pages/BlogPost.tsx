import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Calendar, ArrowLeft, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/contexts/LanguageContext";
import { useSEO } from "@/hooks/useSEO";

type BlogPostData = {
  titleKey: TranslationKey;
  date: string;
  image: string;
  author: string;
  contentKeys: TranslationKey[];
};

const blogPosts: Record<string, BlogPostData> = {
  "1": {
    titleKey: "blog1Title",
    date: "2026-03-15",
    author: "ToyQur Redaksiyası",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    contentKeys: ["bp1p1","bp1p2","bp1p3","bp1p4","bp1p5"],
  },
  "2": {
    titleKey: "blog2Title",
    date: "2026-03-01",
    author: "Aynur Həsənova",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1200",
    contentKeys: ["bp2p1","bp2p2","bp2p3","bp2p4","bp2p5"],
  },
  "3": {
    titleKey: "blog3Title",
    date: "2026-02-20",
    author: "Rəşad Əliyev",
    image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200",
    contentKeys: ["bp3p1","bp3p2","bp3p3","bp3p4","bp3p5","bp3p6"],
  },
  "4": {
    titleKey: "blog4Title",
    date: "2026-02-10",
    author: "Günel Məmmədova",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200",
    contentKeys: ["bp4p1","bp4p2","bp4p3","bp4p4","bp4p5","bp4p6"],
  },
};

const BlogPost = () => {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const post = id ? blogPosts[id] : null;
  useSEO({ title: post ? t(post.titleKey) : "Blog" });

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-24 pb-16 container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">{t("articleNotFound")}</p>
          <Link to="/blog" className="text-primary hover:underline mt-4 inline-block">{t("blogBack")}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <article className="pt-24 pb-16">
        <div className="w-full aspect-[21/9] max-h-[400px] overflow-hidden">
          <img src={post.image} alt={t(post.titleKey)} className="w-full h-full object-cover" />
        </div>

        <div className="container mx-auto px-4 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-8 mb-6">
            <ArrowLeft className="w-4 h-4" /> {t("blogBack")}
          </Link>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">{t(post.titleKey)}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(post.date).toLocaleDateString(
                lang === "ru" ? "ru-RU" : lang === "en" ? "en-US" : "az-AZ",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
          </div>

          <div className="prose prose-lg max-w-none">
            {post.contentKeys.map((key, i) => (
              <p key={i} className="text-foreground/80 leading-relaxed mb-5 text-base">{t(key)}</p>
            ))}
          </div>
        </div>
      </article>
      <Footer />
    </div>
  );
};

export default BlogPost;
