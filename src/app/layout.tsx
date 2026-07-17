import type { Metadata } from "next";
import "@frontend/styles/globals.css";

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
      <body className="bg-page font-sans text-body antialiased">
        {children}
      </body>
    </html>
  );
}
