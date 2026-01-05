import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ui/ClientLayout";

export const metadata: Metadata = {
  title: "AlcoLab",
  description: "Análise de bebidas alcoólicas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={"antialiased min-h-dvh bg-background text-foreground pt-12"}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}