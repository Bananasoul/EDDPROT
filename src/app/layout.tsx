import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/app-context";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "École du Dos — HSNE Eupen",
  description:
    "Plateforme intégrée de coordination du programme École du Dos — Hôpital Saint-Nicolas Eupen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppProvider>
          <AppShell>{children}</AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
