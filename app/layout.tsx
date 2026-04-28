import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Durand Manutention — Lecture intelligente de plans",
  description:
    "Démonstrateur IA Durand Manutention : extraction automatique des cartouches, nomenclatures, cotations et révisions de plans techniques (manutention & process du vrac) grâce à Mistral OCR.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
