import type { Metadata } from "next";
import { CONTACT } from "@/lib/contact";
import { absoluteUrl, SITE_NAME, SITE_URL } from "@/lib/site";

export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 140;
const SHARE_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "MarketClock emblem: a clock face with a rising bar chart above the MarketClock wordmark",
};
const SUFFIX = ` | ${SITE_NAME}`;

export const marketTitle = (code: string) => `${code} Holidays, Trading Hours and Status`;
export const marketYearTitle = (code: string, year: number) =>
  `${code} Holidays ${year}: Closures and Early Closes`;
export const holidaysYearTitle = (year: number) => `Stock Market Holidays ${year}: 30 Exchanges`;

export function fullTitle(title: string): string {
  return title.includes(SITE_NAME) ? title : `${title}${SUFFIX}`;
}

export function pageMetadata({
  title,
  description,
  path,
  index = true,
}: {
  title: string;
  description: string;
  path: string;
  index?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle(title),
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle(title),
      description,
      images: [SHARE_IMAGE.url],
    },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}

export function breadcrumbs(items: readonly (readonly [string, string])[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"] as const, ...items].map(([name, path], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: absoluteUrl(path),
    })),
  };
}

export function siteGraph(description: string) {
  const author = {
    "@type": "Person",
    "@id": `${SITE_URL}/#author`,
    name: "Syed Ahmer Shah",
    url: CONTACT.website,
  };
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description,
        inLanguage: "en",
        publisher: { "@id": author["@id"] },
      },
      author,
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: SITE_URL,
        description,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: { "@id": author["@id"] },
        sameAs: [CONTACT.github],
      },
    ],
  };
}
