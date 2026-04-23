import type { Metadata } from "next";
import { Inter, Lora, Shantell_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { MotionProvider } from "@/components/motion-provider";
import { DebugDialog } from "@/components/DebugDialog";

const loraHeading = Lora({ subsets: ["latin"], variable: "--font-heading" });

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const shantellSans = Shantell_Sans({
  subsets: ["latin"],
  variable: "--font-cursive",
});

export const metadata: Metadata = {
  title: "Space Outer",
  description: "Math Reviews",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        loraHeading.variable,
        shantellSans.variable,
      )}
    >
      <body
        className={cn(
          "bg-background min-h-full flex flex-col",
          // "p-8"
        )}
      >
        <MotionProvider>{children}</MotionProvider>
        <DebugDialog />
      </body>
    </html>
  );
}
