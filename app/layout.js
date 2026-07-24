import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "IT FEST 6.0 — Human-Centered AI: Transforming the World with Integrity",
  description:
    "Festival teknologi oleh HIMTI & Prodi Teknik Informatika Universitas Paramadina. Hackathon, IoT, KTI, Talkshow, Expo, dan Fun Game — 27 Juli hingga 14 Oktober 2026.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
