import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FantasyWaiverRadar — Fantasy Waiver Wire Trending Players",
  description: "Track trending waiver wire players across NFL, NBA, MLB and NHL. See add rates, ownership percentages, and expert recommendations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
