export interface Photo {
  url: string;
  credit: string;
  creditUrl: string;
}

const base = (id: string, w = 2400) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${w}&auto=format&fit=crop`;

export const HERO: Photo = {
  url: base("1620641788421-7a1c342ea42e", 2880),
  credit: "Milad Fakurian",
  creditUrl: "https://unsplash.com/@fakurian",
};

export const SHOWCASE: Photo = {
  url: base("1554668048-5055c5654bbc"),
  credit: "Pawel Czerwinski",
  creditUrl: "https://unsplash.com/@pawel_czerwinski",
};

export const ACCENT: Photo = {
  url: base("1635776062360-af423602aff3"),
  credit: "MagicPattern",
  creditUrl: "https://unsplash.com/@magicpattern",
};

export const CTA_BAND: Photo = {
  url: base("1613327986042-63d4425a1a5d", 2880),
  credit: "Pawel Czerwinski",
  creditUrl: "https://unsplash.com/@pawel_czerwinski",
};

export const PHOTO_CREDITS: Photo[] = [HERO, SHOWCASE, ACCENT, CTA_BAND].filter(
  (photo, index, all) => all.findIndex((p) => p.credit === photo.credit) === index
);
