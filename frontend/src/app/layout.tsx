import "./globals.css";
import "./globals.scss";

import { PopupProvider } from "@/components/popups/PopupProvider";
import PopupRoot from "@/components/popups/PopupRoot";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ReactNode } from "react";

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var key = "qc_theme";
    var stored = localStorage.getItem(key);
    var theme =
      stored === "dark" || stored === "light"
        ? stored
        : window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    var root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
  } catch (e) {}
})();
`;

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          <PopupProvider>
            {children}
            <PopupRoot />
          </PopupProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
