import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SproutBook",
    template: "%s · SproutBook",
  },
  description: "Capture your baby's journey with AI-powered recaps and family sharing.",
  icons: {
    icon: [
      { url: "/assets/favicon.png", type: "image/png", sizes: "48x48" },
    ],
    shortcut: [
      { url: "/assets/favicon.png", type: "image/png" },
    ],
    apple: [
      { url: "/assets/icon.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
