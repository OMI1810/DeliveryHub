import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const JetBrainsFont = JetBrains_Mono({
  subsets: ["cyrillic", "latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "DeliveryHub — Доставка еды",
  description: "Сервис доставки еды из лучших ресторанов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={JetBrainsFont.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
