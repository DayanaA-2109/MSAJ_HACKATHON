// src/app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans_Tamil, Noto_Serif_Tamil } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TamilKeyboard from "@/components/TamilKeyboard";
import { AuthProvider } from "@/context/AuthContext";
import AuthGate from "@/components/AuthGate";

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-tamil",
  display: "swap",
});

const notoSerifTamil = Noto_Serif_Tamil({
  subsets: ["tamil"],
  weight: ["500", "600", "700"],
  variable: "--font-tamil-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "தமிழ்த் தடம் — வாய்மொழி வரலாற்றுக் காப்பகம்",
  description:
    "பெரியவர்களின் குரலில் தமிழ் மண்ணின் நினைவுகளைப் பாதுகாப்போம். விவசாயம், பண்டிகை, சமையல், வரலாறு, நாட்டுப்புறம் மற்றும் வாழ்வியல் வரலாற்று ஆவணம்.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ta"
      className={`${notoSansTamil.variable} ${notoSerifTamil.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FDF8EE] text-[#2B1810]">
        <AuthProvider>
          <AuthGate>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-[#8B1E1E] text-white px-4 py-2 rounded-md font-bold"
            >
              உள்ளடக்கத்திற்கு செல்க
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <TamilKeyboard />
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}
