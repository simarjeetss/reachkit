import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReachKit.ai — AI-powered cold email outreach",
  description:
    "Create personalized campaigns, generate AI-written emails, and automate follow-ups with intelligent tracking and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased rk-noise" style={{ fontFamily: "var(--font-body)", background: "var(--rk-bg)", color: "var(--rk-text)" }}>
        {children}
      </body>
    </html>
  );
}
