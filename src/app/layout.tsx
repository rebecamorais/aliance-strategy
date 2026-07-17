import type { Metadata } from "next";
import "@frontend/styles/globals.css";
import { Footer } from "@/frontend/components/footer";

export const metadata: Metadata = {
  title: "AStrategy",
  description: "AStrategy Intelligence Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-page font-sans text-body antialiased min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
