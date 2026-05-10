export interface Category {
  id: string;
  name: string;
  emoji: string;
  icon: string;
  count: number;
  group?: string;
  svgIcon?: string;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  location: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  image: string;
  vendor: string;
  featured: boolean;
  description: string;
  images: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

export const categories: Category[] = [
  // Məkanlar qrupu
  { id: "wedding-hall", name: "Toy zalları", emoji: "🏛️", icon: "Building2", count: 0, group: "Məkanlar" },
  { id: "banquet-hall", name: "Banket zalları", emoji: "🏰", icon: "Building2", count: 0, group: "Məkanlar" },
  // Digər kateqoriyalar
  { id: "photographer", name: "Fotoqraf", emoji: "📸", icon: "Camera", count: 0 },
  { id: "videographer", name: "Videoqraf", emoji: "🎬", icon: "Video", count: 0 },
  { id: "cake", name: "Tort", emoji: "🎂", icon: "Cake", count: 0 },
  { id: "xonca", name: "Xonça", emoji: "🧺", icon: "Gift", count: 0 },
  { id: "invitation", name: "Dəvətnamə", emoji: "💌", icon: "Mail", count: 0 },
  { id: "mc", name: "Aparıcı", emoji: "🎤", icon: "Mic", count: 0 },
  { id: "car", name: "Toy maşınları", emoji: "🚗", icon: "Car", count: 0 },
  { id: "decoration", name: "Dekor & Dizayn", emoji: "🎨", icon: "Flower2", count: 0 },
  { id: "music", name: "Canlı musiqi qrupu", emoji: "🎵", icon: "Music", count: 0 },
  { id: "dress", name: "Gəlinlik", emoji: "👰", icon: "Shirt", count: 0 },
  { id: "groom-suit", name: "Bəy geyimləri", emoji: "🤵", icon: "Shirt", count: 0 },
  { id: "dj", name: "DJ", emoji: "🎧", icon: "Disc3", count: 0 },
  { id: "singer", name: "Müğənni", emoji: "🎶", icon: "Mic", count: 0 },
  { id: "dance-group", name: "Rəqs qrupu", emoji: "💃", icon: "Music", count: 0 },
  { id: "beauty-salon", name: "Gözəllik salonu", emoji: "💄", icon: "Sparkles", count: 0 },
  { id: "kids-animator", name: "Uşaq animatorları", emoji: "🎪", icon: "PartyPopper", count: 0 },
  { id: "bride-assistant", name: "Bride Assistant", emoji: "👗", icon: "UserHeart", count: 0 },
];

export const featuredListings: Listing[] = [
  {
    id: "1",
    title: "Fairmont Baku",
    category: "wedding-hall",
    location: "Bakı",
    priceRange: "₼5,000 - ₼15,000",
    rating: 4.9,
    reviewCount: 127,
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600",
    vendor: "Fairmont Hotels",
    featured: true,
    description: "Bakının ən prestijli toy məkanlarından biri. Möhtəşəm panoramik mənzərə və premium xidmət.",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
      "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800",
    ],
  },
  {
    id: "2",
    title: "Studio Araz Photography",
    category: "photographer",
    location: "Bakı",
    priceRange: "₼800 - ₼3,000",
    rating: 4.8,
    reviewCount: 89,
    image: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600",
    vendor: "Araz Məmmədov",
    featured: true,
    description: "Peşəkar toy fotoqrafiyası. 10 ildən artıq təcrübə ilə xüsusi anlarınızı əbədiləşdiririk.",
    images: [
      "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
    ],
  },
  {
    id: "3",
    title: "Sweet Dreams Cake Studio",
    category: "cake",
    location: "Bakı",
    priceRange: "₼200 - ₼1,500",
    rating: 4.7,
    reviewCount: 64,
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=600",
    vendor: "Leyla Həsənova",
    featured: true,
    description: "Xüsusi dizaynlı toy tortları. Hər dad və üsluba uyğun tort hazırlayırıq.",
    images: [
      "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800",
      "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=800",
    ],
  },
  {
    id: "4",
    title: "Royal Decor Azerbaijan",
    category: "decoration",
    location: "Bakı",
    priceRange: "₼1,000 - ₼5,000",
    rating: 4.9,
    reviewCount: 102,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    vendor: "Royal Group",
    featured: true,
    description: "Premium toy dekorasiyası. Arzularınızı gerçəkliyə çeviririk.",
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"],
  },
  {
    id: "5",
    title: "Elegant Wedding Cars",
    category: "car",
    location: "Bakı",
    priceRange: "₼300 - ₼2,000",
    rating: 4.6,
    reviewCount: 45,
    image: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=600",
    vendor: "Elegant Cars",
    featured: true,
    description: "Lüks toy avtomobilləri. Rolls Royce, Mercedes, BMW və daha çoxu.",
    images: ["https://images.unsplash.com/photo-1549924231-f129b911e442?w=800"],
  },
  {
    id: "6",
    title: "Nigar Bridal Studio",
    category: "dress",
    location: "Bakı",
    priceRange: "₼500 - ₼5,000",
    rating: 4.8,
    reviewCount: 78,
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=600",
    vendor: "Nigar Fashion",
    featured: true,
    description: "Eksklüziv gəlinlik kolleksiyası. İtaliya və Fransa brendləri.",
    images: ["https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=800"],
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Aynur & Rəşad",
    text: "ToyQur.az sayəsində bütün toy xidmətlərini bir yerdən tapdıq. Hər şey mükəmməl keçdi!",
    rating: 5,
    avatar: "A",
  },
  {
    id: "2",
    name: "Günel & Tural",
    text: "Fotoqrafı və dekoratoru buradan seçdik. Nəticə gözləntilərimizi aşdı. Təşəkkürlər!",
    rating: 5,
    avatar: "G",
  },
  {
    id: "3",
    name: "Səbinə & Elvin",
    text: "Çox rahat platforma. Qiymətləri müqayisə etmək və rəyləri oxumaq çox kömək etdi.",
    rating: 5,
    avatar: "S",
  },
];
