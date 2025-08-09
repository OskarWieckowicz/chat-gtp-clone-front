import "@/styles/globals.css";
import * as React from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en" className="dark">
      <body className="bg-background text-foreground">
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
