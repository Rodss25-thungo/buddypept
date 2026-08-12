import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontClass } from "../fonts";

/**
 * Root layout for the private admin tool.
 *
 * Separate from the public site's layout because /admin is never localized and
 * never indexed. It also skips the site header and footer: the footer carries
 * the public medical disclaimer and a nav bar aimed at readers, neither of
 * which belongs on an internal list of peptide requests.
 */

export const metadata: Metadata = {
  title: "Admin | BuddyPept",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US" className={`${fontClass} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
