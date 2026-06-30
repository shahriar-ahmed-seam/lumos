/**
 * Curated cinematic imagery for Lumos marketing pages.
 *
 * All photos are hosted on Unsplash's CDN (images.unsplash.com) and used per the
 * Unsplash License. Photographer credit is kept alongside each asset and surfaced
 * in the page footer. No Unsplash API key is required at runtime — URLs are static.
 */

export interface Photo {
  /** Full CDN url with sizing params. */
  url: string;
  /** Photographer display name. */
  credit: string;
  /** Photographer Unsplash profile. */
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

/** Unique photographer credits for the footer attribution block. */
export const PHOTO_CREDITS: Photo[] = [HERO, SHOWCASE, ACCENT, CTA_BAND].filter(
  (photo, index, all) => all.findIndex((p) => p.credit === photo.credit) === index
);
