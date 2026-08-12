import { Geist, Geist_Mono } from "next/font/google";

/**
 * Shared between the two root layouts (the localized site and the admin tool).
 * Defined once here so next/font emits a single copy of each font rather than
 * one per layout.
 */

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const fontClass = `${geistSans.variable} ${geistMono.variable}`;
