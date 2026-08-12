import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import "../globals.css";
import { fontClass } from "../fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import {
  routing,
  localeLang,
  liveLocales,
  isLocaleLive,
  type Locale,
} from "@/i18n/routing";

/**
 * Root layout for the public site. `/admin` has its own root layout, because
 * it is an internal tool and stays English and unprefixed.
 */

/** Pre-renders every locale at build time instead of on first request. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("siteTitle"),
    description: t("siteDescription"),
    appleWebApp: {
      capable: true,
      title: "BuddyPept",
      statusBarStyle: "default",
    },
    alternates: {
      // Only translated locales are advertised to search engines. A locale
      // still holding English placeholder copy would otherwise be indexed as
      // duplicate English content under a Portuguese URL.
      languages: Object.fromEntries(
        liveLocales.map((l) => [
          localeLang[l],
          l === routing.defaultLocale ? "/" : `/${l}`,
        ])
      ),
    },
    // Keep draft locales out of the index entirely until their copy is real.
    ...(isLocaleLive(locale as Locale)
      ? {}
      : { robots: { index: false, follow: false } }),
  };
}

// Mobile-first: proper scaling on phones, plus a teal browser bar to match the
// brand on mobile.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d9488",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for the static rendering enabled by generateStaticParams above.
  setRequestLocale(locale);

  return (
    <html
      lang={localeLang[locale]}
      className={`${fontClass} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <NextIntlClientProvider>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  );
}
