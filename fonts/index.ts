import localFont from "next/font/local";

export const fontSatoshi = localFont({
  src: [
    {
      path: "./Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Satoshi-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-satoshi",
});
