import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const BASE_TITLE = "ToyQur.az — Azərbaycanın Toy Xidmətləri Platforması";
const BASE_DESC = "Azərbaycanın ən böyük toy xidmətləri platforması. Toy məkanları, fotoqraflar, gəlinlik, dekor, tort və daha çoxunu bir yerdə tapın.";
const BASE_IMAGE = "https://toyqur.az/og-image.jpg";

export const useSEO = ({ title, description, image, url }: SEOProps = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ToyQur.az` : BASE_TITLE;
    const metaDesc = description || BASE_DESC;
    const metaImage = image || BASE_IMAGE;

    // Page title
    document.title = fullTitle;

    // Helper to set or create meta tag
    const setMeta = (selector: string, content: string, attr = "content") => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        const attrName = selector.includes("og:") || selector.includes("twitter:")
          ? "property"
          : "name";
        el.setAttribute(attrName, selector.replace(/meta\[(?:name|property)="([^"]+)"\]/, "$1"));
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    // Standard meta
    setMeta('meta[name="description"]', metaDesc);

    // Open Graph
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', metaDesc);
    setMeta('meta[property="og:image"]', metaImage);
    setMeta('meta[property="og:type"]', "website");
    if (url) setMeta('meta[property="og:url"]', url);

    // Twitter
    setMeta('meta[name="twitter:card"]', "summary_large_image");
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', metaDesc);
    setMeta('meta[name="twitter:image"]', metaImage);
  }, [title, description, image, url]);
};
