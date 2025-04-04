import type { Metadata } from "next";
import "../styles/main.scss";

export const metadata: Metadata = {
  title: "MyNews App",
  description: "Your source for the latest news",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}