import "./globals.css";
import { PopupProvider } from "@/components/popups/PopupProvider";
import PopupRoot from "@/components/popups/PopupRoot";

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <PopupProvider>
          {children}
          <PopupRoot />
        </PopupProvider>
      </body>
    </html>
  );
}
