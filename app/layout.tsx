import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IgnAIte | 生きたい生き方を実現しよう、AIで",
  description: "認知科学プロコーチとAIコンサルタントが理想の働き方と収益化に伴走するIgnAIteのランディングページです。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
