import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "EduYodha | Learn Smart. Achieve More.",
  description: "EduYodha is Karnataka\'s ultimate portal for KCET College Predictors, Option Entry Tools, VTU Announcements & Notes, and Premium Digital Courses.",
  keywords: ["KCET Predictor", "VTU Notes", "KCET Option Entry", "VTU Circulars", "Engineering Courses", "Karnataka Colleges", "KEA Cutoffs"],
  openGraph: {
    title: "EduYodha | KCET Predictors, VTU Notes & Courses",
    description: "An all-in-one educational platform offering college predictors, notes, blogs, and interactive learning assets.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} font-sans antialiased bg-slate-50 text-slate-900 dark:bg-[#09090b] dark:text-slate-100 min-h-screen flex flex-col transition-colors duration-300`}
      >
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

