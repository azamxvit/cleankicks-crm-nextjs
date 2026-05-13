import { JetBrains_Mono, Onest } from "next/font/google";

import { ThemeProvider } from "@/components/layouts/ThemeProvider";

import "./globals.css";

const fontSans = Onest({
  variable: "--font-app-sans",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-app-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata = {
  title: "CleanKicks CRM",
  description: "Приёмка, статусы и выдача обуви в одной панели.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
