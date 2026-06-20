import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "World Cup 2026 Tracker",
  description:
    "Real-time 2026 FIFA World Cup standings, fixtures and knockout bracket with Pacific air times.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <span className="dot" />
              <span>
                WORLD CUP 26
                <br />
                <small>Live Tracker · Canada · Mexico · USA</small>
              </span>
            </div>
            <Nav />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
