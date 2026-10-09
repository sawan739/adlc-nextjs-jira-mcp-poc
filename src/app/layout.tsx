import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ADLC Learning POC",
  description: "Dummy Next.js project for learning an MCP-driven ADLC workflow",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
