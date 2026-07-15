import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Khan Dry Fruit",
  description: "Premium Afghan dry fruits in Duisburg",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
