import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hushh One Login",
  description: "Legacy profile management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts: Vend Sans + Saira */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Saira:ital,wght@0,100..900;1,100..900&family=Vend+Sans:ital,wght@0,300..700;1,300..700&display=swap"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
