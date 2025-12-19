import "./global.css"
import type { Metadata } from "next";
// import Providers from "./provider";


import { config } from "@fortawesome/fontawesome-svg-core";
import '@fortawesome/fontawesome-svg-core/styles.css'
config.autoAddCss = false

// import { fas } from "@fortawesome/free-solid-svg-icons";
// import { far } from "@fortawesome/pro-regular-svg-icons";
// import { fal } from "@fortawesome/pro-light-svg-icons";
// library.add(fas, far, fal);

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} UI Dashboard`,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />

        {/* Google fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Montserrat:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>

      <body id="root">
        {/* <Providers> */}
          {children}
        {/* </Providers> */}
      </body>
    </html>
  );
}

