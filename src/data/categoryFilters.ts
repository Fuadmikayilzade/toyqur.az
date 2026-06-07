// ── Kateqoriyaya görə filtrlər ─────────────────────────────────────────────
// Hər kateqoriya üçün həm ServiceForm-da (yerləşdirmə) həm də Categories-də (axtarış) istifadə olunur

export interface FilterOption {
  value: string;
  label: string;
}

export interface CategoryFilterField {
  key: string;           // meta-da saxlanılan açar
  label: string;         // UI-da göstərilən ad
  type: "select" | "multiselect" | "boolean" | "number_range" | "text";
  options?: FilterOption[];
  placeholder?: string;
  unit?: string;
}

// ── Foto/Video ──────────────────────────────────────────────────────────────
const photoVideoFilters: CategoryFilterField[] = [
  {
    key: "shooting_duration",
    label: "Çəkiliş müddəti",
    type: "select",
    options: [
      { value: "2", label: "2 saat" },
      { value: "4", label: "4 saat" },
      { value: "8", label: "8 saat (tam gün)" },
      { value: "custom", label: "Razılaşma ilə" },
    ],
  },
  {
    key: "package_type",
    label: "Paket növü",
    type: "multiselect",
    options: [
      { value: "photo_album", label: "Foto + Albom" },
      { value: "photo_video", label: "Foto + Video" },
      { value: "drone", label: "Drone çəkilişi" },
      { value: "reels", label: "Reels/Klip" },
      { value: "photo_only", label: "Yalnız foto" },
    ],
  },
  {
    key: "abroad_shooting",
    label: "Xaricdə çəkiliş",
    type: "boolean",
  },
];

// ── Tort & Xonça ────────────────────────────────────────────────────────────
const cakeFilters: CategoryFilterField[] = [
  {
    key: "guest_size",
    label: "Qonaq sayına görə",
    type: "select",
    options: [
      { value: "50", label: "50 nəfərə qədər" },
      { value: "100", label: "50–100 nəfər" },
      { value: "200", label: "100–200 nəfər" },
      { value: "300", label: "200–300 nəfər" },
      { value: "300+", label: "300+ nəfər" },
    ],
  },
  {
    key: "design_type",
    label: "Dizayn növü",
    type: "multiselect",
    options: [
      { value: "classic", label: "Klassik" },
      { value: "modern", label: "Müasir" },
      { value: "figurine", label: "Fiqurlu" },
      { value: "thematic", label: "Tematik" },
      { value: "naked_cake", label: "Naked Cake" },
    ],
  },
  {
    key: "delivery",
    label: "Çatdırılma",
    type: "boolean",
  },
];

const xoncaFilters: CategoryFilterField[] = [
  {
    key: "guest_size",
    label: "Qonaq sayına görə",
    type: "select",
    options: [
      { value: "50", label: "50 nəfərə qədər" },
      { value: "100", label: "50–100 nəfər" },
      { value: "200", label: "100–200 nəfər" },
      { value: "300+", label: "300+ nəfər" },
    ],
  },
  {
    key: "delivery",
    label: "Çatdırılma",
    type: "boolean",
  },
];

// ── Çiçək ───────────────────────────────────────────────────────────────────
const flowerFilters: CategoryFilterField[] = [
  {
    key: "flower_type",
    label: "Çiçək növü",
    type: "multiselect",
    options: [
      { value: "rose", label: "Gül" },
      { value: "peony", label: "Pion" },
      { value: "orchid", label: "Orkide" },
      { value: "tulip", label: "Laləçiçəyi" },
      { value: "mixed", label: "Qarışıq" },
    ],
  },
  {
    key: "color_tone",
    label: "Rəng tonu",
    type: "multiselect",
    options: [
      { value: "white", label: "Ağ" },
      { value: "pink", label: "Çəhrayı" },
      { value: "red", label: "Qırmızı" },
      { value: "lilac", label: "Lila" },
      { value: "mixed", label: "Qarışıq" },
    ],
  },
  {
    key: "delivery",
    label: "Çatdırılma",
    type: "boolean",
  },
];

// ── Geyim ───────────────────────────────────────────────────────────────────
const dressFilters: CategoryFilterField[] = [
  {
    key: "cut_style",
    label: "Kəsim",
    type: "select",
    options: [
      { value: "a_line", label: "A-line" },
      { value: "ballgown", label: "Ballgown" },
      { value: "mermaid", label: "Mermaid" },
      { value: "straight", label: "Düz" },
      { value: "mini", label: "Mini" },
    ],
  },
  {
    key: "color",
    label: "Rəng",
    type: "multiselect",
    options: [
      { value: "white", label: "Ağ" },
      { value: "cream", label: "Krem" },
      { value: "beige", label: "Bej" },
      { value: "colored", label: "Rəngli" },
    ],
  },
  {
    key: "service_type",
    label: "Xidmət növü",
    type: "select",
    options: [
      { value: "sale", label: "Satış" },
      { value: "rent", label: "Kirayə" },
      { value: "both", label: "Satış və Kirayə" },
    ],
  },
  {
    key: "tailoring",
    label: "Dikme xidməti",
    type: "boolean",
  },
];

const groomSuitFilters: CategoryFilterField[] = [
  {
    key: "color",
    label: "Rəng",
    type: "multiselect",
    options: [
      { value: "black", label: "Qara" },
      { value: "navy", label: "Tünd göy" },
      { value: "grey", label: "Boz" },
      { value: "white", label: "Ağ" },
      { value: "other", label: "Digər" },
    ],
  },
  {
    key: "service_type",
    label: "Xidmət növü",
    type: "select",
    options: [
      { value: "sale", label: "Satış" },
      { value: "rent", label: "Kirayə" },
      { value: "both", label: "Satış və Kirayə" },
    ],
  },
  {
    key: "tailoring",
    label: "Dikme xidməti",
    type: "boolean",
  },
];

// ── Gözəllik ────────────────────────────────────────────────────────────────
const beautyFilters: CategoryFilterField[] = [
  {
    key: "service_type",
    label: "Xidmət növü",
    type: "multiselect",
    options: [
      { value: "makeup", label: "Makiyaj" },
      { value: "hair", label: "Saç" },
      { value: "both", label: "Makiyaj + Saç" },
      { value: "nail", label: "Dırnaق" },
    ],
  },
  {
    key: "home_service",
    label: "Evdə xidmət",
    type: "boolean",
  },
  {
    key: "advance_booking",
    label: "Öncədən rezervasiya",
    type: "select",
    options: [
      { value: "1week", label: "1 həftə əvvəl" },
      { value: "1month", label: "1 ay əvvəl" },
      { value: "3months", label: "3 ay əvvəl" },
    ],
  },
];

const brideAssistantFilters: CategoryFilterField[] = [
  {
    key: "service_type",
    label: "Xidmət növü",
    type: "multiselect",
    options: [
      { value: "makeup", label: "Makiyaj" },
      { value: "hair", label: "Saç" },
      { value: "reels", label: "Reels çəkiliş" },
      { value: "coordination", label: "Koordinasiya" },
    ],
  },
  {
    key: "home_service",
    label: "Evdə xidmət",
    type: "boolean",
  },
];

// ── Musiqi/Əyləncə ──────────────────────────────────────────────────────────
const musicFilters: CategoryFilterField[] = [
  {
    key: "performance_duration",
    label: "Performans müddəti",
    type: "select",
    options: [
      { value: "1", label: "1 saat" },
      { value: "2", label: "2 saat" },
      { value: "4", label: "4 saat" },
      { value: "full_day", label: "Tam gün" },
    ],
  },
  {
    key: "repertoire",
    label: "Repertuar",
    type: "multiselect",
    options: [
      { value: "az", label: "Azərbaycan" },
      { value: "tr", label: "Türk" },
      { value: "ru", label: "Rus" },
      { value: "intl", label: "Beynəlxalq" },
      { value: "mixed", label: "Qarışıq" },
    ],
  },
  {
    key: "event_type",
    label: "Tədbirə gedir",
    type: "multiselect",
    options: [
      { value: "wedding", label: "Toy" },
      { value: "engagement", label: "Nişan" },
      { value: "birthday", label: "Ad günü" },
      { value: "corporate", label: "Korporativ" },
    ],
  },
  {
    key: "own_equipment",
    label: "Avadanlıq özündə",
    type: "boolean",
  },
];

const djFilters: CategoryFilterField[] = [
  {
    key: "performance_duration",
    label: "Performans müddəti",
    type: "select",
    options: [
      { value: "2", label: "2 saat" },
      { value: "4", label: "4 saat" },
      { value: "full_day", label: "Tam gün" },
    ],
  },
  {
    key: "repertoire",
    label: "Repertuar",
    type: "multiselect",
    options: [
      { value: "az", label: "Azərbaycan" },
      { value: "tr", label: "Türk" },
      { value: "ru", label: "Rus" },
      { value: "intl", label: "Beynəlxalq" },
      { value: "mixed", label: "Qarışıq" },
    ],
  },
  {
    key: "own_equipment",
    label: "Avadanlıq özündə",
    type: "boolean",
  },
];

const mcFilters: CategoryFilterField[] = [
  {
    key: "performance_duration",
    label: "Performans müddəti",
    type: "select",
    options: [
      { value: "2", label: "2 saat" },
      { value: "4", label: "4 saat" },
      { value: "full_day", label: "Tam gün" },
    ],
  },
  {
    key: "repertoire",
    label: "Dillər",
    type: "multiselect",
    options: [
      { value: "az", label: "Azərbaycan" },
      { value: "ru", label: "Rus" },
      { value: "tr", label: "Türk" },
      { value: "en", label: "İngilis" },
    ],
  },
  {
    key: "event_type",
    label: "Tədbirə gedir",
    type: "multiselect",
    options: [
      { value: "wedding", label: "Toy" },
      { value: "engagement", label: "Nişan" },
      { value: "birthday", label: "Ad günü" },
      { value: "corporate", label: "Korporativ" },
    ],
  },
];

// ── Nəqliyyat ───────────────────────────────────────────────────────────────
const carFilters: CategoryFilterField[] = [
  {
    key: "car_color",
    label: "Rəng",
    type: "select",
    options: [
      { value: "white", label: "Ağ" },
      { value: "black", label: "Qara" },
      { value: "other", label: "Digər" },
    ],
  },
  {
    key: "rental_duration",
    label: "Kirayə müddəti",
    type: "select",
    options: [
      { value: "2", label: "2 saat" },
      { value: "4", label: "4 saat" },
      { value: "full_day", label: "Tam gün" },
    ],
  },
  {
    key: "decoration_included",
    label: "Bəzək daxil",
    type: "boolean",
  },
];

// ── Dekor ───────────────────────────────────────────────────────────────────
const decorFilters: CategoryFilterField[] = [
  {
    key: "style",
    label: "Üslub",
    type: "multiselect",
    options: [
      { value: "classic", label: "Klassik" },
      { value: "modern", label: "Müasir" },
      { value: "boho", label: "Boho" },
      { value: "luxury", label: "Lüks" },
      { value: "rustic", label: "Rustik" },
    ],
  },
  {
    key: "service_scope",
    label: "Xidmət həcmi",
    type: "select",
    options: [
      { value: "full", label: "Tam dekor" },
      { value: "partial", label: "Qismən dekor" },
      { value: "consultation", label: "Konsultasiya" },
    ],
  },
  {
    key: "live_flowers",
    label: "Canlı çiçək",
    type: "boolean",
  },
];

// ── Dəvətnamə ───────────────────────────────────────────────────────────────
const invitationFilters: CategoryFilterField[] = [
  {
    key: "format",
    label: "Format",
    type: "select",
    options: [
      { value: "print", label: "Çap" },
      { value: "digital", label: "Rəqəmsal" },
      { value: "both", label: "Çap + Rəqəmsal" },
    ],
  },
  {
    key: "design_type",
    label: "Dizayn",
    type: "select",
    options: [
      { value: "template", label: "Hazır şablon" },
      { value: "custom", label: "Fərdi dizayn" },
    ],
  },
  {
    key: "languages",
    label: "Dillər",
    type: "multiselect",
    options: [
      { value: "az", label: "Azərbaycan" },
      { value: "ru", label: "Rus" },
      { value: "en", label: "İngilis" },
    ],
  },
];

// ── Bütün kateqoriyaların filtr xəritəsi ──────────────────────────────────
export const CATEGORY_FILTERS: Record<string, CategoryFilterField[]> = {
  photographer: photoVideoFilters,
  videographer: photoVideoFilters,
  mobilograf: photoVideoFilters,
  cake: cakeFilters,
  xonca: xoncaFilters,
  buket: flowerFilters,
  "gelinlik-buketi": flowerFilters,
  dress: dressFilters,
  "groom-suit": groomSuitFilters,
  "beauty-salon": beautyFilters,
  "bride-assistant": brideAssistantFilters,
  music: musicFilters,
  singer: musicFilters,
  "dance-group": musicFilters,
  dj: djFilters,
  mc: mcFilters,
  car: carFilters,
  decoration: decorFilters,
  invitation: invitationFilters,
};

// ── Meta string-ə çevirmə (ServiceForm üçün) ─────────────────────────────
export function buildFilterMeta(category: string, filterValues: Record<string, string | string[] | boolean>): string {
  const fields = CATEGORY_FILTERS[category] || [];
  const lines: string[] = [];

  for (const field of fields) {
    const val = filterValues[field.key];
    if (val === undefined || val === null || val === "" || val === false) continue;
    if (Array.isArray(val) && val.length === 0) continue;

    if (typeof val === "boolean" && val) {
      lines.push(`Filter_${field.key}: bəli`);
    } else if (Array.isArray(val)) {
      lines.push(`Filter_${field.key}: ${val.join("||")}`);
    } else {
      lines.push(`Filter_${field.key}: ${val}`);
    }
  }
  return lines.join("\n");
}

// ── Meta string-dən oxuma (ServiceForm parse üçün) ─────────────────────────
export function parseFilterMeta(description: string | null, category: string): Record<string, string | string[] | boolean> {
  if (!description) return {};
  const fields = CATEGORY_FILTERS[category] || [];
  const result: Record<string, string | string[] | boolean> = {};

  for (const field of fields) {
    const regex = new RegExp(`Filter_${field.key}: (.+)`);
    const match = description.match(regex);
    if (!match) continue;
    const raw = match[1].trim();

    if (field.type === "boolean") {
      result[field.key] = raw === "bəli";
    } else if (field.type === "multiselect") {
      result[field.key] = raw.split("||").map(s => s.trim()).filter(Boolean);
    } else {
      result[field.key] = raw;
    }
  }
  return result;
}

// ── Filtrlənmiş axtarış üçün match yoxlaması (Categories.tsx üçün) ─────────
export function matchesCategoryFilters(
  description: string | null,
  category: string,
  activeFilters: Record<string, string | string[] | boolean>
): boolean {
  if (!description) return true;
  const savedFilters = parseFilterMeta(description, category);

  for (const [key, activeVal] of Object.entries(activeFilters)) {
    if (!activeVal || (Array.isArray(activeVal) && activeVal.length === 0)) continue;

    const savedVal = savedFilters[key];
    if (savedVal === undefined) continue; // saved-da yoxdursa, keç

    if (typeof activeVal === "boolean") {
      if (activeVal && savedVal !== true) return false;
    } else if (Array.isArray(activeVal)) {
      // multiselect: heç olmasa biri uyğun gəlsin
      const savedArr = Array.isArray(savedVal) ? savedVal : [savedVal as string];
      const hasMatch = activeVal.some(v => savedArr.includes(v));
      if (!hasMatch) return false;
    } else {
      if (String(savedVal) !== String(activeVal)) return false;
    }
  }
  return true;
}
