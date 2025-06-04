import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";

const dmSans = Mulish({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agri",
  description: "Created by Team 050: Medha, Vani, Kathy, Kevin!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>{children}</body>
    </html>
  );
}
