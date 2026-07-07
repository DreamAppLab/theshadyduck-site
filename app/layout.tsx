import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Shady Duck",
  description: "Track sightings of The Shady Duck around the world.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;700&family=Courier+Prime&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
