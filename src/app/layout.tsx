import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";
import { Toaster } from "@/components/ui/toast";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MAWJA — منصة التعليم الرقمي الرائدة في الجزائر",
    template: "%s | MAWJA",
  },
  description:
    "موجة هي منصة التعليم الرقمي الرائدة في الجزائر، تقدم دورات تدريبية احترافية في البرمجة، التصميم، والذكاء الاصطناعي مع مدربين خبراء.",
  keywords: [
    "تعليم إلكتروني الجزائر",
    "دورات برمجة الجزائر",
    "Next.js",
    "بريدي موب",
    "تطوير الويب",
    "تصميم واجهات",
    "MAWJA",
    "موجة",
  ],
  authors: [{ name: "MAWJA Team" }],
  creator: "MAWJA Education",
  metadataBase: new URL("https://mawja.edu.dz"),
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "https://mawja.edu.dz",
    title: "MAWJA — منصة التعليم الرقمي",
    description:
      "تعلّم مهارات المستقبل بأعلى المعايير العالمية ومع نخبة من المدربين الجزائريين.",
    siteName: "MAWJA",
  },
  twitter: {
    card: "summary_large_image",
    title: "MAWJA — منصة التعليم الرقمي",
    description: "تعلّم مهارات المستقبل بأعلى المعايير العالمية.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a66c2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={ibmPlexArabic.variable} suppressHydrationWarning>
      <body
        className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased selection:bg-primary/15 selection:text-primary"
        suppressHydrationWarning
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
