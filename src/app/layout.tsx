import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Seller Cost Calculator — Amazon, Flipkart, Meesho | India",
  description:
    "Free e-commerce seller cost & profit calculator for Indian marketplaces. Calculate GST, marketplace fees, shipping costs, and net profit for Amazon, Flipkart, and Meesho sellers. Download PDF invoice.",
  keywords: [
    "seller cost calculator",
    "amazon seller calculator india",
    "flipkart seller calculator",
    "meesho seller calculator",
    "ecommerce profit calculator",
    "GST calculator india",
    "marketplace fee calculator",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
